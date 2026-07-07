import React, { useEffect, useRef } from "react";
import { X, Clock, Cpu, BarChart3, AlertCircle } from "lucide-react";
import { WorkflowStatus, TraceItem, AgentRun, ToolCallLog } from "../types";
import { AGENT_NODES } from "../config/agentConfig";
import Badge from "./components/Badge";
import Metric from "./components/Metric";
import EmptyState from "./components/EmptyState";
import { getViewerComponent } from "./artifactViewerRegistry";

interface ArtifactViewerProps {
  nodeId: string;
  projectId: string;
  workflowStatus: WorkflowStatus;
  traces: TraceItem[];
  onClose: () => void;
}

export default function ArtifactViewer({
  nodeId,
  projectId,
  workflowStatus,
  traces,
  onClose,
}: ArtifactViewerProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when workspace is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const node = AGENT_NODES.find((n) => n.id === nodeId);
  if (!node) return null;

  // Resolve matching Agent Runs for this node
  const getAgentRunsForNode = (): AgentRun[] => {
    let searchNames: string[] = [];
    if (nodeId === "preprocessing") {
      searchNames = ["DocumentChunker", "VectorEmbedder"];
    } else if (nodeId === "source_understanding") {
      searchNames = [
        "SourceUnderstandingAgent",
        "SourceUnderstandingAgent (Phase 1)",
        "SourceUnderstandingAgent (Phase 2)"
      ];
    } else if (nodeId === "intake_planner") {
      searchNames = ["IntakePlannerAgent"];
    } else if (nodeId === "generator") {
      searchNames = ["BenchmarkGeneratorAgent"];
    } else if (nodeId === "evaluator") {
      searchNames = ["QualityEvaluatorAgent"];
    } else if (nodeId === "exporter") {
      searchNames = ["ExportReportAgent"];
    }

    return traces
      .filter((t) => t.type === "agent_run")
      .map((t) => t.data as AgentRun)
      .filter((run) => searchNames.includes(run.agent_name));
  };

  const nodeRuns = getAgentRunsForNode();
  const latestRun = nodeRuns.length > 0 ? nodeRuns[nodeRuns.length - 1] : null;

  // 1. Calculate duration from all runs matching the node
  let durationText = "N/A";
  if (nodeRuns.length > 0) {
    let totalDurationSec = 0;
    nodeRuns.forEach((run) => {
      const start = new Date(run.started_at);
      const end = run.completed_at ? new Date(run.completed_at) : new Date();
      totalDurationSec += Math.floor((end.getTime() - start.getTime()) / 1000);
    });

    if (totalDurationSec < 60) {
      durationText = `${totalDurationSec}s`;
    } else {
      const mins = Math.floor(totalDurationSec / 60);
      const secs = totalDurationSec % 60;
      durationText = `${mins}m ${secs}s`;
    }
  }

  // 2. Count LLM calls from tool calls of all matching runs
  let llmCalls = 0;
  if (nodeRuns.length > 0) {
    nodeRuns.forEach((run) => {
      const apiCalls = run.tool_calls || [];
      // Count tool calls starting with QwenClient or general API calls
      let runLlmCalls = apiCalls.filter(
        (tc) => tc.tool_name.toLowerCase().includes("qwen") || tc.tool_name.toLowerCase().includes("client")
      ).length;
      
      // Fallback if tool_calls array isn't populated but output indicates completion
      if (runLlmCalls === 0 && run.status === "completed") {
        runLlmCalls = (nodeId === "preprocessing" || nodeId === "exporter") ? 0 : 1; // Non-LLM nodes get 0 calls
      }
      llmCalls += runLlmCalls;
    });
  }

  // 3. Resolve badge variant matching status
  let statusVariant: "default" | "success" | "warning" | "error" = "default";
  let statusLabel = "PENDING";

  if (latestRun) {
    if (latestRun.status === "completed") {
      statusVariant = "success";
      statusLabel = "COMPLETED";
    } else if (latestRun.status === "failed") {
      statusVariant = "error";
      statusLabel = "FAILED";
    } else if (latestRun.status === "running") {
      statusVariant = "warning";
      statusLabel = "RUNNING";
    }
  } else if (node.workflowStates.includes(workflowStatus)) {
    statusVariant = "warning";
    statusLabel = "RUNNING";
  }

  // Dynamically resolve body viewer component from registry
  const ViewerComponent = getViewerComponent(nodeId);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-[#030014]/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 select-none animate-[MCFadeIn_0.2s_ease-out_forwards]"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes MCFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes MCScaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .custom-workspace-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-workspace-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          border: 1px solid transparent;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      ` }} />

      {/* Large Modal Container */}
      <div 
        className="bg-gradient-to-b from-[#090d2e]/95 to-[#05071a]/95 border border-white/[0.08] backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] rounded-3xl w-full h-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden pointer-events-auto animate-[MCScaleIn_0.22s_ease-out_forwards] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left colored border stripe accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-500 via-purple-550 to-blue-600 opacity-80"></div>

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5 md:p-6 shrink-0 relative z-10 select-none">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  {nodeId === "evaluator" && workflowStatus === "WAITING_FOR_SAMPLE_REVIEW"
                    ? "Human Review Workspace"
                    : `${node.label} Workspace`}
                </h2>
                <Badge label={statusLabel} variant={statusVariant} />
              </div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {node.role}
              </p>
            </div>
          </div>

          {/* Right Metrics & Close button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Metric label="Duration" value={durationText} icon={<Clock size={12} />} />
              {llmCalls > 0 && (
                <Metric label="LLM Calls" value={llmCalls} icon={<Cpu size={12} />} />
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Close Workspace"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 relative z-10 select-text custom-workspace-scroll">
          {latestRun || node.workflowStates.includes(workflowStatus) || nodeId === "preprocessing" ? (
            ViewerComponent ? (
              <ViewerComponent 
                projectId={projectId}
                workflowStatus={workflowStatus}
                traces={traces}
              />
            ) : (
              <EmptyState 
                title="Viewer Not Implemented" 
                description={`No custom viewer component is registered for stage "${nodeId}".`} 
              />
            )
          ) : (
            <EmptyState 
              title="Execution Log Unavailable" 
              description="This agent has not started execution yet. Run the autopilot loop to generate workspace logs." 
            />
          )}
        </div>
      </div>
    </div>
  );
}
