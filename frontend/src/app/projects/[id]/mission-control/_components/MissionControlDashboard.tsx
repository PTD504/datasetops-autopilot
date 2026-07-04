import React, { useState, useEffect } from "react";
import { useMissionControlStore } from "../../../../../components/mission-control/store/useMissionControlStore";
import { 
  MOCK_USAGE_SUMMARY, 
  MOCK_WORKFLOW_STATE, 
  MOCK_TRACE_ITEMS, 
  MOCK_RAW_TRACES 
} from "../../../../../components/mission-control/mock/mockData";
import ControlHeader from "./ControlHeader";
import WorkspaceGrid from "./WorkspaceGrid";
import TelemetryCluster, { TelemetryMetric } from "./TelemetryCluster";

// Import new modular panel components
import DirectedWorkflowGraph from "../../../../../components/mission-control/graph/DirectedWorkflowGraph";
import TimelinePanel from "../../../../../components/mission-control/timeline/TimelinePanel";
import ConsolePanel from "../../../../../components/mission-control/console/ConsolePanel";
import WorkflowBanner from "../../../../../components/mission-control/WorkflowBanner";
import ArtifactViewer from "../../../../../components/mission-control/ArtifactViewer/ArtifactViewer";
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
}: MissionControlDashboardProps) {
  const {
    demoMode,
    setDemoMode,
    selectedNodeId,
    setSelectedNodeId,
  } = useMissionControlStore();

  const [samplesCount, setSamplesCount] = useState(3);

  const handleToggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  // Derive active values based on demoMode
  const activeWorkflowStatus = demoMode ? MOCK_WORKFLOW_STATE : (workflowStatus || "LOADING");
  const activeTraces = demoMode ? MOCK_TRACE_ITEMS : traces;
  const activeRawTraces = demoMode ? MOCK_RAW_TRACES : rawTraces;
  const activeUsage = demoMode ? MOCK_USAGE_SUMMARY : usage;

  // Poll for samples count when waiting for sample review
  useEffect(() => {
    if (demoMode) {
      setSamplesCount(3); // In demo mode, use a static mock count of 3
      return;
    }

    if (activeWorkflowStatus !== "WAITING_FOR_SAMPLE_REVIEW") return;

    let active = true;
    const fetchSamples = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  }, [projectId, activeWorkflowStatus, demoMode]);

  const handleStopWorkflow = () => {
    if (demoMode) {
      // Local mockup stop action (no-op in demo mode)
      console.log("Stop requested in demo mode");
    } else {
      onStopWorkflow();
    }
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

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Control Header */}
      <ControlHeader
        projectId={projectId}
        projectName="Acme Docs Evaluation Workflow"
        workflowStatus={activeWorkflowStatus}
        demoMode={demoMode}
        cancelRequested={activeUsage?.cancel_requested}
        onToggleDemoMode={handleToggleDemoMode}
        onStopWorkflow={handleStopWorkflow}
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
            repairsCount={
              demoMode
                ? (["EVALUATING", "REPAIRING", "WAITING_FOR_SAMPLE_REVIEW", "EXPORTING", "EXPORT_READY", "DONE"].includes(activeWorkflowStatus) ? 2 : 0)
                : (traces?.filter(t => t.action === "start_generation_repair" || t.action === "repair").length || 0)
            }
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
    </div>
  );
}
