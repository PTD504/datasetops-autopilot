import { TraceItem, AgentRun, AgentArtifact } from "../../../../types";

export interface DocumentSummary {
  document_id: string;
  filename: string;
  chunk_count?: number;
}

export interface SourceReportData {
  document_summaries?: DocumentSummary[];
  strong_sections?: string[];
  weak_sections?: string[];
  unsupported_content?: string[];
  coverage_by_category?: Record<string, { coverage_level: string; coverage_score: number }>;
  unsupported_categories?: string[];
  source_warnings?: string[];
  recommended_adjustments_to_plan?: string[];
  confidence_score?: number;
}

export function resolveSourceReportArtifact(traces: TraceItem[]): SourceReportData | null {
  const artifactItem = traces.find(
    (t) =>
      t.type === "artifact" &&
      (t.data as AgentArtifact).artifact_type === "source_understanding_report"
  );
  if (!artifactItem) return null;
  return (artifactItem.data as AgentArtifact).content_json as SourceReportData;
}

export function resolveSourceUnderstandingRun(traces: TraceItem[]): AgentRun | null {
  const runItem = traces.find(
    (t) =>
      t.type === "agent_run" &&
      ((t.data as AgentRun).agent_name.startsWith("SourceUnderstandingAgent") ||
       (t.data as AgentRun).agent_name === "SourceUnderstandingAgent")
  );
  if (!runItem) return null;
  return runItem.data as AgentRun;
}
