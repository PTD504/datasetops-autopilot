import React from "react";
import { TraceItem } from "../../types";
import { 
  resolvePlanArtifact, 
  resolveAdjustmentsArtifact, 
  resolveSourceReportArtifact, 
  resolvePlannerRun 
} from "./IntakePlannerViewer/utils/planResolver";
import GoalSection from "./IntakePlannerViewer/components/GoalSection";
import DatasetSection from "./IntakePlannerViewer/components/DatasetSection";
import QualityRulesSection from "./IntakePlannerViewer/components/QualityRulesSection";
import DecisionsSection from "./IntakePlannerViewer/components/DecisionsSection";
import WarningsSection from "./IntakePlannerViewer/components/WarningsSection";

interface IntakePlannerViewerProps {
  projectId: string;
  workflowStatus: string;
  traces: TraceItem[];
}

export default function IntakePlannerViewer({
  projectId,
  workflowStatus,
  traces,
}: IntakePlannerViewerProps) {
  // Extract and resolve artifacts/run data from traces
  const planData = resolvePlanArtifact(traces);
  const adjustmentsData = resolveAdjustmentsArtifact(traces);
  const sourceReportData = resolveSourceReportArtifact(traces);
  const plannerRun = resolvePlannerRun(traces);

  // Check if planner agent is currently running or completed
  const isPlanning = workflowStatus === "PLANNING" || (plannerRun && plannerRun.status === "running");

  // Renders empty/loading state if plan data is not yet resolved
  if (!planData) {
    if (isPlanning) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
            Generating Benchmark Blueprint...
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
        <p className="text-xs text-slate-500 italic">
          No benchmark plan blueprint is currently available for this project.
        </p>
      </div>
    );
  }

  // Derive goal from run output if missing from the plan artifact payload
  const goal = (planData as any).goal || (plannerRun?.output_json as any)?.goal || undefined;

  return (
    <div className="flex flex-col gap-5 select-none text-left">
      {/* Overview subtitle description */}
      <div className="border-b border-white/[0.04] pb-4">
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This workspace displays the benchmark target sample size, topic distribution splits, quality rules, and scoping adjustments generated during the planning phase.
        </p>
      </div>

      {/* Main 2-column Blueprint layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Column: Scope, Dataset Distribution & Warnings */}
        <div className="flex flex-col gap-5">
          <GoalSection 
            goal={goal} 
            language={planData.language} 
            domain={planData.domain} 
          />
          <DatasetSection 
            totalCount={typeof planData.sample_count === "number" ? planData.sample_count : undefined}
            difficultyDistribution={planData.difficulty_distribution}
            categories={planData.categories}
            coverageByCategory={sourceReportData?.coverage_by_category}
          />
          <WarningsSection 
            warningsConsidered={adjustmentsData?.warnings_considered}
            warnings={planData.warnings}
          />
        </div>

        {/* Right Column: Rules & Scoping Decisions */}
        <div className="flex flex-col gap-5">
          <QualityRulesSection 
            rules={planData.quality_rules} 
          />
          <DecisionsSection 
            adjustments={adjustmentsData?.planning_adjustments}
          />
        </div>
      </div>
    </div>
  );
}
