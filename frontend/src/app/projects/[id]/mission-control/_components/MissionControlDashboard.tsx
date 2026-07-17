import React, { useState, useEffect } from "react";
import { useMissionControlStore } from "../../../../../components/mission-control/store/useMissionControlStore";
import ControlHeader from "./ControlHeader";
import WorkspaceGrid from "./WorkspaceGrid";
import TelemetryCluster, { TelemetryMetric } from "./TelemetryCluster";

// Import new modular panel components
import DirectedWorkflowGraph from "../../../../../components/mission-control/graph/DirectedWorkflowGraph";
import TimelinePanel from "../../../../../components/mission-control/timeline/TimelinePanel";
import ConsolePanel from "../../../../../components/mission-control/console/ConsolePanel";
import WorkflowBanner from "../../../../../components/mission-control/WorkflowBanner";
import ArtifactViewer from "../../../../../components/mission-control/ArtifactViewer/ArtifactViewer";
import CompletionOverlay from "../../../../../components/mission-control/CompletionOverlay";
import PlanReviewDrawer from "../../../../../components/mission-control/plan-review/PlanReviewDrawer";
import { 
  WorkflowStatus, 
  TraceItem, 
  RawTraceItem, 
  UsageSummary,
  AgentArtifact
} from "../../../../../components/mission-control/types";

interface MissionControlDashboardProps {
  projectId: string;
  workflowStatus: WorkflowStatus;
  traces: TraceItem[];
  artifacts: AgentArtifact[];
  rawTraces: RawTraceItem[];
  usage: UsageSummary | null;
  loading: boolean;
  error: boolean;
  onStopWorkflow: () => void;
  onResumeWorkflow: () => Promise<void>;
}

