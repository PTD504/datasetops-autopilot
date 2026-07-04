import { WorkflowStatus } from "./types";

export interface WorkflowDerivedState {
  highlightedNodeId: string | null;
  shouldDimGraph: boolean;
  statusBadgeLabel?: string;
  isPaused: boolean;
  bannerTitle?: string;
  bannerDescription: string;
  bannerActionLabel?: string;
  bannerActionHref?: string;
  bannerType: "info" | "warning" | "success" | "running" | "none";
}

// Config type for workflow states
interface StateConfig {
  highlightedNodeId: string | null;
  shouldDimGraph: boolean;
  statusBadgeLabel?: string;
  isPaused: boolean;
  bannerTitle?: string;
  bannerDescription: string | ((context: { sampleCount: number }) => string);
  bannerActionLabel?: string;
  bannerActionHref?: string | ((projectId: string) => string);
  bannerType: "info" | "warning" | "success" | "running" | "none";
}

// Centered mapping for all workflow statuses
const STATE_CONFIG_REGISTRY: Record<WorkflowStatus, StateConfig> = {
  LOADING: {
    highlightedNodeId: null,
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Loading",
    bannerDescription: "Loading workflow state...",
    bannerType: "info",
  },
  CREATED: {
    highlightedNodeId: null,
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Initiated",
    bannerDescription: "Autopilot workflow initialized. Waiting for document input...",
    bannerType: "info",
  },
  FILES_UPLOADED: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Files Uploaded",
    bannerDescription: "Files received. Initializing preprocessing pipeline...",
    bannerType: "running",
  },
  PARSING: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Parsing uploaded source documents...",
    bannerType: "running",
  },
  PARSED: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Documents parsed. Preparing chunking slots...",
    bannerType: "running",
  },
  CHUNKING: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Document parser is splitting text into semantic chunks...",
    bannerType: "running",
  },
  CHUNKED: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Document chunking complete. Running vector embedding...",
    bannerType: "running",
  },
  EMBEDDING: {
    highlightedNodeId: "preprocessing",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Vector embedder is generating document text embeddings...",
    bannerType: "running",
  },
  SOURCE_ANALYZING: {
    highlightedNodeId: "source_understanding",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Source understanding analyst is scanning document coverage...",
    bannerType: "running",
  },
  SOURCE_ANALYZED: {
    highlightedNodeId: "source_understanding",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Source analyzed. Generating benchmark plan...",
    bannerType: "running",
  },
  PLANNING: {
    highlightedNodeId: "intake_planner",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Intake planner is drafting the evaluation plan...",
    bannerType: "running",
  },
  PLAN_READY: {
    highlightedNodeId: "intake_planner",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Benchmark plan draft compiled. Waiting for checkpoint...",
    bannerType: "running",
  },
  WAITING_FOR_PLAN_APPROVAL: {
    highlightedNodeId: "intake_planner",
    shouldDimGraph: true,
    statusBadgeLabel: "WAITING FOR REVIEW",
    isPaused: true,
    bannerTitle: "Workflow Paused",
    bannerDescription: "Benchmark plan is ready.",
    bannerActionLabel: "Review Plan",
    bannerActionHref: (projectId) => `/projects/${projectId}/plan`,
    bannerType: "warning",
  },
  PLAN_APPROVED: {
    highlightedNodeId: "intake_planner",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Plan approved. Benchmark generation starting...",
    bannerType: "running",
  },
  GENERATING: {
    highlightedNodeId: "generator",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Generator is producing benchmark samples...",
    bannerType: "running",
  },
  VALIDATING: {
    highlightedNodeId: "generator",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Generator is validating sample schema compliance...",
    bannerType: "running",
  },
  EVALUATING: {
    highlightedNodeId: "evaluator",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Quality evaluator is running RAG compliance checks...",
    bannerType: "running",
  },
  REPAIRING: {
    highlightedNodeId: "evaluator",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Quality evaluator has requested corrections. Repair loop active...",
    bannerType: "running",
  },
  WAITING_FOR_SAMPLE_REVIEW: {
    highlightedNodeId: "evaluator",
    shouldDimGraph: true,
    statusBadgeLabel: "WAITING FOR REVIEW",
    isPaused: true,
    bannerTitle: "Workflow Paused",
    bannerDescription: ({ sampleCount }) => `${sampleCount} samples require review.`,
    bannerActionLabel: "Review Samples",
    bannerActionHref: (projectId) => `/projects/${projectId}/samples`,
    bannerType: "warning",
  },
  EXPORTING: {
    highlightedNodeId: "exporter",
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Running",
    bannerDescription: "Export packager is compiling final dataset zip package...",
    bannerType: "running",
  },
  EXPORT_READY: {
    highlightedNodeId: "exporter",
    shouldDimGraph: false,
    statusBadgeLabel: "COMPLETE",
    isPaused: false,
    bannerTitle: "Workflow Complete",
    bannerDescription: "Package generated successfully.",
    bannerActionLabel: "Open Export Viewer",
    bannerActionHref: (projectId) => `/projects/${projectId}/export`,
    bannerType: "success",
  },
  DONE: {
    highlightedNodeId: "exporter",
    shouldDimGraph: false,
    statusBadgeLabel: "COMPLETE",
    isPaused: false,
    bannerTitle: "Workflow Complete",
    bannerDescription: "Package generated successfully.",
    bannerActionLabel: "Open Export Viewer",
    bannerActionHref: (projectId) => `/projects/${projectId}/export`,
    bannerType: "success",
  },
  FAILED: {
    highlightedNodeId: null,
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Failed",
    bannerDescription: "Workflow failed due to an error.",
    bannerType: "none",
  },
  CANCELLED: {
    highlightedNodeId: null,
    shouldDimGraph: false,
    isPaused: false,
    bannerTitle: "Cancelled",
    bannerDescription: "Workflow cancelled by user request.",
    bannerType: "none",
  },
};

/**
 * Derives UI attributes, banner content, highlighting, and actions based on the active workflow state.
 */
export function getWorkflowDerivedState(
  status: WorkflowStatus,
  projectId: string,
  sampleReviewCount: number = 3
): WorkflowDerivedState {
  // Gracefully fallback to LOADING configuration if not found
  const config = STATE_CONFIG_REGISTRY[status] || STATE_CONFIG_REGISTRY.LOADING;

  const description =
    typeof config.bannerDescription === "function"
      ? config.bannerDescription({ sampleCount: sampleReviewCount })
      : config.bannerDescription;

  const actionHref =
    typeof config.bannerActionHref === "function"
      ? config.bannerActionHref(projectId)
      : config.bannerActionHref;

  return {
    highlightedNodeId: config.highlightedNodeId,
    shouldDimGraph: config.shouldDimGraph,
    statusBadgeLabel: config.statusBadgeLabel,
    isPaused: config.isPaused,
    bannerTitle: config.bannerTitle,
    bannerDescription: description,
    bannerActionLabel: config.bannerActionLabel,
    bannerActionHref: actionHref,
    bannerType: config.bannerType,
  };
}
