import React, { useState } from "react";
import { X, Terminal, Activity } from "lucide-react";
import { useMissionControlStore } from "../../../../../components/mission-control/store/useMissionControlStore";
import HumanReviewOverlay from "../../../../../components/mission-control/HumanReviewOverlay";
import { WorkflowStatus } from "../../../../../components/mission-control/types";

interface WorkspaceGridProps {
  graphComponent: React.ReactNode;
  timelineComponent: React.ReactNode;
  consoleComponent: React.ReactNode;
  telemetryComponent: React.ReactNode;
  projectId: string;
  workflowStatus: WorkflowStatus;
}

export default function WorkspaceGrid({
  graphComponent,
  timelineComponent,
  consoleComponent,
  telemetryComponent,
  projectId,
  workflowStatus,
}: WorkspaceGridProps) {
  const { selectedNodeId, setSelectedNodeId } = useMissionControlStore();
  const [activeTab, setActiveTab] = useState<"timeline" | "console">("timeline");

  return (
    <div className="w-full flex-1 flex flex-col gap-6 relative z-10">
      {/* Upper Area: Directed Flow Graph + Overlaid Inspector (No Layout Shifts) */}
      <div className="w-full relative min-h-[480px]">
        {/* Directed Flow Graph Container (statically full width) */}
        <div className="w-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col relative overflow-hidden group min-h-[480px]">
          {/* Left glowing edge highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 via-purple-550 to-blue-600 rounded-l-2xl opacity-60"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 items-center border-b border-white/[0.06] pb-3 mb-4 shrink-0 gap-3">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Directional Flow Network</h3>
              <p className="text-[10px] text-slate-400">Autonomous Multi-Agent Execution Pipeline</p>
            </div>
            
            {/* Center column: Human Review Checkpoint Overlay Notification */}
            <div className="flex justify-start md:justify-center">
              <HumanReviewOverlay projectId={projectId} workflowStatus={workflowStatus} />
            </div>

            {/* Right column: Active Node Tracking */}
            <div className="flex justify-start md:justify-end items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-[9px] font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  Active Node Tracking
                </span>
              </div>
            </div>
          </div>

          {/* Graph Component takes full canvas */}
          <div className="flex-1 flex items-center justify-center min-h-[350px] pb-8">
            {graphComponent}
          </div>

          {/* Embedded system metrics: lightweight status bar at the bottom-left */}
          <div className="absolute bottom-4 left-6 z-20 pointer-events-auto">
            {telemetryComponent}
          </div>
        </div>
      </div>

      {/* Lower Area: Supporting Tabbed Deck (Timeline stream + Console logs) */}
      <div className="w-full bg-[#030014]/60 border border-white/[0.05] backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col relative overflow-hidden min-h-[300px]">
        {/* Left decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-l-2xl opacity-60"></div>

        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-4 shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg transition-all ${
                activeTab === "timeline"
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-450 hover:text-slate-200"
              }`}
            >
              <Activity size={12} />
              Structured Flow
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg transition-all ${
                activeTab === "console"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 font-mono"
                  : "text-slate-450 hover:text-slate-200 font-mono"
              }`}
            >
              <Terminal size={12} />
              Raw Console Shell
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              Live Output
            </span>
          </div>
        </div>

        {/* Tab Panel Content */}
        <div className="flex-1 overflow-y-auto max-h-[320px]">
          {activeTab === "timeline" ? timelineComponent : consoleComponent}
        </div>
      </div>
    </div>
  );
}
