import { TraceItem, AgentRun, AgentArtifact } from "../../../../types";

export interface PlanData {
  domain?: string;
  goal?: string;
  language?: string;
  sample_count?: number | { total: number; easy?: number; medium?: number; hard?: number };
  categories?: string[];
  difficulty_distribution?: { total: number; easy?: number; medium?: number; hard?: number };
  quality_rules?: string[];
  warnings?: string[];
}

export interface PlanningAdjustments {
  coverage_summary?: Record<string, { coverage_level: string; coverage_score: number }>;
  high_coverage_categories?: string[];
  low_coverage_categories?: string[];
  unsupported_categories?: string[];
  warnings_considered?: string[];
  planning_adjustments?: string[];
}

export interface SourceReport {
  document_summaries?: { document_id: string; filename: string; chunk_count: number }[];
  strong_sections?: string[];
  weak_sections?: string[];
  unsupported_content?: string[];
  coverage_by_category?: Record<string, { coverage_level: string; coverage_score: number; matching_chunk_ids?: string[]; matching_snippets?: string[] }>;
  unsupported_categories?: string[];
  source_warnings?: string[];
  recommended_adjustments_to_plan?: string[];
  confidence_score?: number;
}

export function resolvePlanArtifact(traces: TraceItem[]): PlanData | null {
  const artifactItem = traces.find(
    (t) =>
      t.type === "artifact" &&
      ((t.data as AgentArtifact).artifact_type === "approved_benchmark_plan" ||
        (t.data as AgentArtifact).artifact_type === "benchmark_plan_draft")
  );
  if (!artifactItem) return null;
  return (artifactItem.data as AgentArtifact).content_json as PlanData;
}

export function resolveAdjustmentsArtifact(traces: TraceItem[]): PlanningAdjustments | null {
  const artifactItem = traces.find(
    (t) =>
      t.type === "artifact" &&
      (t.data as AgentArtifact).artifact_type === "planning_adjustments"
  );
  if (!artifactItem) return null;
  return (artifactItem.data as AgentArtifact).content_json as PlanningAdjustments;
}

export function resolveSourceReportArtifact(traces: TraceItem[]): SourceReport | null {
  const artifactItem = traces.find(
    (t) =>
      t.type === "artifact" &&
      (t.data as AgentArtifact).artifact_type === "source_understanding_report"
  );
  if (!artifactItem) return null;
  return (artifactItem.data as AgentArtifact).content_json as SourceReport;
}

export function resolvePlannerRun(traces: TraceItem[]): AgentRun | null {
  const runItem = traces.find(
    (t) =>
      t.type === "agent_run" &&
      (t.data as AgentRun).agent_name === "IntakePlannerAgent"
  );
  if (!runItem) return null;
  return runItem.data as AgentRun;
}
