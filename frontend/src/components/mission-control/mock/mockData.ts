import { 
  UsageSummary, 
  TraceItem, 
  RawTraceItem, 
  AgentArtifact,
  WorkflowStatus
} from "../types";

export const MOCK_PROJECT_ID = "mock-project-123";

export const MOCK_WORKFLOW_STATE: WorkflowStatus = "EVALUATING";

export const MOCK_USAGE_SUMMARY: UsageSummary = {
  llm_mode: "qwen-max",
  guardrails_enabled: true,
  budget_status: "ok",
  calls_used: 42,
  attempted_calls: 42,
  failed_calls: 0,
  blocked_calls: 0,
  max_calls: 150,
  total_tokens_used: 134200,
  max_total_tokens: 1000000,
  estimated_cost_used: 2.684,
  max_estimated_cost: 20.00,
  cancel_requested: false,
  last_error: null,
};

export const MOCK_ARTIFACTS: AgentArtifact[] = [
  {
    id: "art-chunk-1",
    project_id: MOCK_PROJECT_ID,
    agent_run_id: "run-chunk-1",
    artifact_type: "DocumentChunkCollection",
    title: "Semantic Text Chunks",
    summary: "Parsed 'refund_policy.md' and split it into 124 semantic paragraphs.",
    content_json: {
      total_chunks: 124,
      file_source: "refund_policy.md",
      average_token_length: 180,
    },
    created_at: "2026-07-03T11:00:15Z",
  },
  {
    id: "art-embed-1",
    project_id: MOCK_PROJECT_ID,
    agent_run_id: "run-embed-1",
    artifact_type: "VectorIndexReference",
    title: "pgvector Vector Index",
    summary: "Indexed 124 text chunks inside PostgreSQL database.",
    content_json: {
      indexed_chunks: 124,
      dimensions: 1536,
      index_type: "HNSW",
    },
    created_at: "2026-07-03T11:00:30Z",
  },
  {
    id: "art-source-1",
    project_id: MOCK_PROJECT_ID,
    agent_run_id: "run-source-1",
    artifact_type: "source_understanding_report",
    title: "Document Category Coverage Map",
    summary: "Identified high density of refund policies, warning for low density on subscription models.",
    content_json: {
      categories: [
        { name: "Refund Eligibility", density: "High", chunk_count: 52 },
        { name: "Cancellation Timeline", density: "Medium", chunk_count: 31 },
        { name: "Subscription Adjustments", density: "Low", chunk_count: 5 },
      ],
      warnings: ["Sparse context for subscription upgrading scenarios"],
    },
    created_at: "2026-07-03T11:00:48Z",
  },
  {
    id: "art-plan-1",
    project_id: MOCK_PROJECT_ID,
    agent_run_id: "run-plan-1",
    artifact_type: "approved_benchmark_plan",
    title: "RAG Evaluation Benchmark Plan",
    summary: "Plan approved to generate 30 QA pairs: 10 Easy, 10 Medium, 10 Hard.",
    content_json: {
      total_qa_pairs: 30,
      difficulty_split: { easy: 10, medium: 10, hard: 10 },
      categories: ["Refunds", "Cancellations", "Sub-adjustments"],
    },
    created_at: "2026-07-03T11:01:20Z",
  },
];

