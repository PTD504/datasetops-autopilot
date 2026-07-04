import React from "react";
import { CheckCircle2, Clock, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { AgentNodeConfig } from "../types";
import { AGENT_UI_CONFIGS } from "../config/agentUiConfig";

export type NodeUiStatus =
  | "Pending"
  | "Running"
  | "Completed"
  | "Waiting"
  | "Repair Requested"
  | "Failed";

interface WorkflowNodeProps {
  node: AgentNodeConfig;
  status: NodeUiStatus;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

export default function WorkflowNode({
  node,
  status,
  isSelected = false,
  isHighlighted = false,
  isDimmed = false,
  onClick,
}: WorkflowNodeProps) {
  const ui = AGENT_UI_CONFIGS[node.id];
  const Icon = ui?.icon || HelpCircle;

  const getAgentColorHex = (id: string) => {
    switch (id) {
      case "preprocessing": return "#94a3b8"; // slate
      case "source_understanding": return "#8b5cf6"; // violet
      case "intake_planner": return "#22d3ee"; // cyan
      case "generator": return "#fbbf24"; // amber
      case "evaluator": return "#fb7185"; // rose
      case "exporter": return "#34d399"; // emerald
      default: return "#6366f1";
    }
  };

  const isStage = node.isStage === true;

  // Resolve status-specific visual classes
  let statusDotBg = "bg-slate-700";
  let statusDotPulse = "";
  let statusLabel = "Pending";
  let cardBorderClass = isStage
    ? "border-dashed border-slate-700/50 bg-slate-950/10 text-slate-500 hover:border-slate-600/60 hover:text-slate-400"
    : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20 hover:bg-white/[0.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 text-slate-400";
  let activePulse = "";

  if (status === "Completed") {
    statusDotBg = "bg-emerald-500";
    statusLabel = "Done";
    cardBorderClass = isStage
      ? "border-dashed border-slate-700/60 bg-slate-900/10 text-slate-400 hover:border-slate-500"
      : "border-emerald-500/25 bg-emerald-950/5 text-slate-200 shadow-[inset_0_1px_1px_rgba(16,185,129,0.05)] hover:border-emerald-500/40 hover:bg-emerald-950/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:-translate-y-0.5";
  } else if (status === "Running") {
    const semanticBorder = ui?.borderColorClass || "border-indigo-500/30";
    statusDotBg = "bg-indigo-400";
    statusDotPulse = "animate-ping";
    statusLabel = "Active";
    cardBorderClass = isStage
      ? "border-slate-600 bg-slate-900/25 text-white"
      : `border-t-2 ${semanticBorder} bg-[#090b22]/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5`;
    
    if (!isStage) {
      activePulse = "before:absolute before:inset-0 before:rounded-xl before:ring-1 before:ring-white/5 before:animate-ping before:opacity-20";
    }
  } else if (status === "Waiting") {
    statusDotBg = "bg-amber-400";
    statusDotPulse = "animate-pulse";
    statusLabel = "WAITING REVIEW";
    cardBorderClass = "border-amber-500/40 ring-1 ring-amber-500/20 bg-amber-950/5 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5";
  } else if (status === "Repair Requested") {
    statusDotBg = "bg-rose-500";
    statusDotPulse = "animate-pulse";
    statusLabel = "Repair";
    cardBorderClass = "border-rose-500/50 ring-1 ring-rose-500/20 bg-rose-950/10 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:-translate-y-0.5";
  } else if (status === "Failed") {
    statusDotBg = "bg-rose-600";
    statusLabel = "Failed";
    cardBorderClass = "border-rose-500/40 bg-rose-950/20 text-rose-200 hover:-translate-y-0.5 hover:border-rose-550";
  }

  // Override border if highlighted (Checkpoint Glow)
  if (isHighlighted) {
    const glowColor = node.id === "intake_planner" ? "rgba(34,211,238,0.6)" : "rgba(251,113,133,0.6)";
    const borderColor = node.id === "intake_planner" ? "border-cyan-400" : "border-rose-400";
    const ringColor = node.id === "intake_planner" ? "ring-cyan-400/30" : "ring-rose-400/30";
    const bgTheme = node.id === "intake_planner" ? "bg-cyan-950/15" : "bg-rose-950/15";
    const textColor = node.id === "intake_planner" ? "text-cyan-100" : "text-rose-100";

    cardBorderClass = `${borderColor} ring-2 ${ringColor} ${bgTheme} ${textColor} shadow-[0_0_30px_${glowColor}] animate-[pulse_2s_ease-in-out_infinite] scale-[1.05] hover:scale-[1.08] hover:-translate-y-1 transition-all duration-300`;
  }

  // Override border if selected
  const selectionClass = isSelected 
    ? "border-white/40 bg-white/[0.05] ring-1 ring-white/10 opacity-100 shadow-[0_0_12px_rgba(255,255,255,0.05)]" 
    : isStage ? "" : "bg-white/[0.01]";

  return (
    <div
      onClick={onClick}
      className={`w-[130px] min-w-[130px] max-w-[130px] p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer select-none transition-all duration-300 ease-out relative ${cardBorderClass} ${selectionClass} ${activePulse}`}
    >
      {/* Dynamic reticle for active running agents (skip for stage node to look flatter) */}
      {status === "Running" && !isStage && (
        <div 
          className="absolute -inset-1.5 rounded-2xl border border-dashed animate-[spin_35s_linear_infinite] pointer-events-none opacity-50"
          style={{ borderColor: getAgentColorHex(node.id) }}
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between gap-1 border-b border-white/[0.04] pb-1.5 mb-1.5">
        <div className={`w-5.5 h-5.5 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-center ${ui?.colorClass || "text-slate-400"} shrink-0`}>
          <Icon size={isStage ? 8 : 10} />
        </div>
        
        {/* Tiny Status Dot and Label */}
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            {statusDotPulse && (
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDotBg} ${statusDotPulse}`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusDotBg}`}></span>
          </span>
          <span className="text-[7.5px] font-mono font-bold uppercase tracking-wide text-slate-500">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Node Content */}
      <div className="space-y-0.5">
        <h4 className="text-[10.5px] font-bold text-white leading-snug truncate">
          {node.label}
        </h4>
        {isStage ? (
          <span className="inline-block text-[6.5px] px-1 py-0.2 mt-0.5 rounded bg-slate-800/40 border border-slate-700/20 text-slate-500 font-bold uppercase font-mono tracking-wider">
            Stage
          </span>
        ) : (
          <p className="text-[8px] text-slate-550 font-mono uppercase tracking-wider truncate">
            {node.role}
          </p>
        )}
      </div>
    </div>
  );
}
