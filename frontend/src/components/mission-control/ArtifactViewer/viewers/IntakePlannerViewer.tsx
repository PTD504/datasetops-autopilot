import React, { useMemo } from "react";
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
import WarningsSection from "./IntakePlannerViewer/components/WarningsSection";
import { useMissionControlStore } from "../../store/useMissionControlStore";

interface IntakePlannerViewerProps {
  projectId: string;
  workflowStatus: string;
  traces: TraceItem[];
}

function IntakePlannerViewer({
  projectId,
  workflowStatus,
  traces,
}: IntakePlannerViewerProps) {
  const { setIsPlanReviewOpen, setSelectedNodeId } = useMissionControlStore();

  // Extract and resolve artifacts/run data from traces (memoized)
  const planData = useMemo(() => resolvePlanArtifact(traces), [traces]);
  const sourceReportData = useMemo(() => resolveSourceReportArtifact(traces), [traces]);
  const plannerRun = useMemo(() => resolvePlannerRun(traces), [traces]);

  // Check if planner agent is currently running or completed (memoized)
  const isPlanning = useMemo(() => {
    return workflowStatus === "PLANNING" || (plannerRun && plannerRun.status === "running");
  }, [workflowStatus, plannerRun]);

  // Derive goal from run output if missing from the plan artifact payload (memoized)
  const goal = useMemo(() => {
    if (!planData) return undefined;
    return (planData as any).goal || (plannerRun?.output_json as any)?.goal || undefined;
  }, [planData, plannerRun]);

  // Derive categories list (memoized)
  const categoriesList = useMemo(() => {
    if (!planData) return [];
    return Array.from(new Set([
      ...(planData.categories || []),
      ...(sourceReportData?.coverage_by_category ? Object.keys(sourceReportData.coverage_by_category) : [])
    ]));
  }, [planData, sourceReportData]);

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

  return (
    <div className="flex flex-col gap-5 select-none text-left">
      {/* Checkpoint Banner */}
      {workflowStatus === "WAITING_FOR_PLAN_APPROVAL" && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-250 flex items-center justify-between gap-3 shadow-md border-dashed">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-semibold text-slate-250">Human Checkpoint: Review, edit and approve the benchmark plan before generation begins.</span>
          </div>
          <button 
            onClick={() => {
              setIsPlanReviewOpen(true);
              setSelectedNodeId(null);
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)] active:scale-95 transition-transform"
          >
            Review & Edit Plan
          </button>
        </div>
      )}

      {/* Overview subtitle description */}
      <div className="border-b border-white/[0.04] pb-4">
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This workspace displays the benchmark target sample size, topic distribution splits, quality rules, and scoping adjustments generated during the planning phase.
        </p>
      </div>

      {/* Main 2-column Blueprint layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Column: Scope & Dataset Distribution */}
        <div className="flex flex-col gap-5">
          <GoalSection 
            goal={goal} 
            language={planData.language} 
            domain={planData.domain} 
            collapsible={true}
            defaultExpanded={true}
          />
          <DatasetSection 
            totalCount={typeof planData.sample_count === "number" ? planData.sample_count : undefined}
            difficultyDistribution={planData.difficulty_distribution}
            categories={categoriesList}
            coverageByCategory={sourceReportData?.coverage_by_category}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>

        {/* Right Column: Rules & Warnings */}
        <div className="flex flex-col gap-5">
          <QualityRulesSection 
            rules={planData.quality_rules} 
            collapsible={true}
            defaultExpanded={true}
          />
          <WarningsSection 
            warnings={planData.warnings}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}

// React.memo custom comparison to prevent unnecessary polling rerenders
const arePropsEqual = (prevProps: IntakePlannerViewerProps, nextProps: IntakePlannerViewerProps) => {
  if (prevProps.projectId !== nextProps.projectId) return false;
  if (prevProps.workflowStatus !== nextProps.workflowStatus) return false;

  const prevPlan = resolvePlanArtifact(prevProps.traces);
  const nextPlan = resolvePlanArtifact(nextProps.traces);
  if (JSON.stringify(prevPlan) !== JSON.stringify(nextPlan)) return false;

  const prevAdj = resolveAdjustmentsArtifact(prevProps.traces);
  const nextAdj = resolveAdjustmentsArtifact(nextProps.traces);
  if (JSON.stringify(prevAdj) !== JSON.stringify(nextAdj)) return false;

  const prevReport = resolveSourceReportArtifact(prevProps.traces);
  const nextReport = resolveSourceReportArtifact(nextProps.traces);
  if (JSON.stringify(prevReport) !== JSON.stringify(nextReport)) return false;

  const prevRun = resolvePlannerRun(prevProps.traces);
  const nextRun = resolvePlannerRun(nextProps.traces);
  if (prevRun?.status !== nextRun?.status) return false;

  return true;
};

export default React.memo(IntakePlannerViewer, arePropsEqual);