export const MOCK_TRACE_ITEMS: TraceItem[] = [
  {
    type: "workflow_event",
    timestamp: "2026-07-03T11:00:00Z",
    data: {
      id: "event-1",
      project_id: MOCK_PROJECT_ID,
      event_type: "workflow_started",
      message: "Autopilot workflow initiated for Project ID: " + MOCK_PROJECT_ID,
      event_metadata: { project_name: "Acme Refund Policy Evaluation" },
      created_at: "2026-07-03T11:00:00Z",
    },
  },
  {
    type: "agent_run",
    timestamp: "2026-07-03T11:00:15Z",
    data: {
      id: "run-chunk-1",
      project_id: MOCK_PROJECT_ID,
      agent_name: "DocumentChunker",
      status: "completed",
      input_summary: "Input file: refund_policy.md",
      decision_summary: "Split document into paragraphs using 500-token sliding window.",
      output_json: { total_chunks: 124 },
      warnings: null,
      confidence_score: 1.0,
      started_at: "2026-07-03T11:00:02Z",
      completed_at: "2026-07-03T11:00:15Z",
    },
  },
  {
    type: "agent_run",
    timestamp: "2026-07-03T11:00:30Z",
    data: {
      id: "run-embed-1",
      project_id: MOCK_PROJECT_ID,
      agent_name: "VectorEmbedder",
      status: "completed",
      input_summary: "Input: 124 text chunks",
      decision_summary: "Submit chunks to embedding endpoint and save to pgvector.",
      output_json: { database: "postgresql", entries: 124 },
      warnings: null,
      confidence_score: 1.0,
      started_at: "2026-07-03T11:00:16Z",
      completed_at: "2026-07-03T11:00:30Z",
    },
  },
  {
    type: "agent_run",
    timestamp: "2026-07-03T11:00:48Z",
    data: {
      id: "run-source-1",
      project_id: MOCK_PROJECT_ID,
      agent_name: "SourceUnderstandingAgent",
      status: "completed",
      input_summary: "Input vector mapping index reference",
      decision_summary: "Examine chunk density across core topics.",
      output_json: { coverage: 0.85 },
      warnings: ["Sparse subscription data found"],
      confidence_score: 0.88,
      started_at: "2026-07-03T11:00:31Z",
      completed_at: "2026-07-03T11:00:48Z",
    },
  },
  {
    type: "workflow_event",
    timestamp: "2026-07-03T11:00:50Z",
    data: {
      id: "event-2",
      project_id: MOCK_PROJECT_ID,
      event_type: "waiting_for_input",
      message: "Workflow paused at Intake Planner node: WAITING_FOR_PLAN_APPROVAL",
      event_metadata: null,
      created_at: "2026-07-03T11:00:50Z",
    },
  },
  {
    type: "agent_run",
    timestamp: "2026-07-03T11:01:20Z",
    data: {
      id: "run-plan-1",
      project_id: MOCK_PROJECT_ID,
      agent_name: "IntakePlannerAgent",
      status: "completed",
      input_summary: "Draft benchmark request + Source understanding report",
      decision_summary: "Formulate a benchmark plan covering 3 categories with difficulty split.",
      output_json: { target_samples: 30 },
      warnings: null,
      confidence_score: 0.94,
      started_at: "2026-07-03T11:00:52Z",
      completed_at: "2026-07-03T11:01:20Z",
    },
  },
  {
    type: "agent_run",
    timestamp: "2026-07-03T11:01:50Z",
    data: {
      id: "run-gen-1",
      project_id: MOCK_PROJECT_ID,
      agent_name: "BenchmarkGeneratorAgent",
      status: "completed",
      input_summary: "Approved Plan (30 QA pairs)",
      decision_summary: "Generate RAG questions, gold standard answers, and source context mappings.",
      output_json: { generated_samples: 30 },
      warnings: null,
      confidence_score: 0.92,
      started_at: "2026-07-03T11:01:21Z",
      completed_at: "2026-07-03T11:01:50Z",
    },
  },
];

export const MOCK_RAW_TRACES: RawTraceItem[] = [
  {
    id: "raw-t1",
    agent_name: "System",
    action: "start_source_analysis",
    created_at: "2026-07-03T11:00:00Z",
  },
  {
    id: "raw-t2",
    agent_name: "DocumentChunker",
    action: "parsing refund_policy.md",
    created_at: "2026-07-03T11:00:05Z",
  },
  {
    id: "raw-t3",
    agent_name: "DocumentChunker",
    action: "produced 124 text chunks",
    created_at: "2026-07-03T11:00:15Z",
  },
  {
    id: "raw-t4",
    agent_name: "VectorEmbedder",
    action: "submitting vector batches to database",
    created_at: "2026-07-03T11:00:20Z",
  },
  {
    id: "raw-t5",
    agent_name: "VectorEmbedder",
    action: "vector index mapped successfully",
    created_at: "2026-07-03T11:00:30Z",
  },
  {
    id: "raw-t6",
    agent_name: "SourceUnderstandingAgent",
    action: "start category density scanning",
    created_at: "2026-07-03T11:00:35Z",
  },
  {
    id: "raw-t7",
    agent_name: "SourceUnderstandingAgent",
    action: "warning: density low on subscription upgrading guidelines",
    created_at: "2026-07-03T11:00:45Z",
  },
  {
    id: "raw-t8",
    agent_name: "IntakePlannerAgent",
    action: "start_planning",
    created_at: "2026-07-03T11:00:52Z",
  },
  {
    id: "raw-t9",
    agent_name: "IntakePlannerAgent",
    action: "plan_created",
    created_at: "2026-07-03T11:01:00Z",
  },
];
