import React from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Sparkles, 
  Square,
  Clock,
  RotateCcw
} from "lucide-react";
import { WorkflowStatus } from "../../../../../components/mission-control/types";

interface ControlHeaderProps {
  projectId: string;
  projectName: string;
  workflowStatus: WorkflowStatus;
  demoMode: boolean;
  cancelRequested?: boolean;
  onToggleDemoMode: () => void;
  onStopWorkflow: () => void;
  repairsCount?: number;
}

export default function ControlHeader({
  projectId,
  projectName,
  workflowStatus,
  demoMode,
  cancelRequested = false,
  onToggleDemoMode,
  onStopWorkflow,
  repairsCount,
}: ControlHeaderProps) {
  
  // Define all possible states in chronological order to calculate progress
  const allStates: WorkflowStatus[] = [
    "CREATED", "FILES_UPLOADED", "PARSING", "PARSED", 
    "CHUNKING", "CHUNKED", "EMBEDDING", "SOURCE_ANALYZING", 
    "SOURCE_ANALYZED", "PLANNING", "PLAN_READY", "WAITING_FOR_PLAN_APPROVAL", 
    "PLAN_APPROVED", "GENERATING", "VALIDATING", "EVALUATING", 
    "REPAIRING", "WAITING_FOR_SAMPLE_REVIEW", "EXPORTING", "EXPORT_READY", 
    "DONE"
  ];

  const currentStateIndex = allStates.indexOf(workflowStatus);
  const progressValue = currentStateIndex >= 0 
    ? Math.max(5, ((currentStateIndex + 1) / allStates.length) * 100) 
    : 0;

  // Deriving the active agent from workflow states
  const getActiveAgent = (status: WorkflowStatus) => {
    switch (status) {
      case "CHUNKING":
      case "CHUNKED":
        return "DocumentChunker";
      case "EMBEDDING":
        return "VectorEmbedder";
      case "SOURCE_ANALYZING":
      case "SOURCE_ANALYZED":
        return "SourceUnderstandingAgent";
      case "PLANNING":
      case "PLAN_READY":
      case "WAITING_FOR_PLAN_APPROVAL":
      case "PLAN_APPROVED":
        return "IntakePlannerAgent";
      case "GENERATING":
      case "VALIDATING":
        return "BenchmarkGeneratorAgent";
      case "EVALUATING":
      case "REPAIRING":
      case "WAITING_FOR_SAMPLE_REVIEW":
        return "QualityEvaluatorAgent";
      case "EXPORTING":
      case "EXPORT_READY":
      case "DONE":
        return "ExportReportAgent";
      default:
        return "Idle System";
    }
  };

  const getAgentColorClass = (status: WorkflowStatus) => {
    switch (status) {
      case "CHUNKING":
      case "CHUNKED":
        return "text-purple-400";
      case "EMBEDDING":
        return "text-indigo-400";
      case "SOURCE_ANALYZING":
      case "SOURCE_ANALYZED":
        return "text-violet-400";
      case "PLANNING":
      case "PLAN_READY":
      case "WAITING_FOR_PLAN_APPROVAL":
      case "PLAN_APPROVED":
        return "text-cyan-400";
      case "GENERATING":
      case "VALIDATING":
        return "text-amber-400";
      case "EVALUATING":
      case "REPAIRING":
      case "WAITING_FOR_SAMPLE_REVIEW":
        return "text-rose-400";
      case "EXPORTING":
      case "EXPORT_READY":
      case "DONE":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const currentAgentName = getActiveAgent(workflowStatus);
  const agentColorClass = getAgentColorClass(workflowStatus);

  // Deriving repair count
  const activeRepairsCount = repairsCount !== undefined
    ? repairsCount
    : (["EVALUATING", "REPAIRING", "WAITING_FOR_SAMPLE_REVIEW", "EXPORTING", "EXPORT_READY", "DONE"].includes(workflowStatus) ? 2 : 0);

  // Determine status color badge
  let statusBadgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  if (workflowStatus === "FAILED") {
    statusBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
  } else if (workflowStatus === "DONE" || workflowStatus === "EXPORT_READY") {
    statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (workflowStatus === "CANCELLED") {
    statusBadgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  } else if (workflowStatus.startsWith("WAITING_")) {
    statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
  } else if (workflowStatus === "LOADING") {
    statusBadgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  } else if (workflowStatus !== "CREATED") {
    statusBadgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }

  return (
    <div className="w-full flex flex-col gap-3 relative z-10 shrink-0 select-none">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.04] pb-3">
        <div className="space-y-0.5">
          <Link 
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={10} className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Project Console
          </Link>
          
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              {projectName || "Autopilot Mission Control"}
            </h1>
            <span className={`text-[9px] border px-2 py-0.2 rounded-full font-mono font-semibold uppercase tracking-wider ${statusBadgeColor}`}>
              {workflowStatus}
            </span>
            {cancelRequested && (
              <span className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.2 rounded-full font-mono font-bold animate-pulse">
                STOPPING
              </span>
            )}
          </div>
        </div>

        {/* Mode Selector and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-xl border transition-all h-8 ${
              demoMode
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : "bg-white/5 text-slate-450 border-white/10 hover:border-white/20"
            }`}
          >
            <Sparkles size={11} className={demoMode ? "text-purple-400" : "text-slate-500"} />
            {demoMode ? "Demo" : "Live"}
          </button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onStopWorkflow}
            disabled={workflowStatus === "DONE" || workflowStatus === "FAILED" || cancelRequested}
            className="rounded-xl flex items-center gap-1 h-8 font-bold border border-rose-500/20 active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.15)] px-2.5 text-[10px]"
          >
            <Square size={8} className="fill-current" />
            {cancelRequested ? "Stopping..." : "Stop"}
          </Button>
        </div>
      </div>

      {/* 2. Compact State metrics & Progress Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/[0.01] border border-white/[0.04] px-4 py-2 rounded-xl shadow-inner text-[11px]">
        {/* Left side: Progress bar */}
        <div className="flex-1 w-full md:max-w-sm flex items-center gap-3">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">
            Progress
          </span>
          <div className="flex-1 relative bg-white/[0.04] rounded-full h-1 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
          <span className="font-mono font-bold text-[9px] text-slate-400">{progressValue.toFixed(0)}%</span>
        </div>

        {/* Right side: Active Agent | Elapsed Time | Repairs */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] w-full md:w-auto md:justify-end">
          {/* Active Agent */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Active Agent:</span>
            <span className={`font-mono font-bold ${agentColorClass}`}>{currentAgentName}</span>
          </div>

          <div className="w-[1px] h-2.5 bg-white/10 hidden sm:block"></div>

          {/* Elapsed Time */}
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-slate-550" />
            <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Elapsed:</span>
            <span className="font-mono font-bold text-slate-300">01m 48s</span>
          </div>

          <div className="w-[1px] h-2.5 bg-white/10 hidden sm:block"></div>

          {/* Repair Count */}
          <div className="flex items-center gap-1">
            <RotateCcw size={10} className="text-slate-550" />
            <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Repairs:</span>
            <span className={`font-mono font-bold ${activeRepairsCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
              {activeRepairsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
