export type WorkflowStatus =
  | "CREATED"
  | "FILES_UPLOADED"
  | "PARSING"
  | "PARSED"
  | "CHUNKING"
  | "CHUNKED"
  | "EMBEDDING"
  | "SOURCE_ANALYZING"
  | "SOURCE_ANALYZED"
  | "PLANNING"
  | "PLAN_READY"
  | "WAITING_FOR_PLAN_APPROVAL"
  | "PLAN_APPROVED"
  | "GENERATING"
  | "VALIDATING"
  | "EVALUATING"
  | "REPAIRING"
  | "WAITING_FOR_SAMPLE_REVIEW"
  | "EXPORTING"
  | "EXPORT_READY"
  | "DONE"
  | "FAILED"
  | "CANCELLED"
  | "LOADING";

export interface ToolCallLog {
  id: string;
  project_id: string;
  agent_run_id: string | null;
  tool_name: string;
  input_summary: string | null;
  output_summary: string | null;
  status: string; // 'success' | 'error'
  latency_ms: number | null;
  created_at: string;
}

export interface AgentRun {
  id: string;
  project_id: string;
  agent_name: string;
  status: string; // 'running' | 'completed' | 'failed'
  input_summary: string | null;
  decision_summary: string | null;
  output_json: Record<string, unknown> | null;
  warnings: string[] | string | null;
  confidence_score: number | null;
  started_at: string;
  completed_at: string | null;
  tool_calls?: ToolCallLog[];
}

export interface WorkflowEvent {
  id: string;
  project_id: string;
  event_type: string;
  message: string;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AgentArtifact {
  id: string;
  project_id: string;
  agent_run_id: string | null;
  artifact_type: string;
  title: string;
  summary: string | null;
  content_json: Record<string, unknown> | null;
  created_at: string;
}

export interface TraceItem {
  type: "workflow_event" | "agent_run" | "tool_call" | "artifact";
  timestamp: string;
  data: WorkflowEvent | AgentRun | ToolCallLog | AgentArtifact;
}

export interface RawTraceItem {
  id: string;
  agent_name?: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface UsageSummary {
  llm_mode: string;
  guardrails_enabled: boolean;
  budget_status: string; // 'ok' | 'warning' | 'exceeded'
  calls_used: number;
  attempted_calls?: number;
  failed_calls?: number;
  blocked_calls?: number;
  max_calls: number;
  total_tokens_used: number;
  max_total_tokens: number;
  estimated_cost_used: number;
  max_estimated_cost: number;
  cancel_requested?: boolean;
  last_error?: string | null;
}

// Domain Node configuration for Mission Control Graph Config
export interface AgentNodeConfig {
  id: string;
  role: string; // e.g. "Chunker", "Embedder", "Planner", "Generator", "Evaluator", "Exporter"
  label: string; // User friendly display name
  description: string;
  pipelineOrder: number;
  workflowStates: WorkflowStatus[]; // The states this agent is active in
  artifactIn: string[] | null; // Types of input artifacts it consumes
  artifactOut: string[] | null; // Types of output artifacts it produces
  isStage?: boolean;
}
