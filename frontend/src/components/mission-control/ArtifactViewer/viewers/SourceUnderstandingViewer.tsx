import React from "react";
import { TraceItem } from "../../types";
import { 
  resolveSourceReportArtifact, 
  resolveSourceUnderstandingRun 
} from "./SourceUnderstandingViewer/utils/sourceReportResolver";
import SummarySection from "./SourceUnderstandingViewer/components/SummarySection";
import CoverageSection from "./SourceUnderstandingViewer/components/CoverageSection";
import WarningsSection from "./SourceUnderstandingViewer/components/WarningsSection";
import RecommendationsSection from "./SourceUnderstandingViewer/components/RecommendationsSection";

interface SourceUnderstandingViewerProps {
  projectId: string;
  workflowStatus: string;
  traces: TraceItem[];
}

export default function SourceUnderstandingViewer({
  projectId,
  workflowStatus,
  traces,
}: SourceUnderstandingViewerProps) {
  // Extract and resolve source report artifact and agent run from traces
  const reportData = resolveSourceReportArtifact(traces);
  const analysisRun = resolveSourceUnderstandingRun(traces);

  // Check if analysis is currently active
  const isAnalyzing = workflowStatus === "PREPROCESSING" || (analysisRun && analysisRun.status === "running");

  // Renders empty/loading state if data is not yet resolved
  if (!reportData) {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
            Analyzing Source Materials...
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
        <p className="text-xs text-slate-500 italic">
          No source analysis report is currently available for this project.
        </p>
      </div>
    );
  }

  // Derive agent run output summary
  const overallSummary = (analysisRun?.output_json as any)?.summary || analysisRun?.decision_summary || undefined;
  
  // Normalize run warnings to always be string[] or undefined
  let runWarnings: string[] | undefined = undefined;
  if (analysisRun?.warnings) {
    if (Array.isArray(analysisRun.warnings)) {
      runWarnings = analysisRun.warnings;
    } else if (typeof analysisRun.warnings === "string") {
      runWarnings = [analysisRun.warnings];
    }
  }

  return (
    <div className="flex flex-col gap-5 select-none text-left">
      {/* Overview subtitle description */}
      <div className="border-b border-white/[0.04] pb-4">
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This workspace displays the source documents analysis report, topic density mapping, source content gap analysis, and planning recommendations.
        </p>
      </div>

      {/* Main 2-column Analysis Report layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Column: Summary & Knowledge Coverage */}
        <div className="flex flex-col gap-5">
          <SummarySection 
            documents={reportData.document_summaries}
            confidenceScore={reportData.confidence_score}
            overallSummary={overallSummary}
          />
          <CoverageSection 
            strongSections={reportData.strong_sections}
            weakSections={reportData.weak_sections}
            unsupportedContent={reportData.unsupported_content}
          />
        </div>

        {/* Right Column: Insights & Recommendations */}
        <div className="flex flex-col gap-5">
          <WarningsSection 
            sourceWarnings={reportData.source_warnings}
            runWarnings={runWarnings}
          />
          <RecommendationsSection 
            recommendations={reportData.recommended_adjustments_to_plan}
          />
        </div>
      </div>
    </div>
  );
}
