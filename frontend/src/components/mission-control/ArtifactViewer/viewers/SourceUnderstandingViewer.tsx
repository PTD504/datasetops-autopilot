import React, { useMemo } from "react";
import { TraceItem, AgentRun, AgentArtifact } from "../../types";
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

function SourceUnderstandingViewer({
  projectId,
  workflowStatus,
  traces,
}: SourceUnderstandingViewerProps) {
  // Extract and resolve source report artifact and agent run from traces
  const reportData = useMemo(() => resolveSourceReportArtifact(traces), [traces]);
  const analysisRun = useMemo(() => resolveSourceUnderstandingRun(traces), [traces]);

  // Check if analysis is currently active (prior to final report generation)
  const isAnalyzing = useMemo(() => {
    return (
      workflowStatus === "SOURCE_ANALYZING" || 
      workflowStatus === "SOURCE_ANALYZED" || 
      workflowStatus === "PLANNING" ||
      workflowStatus === "PLAN_READY" ||
      workflowStatus === "PREPROCESSING" || 
      (analysisRun && analysisRun.status === "running")
    );
  }, [workflowStatus, analysisRun]);

  // Derive agent run output summary
  const overallSummary = useMemo(() => {
    if (!analysisRun) return undefined;
    return (analysisRun.output_json as any)?.summary || analysisRun.decision_summary || undefined;
  }, [analysisRun]);

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
        {/* Left Column: Summary & Insights */}
        <div className="flex flex-col gap-5">
          <SummarySection 
            documents={reportData.document_summaries}
            confidenceScore={reportData.confidence_score}
            overallSummary={overallSummary}
            collapsible={true}
            defaultExpanded={true}
          />
          <WarningsSection 
            sourceWarnings={reportData.source_warnings}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>

        {/* Right Column: Knowledge Coverage Audit & Recommendations */}
        <div className="flex flex-col gap-5">
          <CoverageSection 
            strongSections={reportData.strong_sections}
            weakSections={reportData.weak_sections}
            unsupportedContent={reportData.unsupported_content}
            collapsible={true}
            defaultExpanded={true}
          />
          <RecommendationsSection 
            recommendations={reportData.recommended_adjustments_to_plan}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}

// Custom comparison function for React.memo to avoid re-renders caused by polling
const arePropsEqual = (prevProps: SourceUnderstandingViewerProps, nextProps: SourceUnderstandingViewerProps) => {
  if (prevProps.projectId !== nextProps.projectId) return false;
  if (prevProps.workflowStatus !== nextProps.workflowStatus) return false;

  const prevArtifact = prevProps.traces.find(
    (t) => t.type === "artifact" && (t.data as AgentArtifact).artifact_type === "source_understanding_report"
  );
  const nextArtifact = nextProps.traces.find(
    (t) => t.type === "artifact" && (t.data as AgentArtifact).artifact_type === "source_understanding_report"
  );

  const prevRun = prevProps.traces.find(
    (t) =>
      t.type === "agent_run" &&
      ((t.data as AgentRun).agent_name.startsWith("SourceUnderstandingAgent") ||
       (t.data as AgentRun).agent_name === "SourceUnderstandingAgent")
  );
  const nextRun = nextProps.traces.find(
    (t) =>
      t.type === "agent_run" &&
      ((t.data as AgentRun).agent_name.startsWith("SourceUnderstandingAgent") ||
       (t.data as AgentRun).agent_name === "SourceUnderstandingAgent")
  );

  // If presence of artifact changes, they are not equal
  if (!!prevArtifact !== !!nextArtifact) return false;
  if (prevArtifact && nextArtifact) {
    const prevArtData = prevArtifact.data as AgentArtifact;
    const nextArtData = nextArtifact.data as AgentArtifact;
    if (prevArtData.id !== nextArtData.id) return false;
    if (JSON.stringify(prevArtData.content_json) !== JSON.stringify(nextArtData.content_json)) return false;
  }

  // If presence of run changes, they are not equal
  if (!!prevRun !== !!nextRun) return false;
  if (prevRun && nextRun) {
    const prevRunData = prevRun.data as AgentRun;
    const nextRunData = nextRun.data as AgentRun;
    if (prevRunData.id !== nextRunData.id) return false;
    if (prevRunData.status !== nextRunData.status) return false;
    if (prevRunData.completed_at !== nextRunData.completed_at) return false;
    if (prevRunData.decision_summary !== nextRunData.decision_summary) return false;
    if (JSON.stringify(prevRunData.warnings) !== JSON.stringify(nextRunData.warnings)) return false;
    if (JSON.stringify(prevRunData.output_json) !== JSON.stringify(nextRunData.output_json)) return false;
  }

  return true;
};

export default React.memo(SourceUnderstandingViewer, arePropsEqual);