export default function MissionControlDashboard({ 
  projectId,
  workflowStatus,
  traces,
  artifacts,
  rawTraces,
  usage,
  loading,
  error,
  onStopWorkflow,
  onResumeWorkflow,
}: MissionControlDashboardProps) {
  const {
    selectedNodeId,
    setSelectedNodeId,
    isPlanReviewOpen,
    setIsPlanReviewOpen,
  } = useMissionControlStore();

  const [samplesCount, setSamplesCount] = useState(3);
  const [isResuming, setIsResuming] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleResumeWorkflow = async () => {
    setIsResuming(true);
    try {
      await onResumeWorkflow();
      setToast({ message: "Workflow resumed. Continuing execution...", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to resume workflow.", type: "error" });
    } finally {
      setIsResuming(false);
    }
  };

  const activeWorkflowStatus = workflowStatus || "LOADING";
  const activeTraces = traces;
  const activeRawTraces = rawTraces;
  const activeUsage = usage;

  // Poll for samples count when waiting for sample review
  useEffect(() => {
    if (activeWorkflowStatus !== "WAITING_FOR_SAMPLE_REVIEW") return;

    let active = true;
    const fetchSamples = async () => {
      try {
        const apiUrl = "";
        const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples`);
        if (res.ok && active) {
          const data = await res.json();
          // Count samples that need human review (or are not approved)
          const pendingCount = data.filter((s: any) => s.status === "HUMAN_REVIEW" || s.status === "NEEDS_REVIEW" || s.status === "PENDING").length;
          setSamplesCount(pendingCount > 0 ? pendingCount : (data.length > 0 ? data.length : 3));
        }
      } catch (e) {
        console.error("Failed to fetch samples count", e);
      }
    };

    fetchSamples();
    const interval = setInterval(fetchSamples, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [projectId, activeWorkflowStatus]);

  const handleStopWorkflow = () => {
    onStopWorkflow();
  };

  // Map backend LLM usage into reusable TelemetryMetric shape
  const telemetryMetrics: TelemetryMetric[] = activeUsage ? [
    {
      id: "cost",
      label: "Est. Cost",
      value: `$${activeUsage.estimated_cost_used.toFixed(3)}`,
      maxValue: `$${activeUsage.max_estimated_cost.toFixed(2)}`,
      percentage: (activeUsage.estimated_cost_used / activeUsage.max_estimated_cost) * 100,
      status: activeUsage.budget_status === "exceeded" ? "error" : activeUsage.budget_status === "warning" ? "warning" : "ok",
      iconName: "DollarSign",
    },
    {
      id: "calls",
      label: "LLM Calls",
      value: activeUsage.calls_used,
      maxValue: activeUsage.max_calls,
      percentage: (activeUsage.calls_used / activeUsage.max_calls) * 100,
      status: "info",
      iconName: "Cpu",
    },
    {
      id: "tokens",
      label: "Tokens Used",
      value: activeUsage.total_tokens_used.toLocaleString(),
      maxValue: activeUsage.max_total_tokens.toLocaleString(),
      percentage: (activeUsage.total_tokens_used / activeUsage.max_total_tokens) * 100,
      status: "default",
      iconName: "Layers",
    },
    {
      id: "attempts",
      label: "Attempts",
      value: activeUsage.attempted_calls ?? activeUsage.calls_used,
      status: "default",
      iconName: "Activity",
    },
    {
      id: "failed",
      label: "Failed Calls",
      value: activeUsage.failed_calls ?? 0,
      status: (activeUsage.failed_calls ?? 0) > 0 ? "error" : "default",
      iconName: "AlertCircle",
    },
    {
      id: "blocked",
      label: "Blocked Calls",
      value: activeUsage.blocked_calls ?? 0,
      status: (activeUsage.blocked_calls ?? 0) > 0 ? "warning" : "default",
      iconName: "ShieldAlert",
    },
  ] : [];

  // Derive repair count based on traces
  const repairsCount = activeTraces
    .filter((t) => t.type === "agent_run")
    .map((t) => t.data as any)
    .filter((run) => run.agent_name === "BenchmarkGeneratorAgent" && run.input_summary?.toLowerCase().includes("repairing"))
    .length;

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Control Header */}
      <ControlHeader
        projectId={projectId}
        projectName="Acme Docs Evaluation Workflow"
        workflowStatus={activeWorkflowStatus}
        cancelRequested={activeUsage?.cancel_requested}
        onStopWorkflow={handleStopWorkflow}
        repairsCount={repairsCount}
        traces={activeTraces}
        onResumeWorkflow={handleResumeWorkflow}
        isResuming={isResuming}
      />

      {/* Contextual Workflow Banner */}
      <WorkflowBanner
        projectId={projectId}
        workflowStatus={activeWorkflowStatus}
        sampleReviewCount={samplesCount}
      />

      {/* Grid Dashboard Layout */}
      <WorkspaceGrid
        graphComponent={
          <DirectedWorkflowGraph 
            currentWorkflowStatus={activeWorkflowStatus} 
            projectId={projectId}
            repairsCount={repairsCount}
            traces={activeTraces}
          />
        }
        timelineComponent={<TimelinePanel traces={activeTraces} />}
        consoleComponent={<ConsolePanel rawTraces={activeRawTraces} />}
        telemetryComponent={<TelemetryCluster metrics={telemetryMetrics} title="Workflow Budget Guard & LLM Telemetry" />}
        projectId={projectId}
        workflowStatus={activeWorkflowStatus}
      />

      {/* Full-Page Centered Workflow Artifact Viewer Workspace Overlay */}
      {selectedNodeId && (
        <ArtifactViewer
          nodeId={selectedNodeId}
          projectId={projectId}
          workflowStatus={activeWorkflowStatus}
          traces={activeTraces}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Plan Review/Edit Drawer Overlay */}
      {isPlanReviewOpen && (
        <PlanReviewDrawer
          projectId={projectId}
          onClose={() => setIsPlanReviewOpen(false)}
          onPlanApproved={() => {
            setIsPlanReviewOpen(false);
          }}
        />
      )}

      {/* Completion success overlay */}
      <CompletionOverlay />

      {/* Glassmorphic Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-2.5 px-4.5 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
              : "bg-rose-950/40 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
          }`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}></span>
            </span>
            <span className="text-xs font-bold font-sans tracking-wide text-white">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
