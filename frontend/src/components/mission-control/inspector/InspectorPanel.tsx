import React from "react";
import { useMissionControlStore } from "../store/useMissionControlStore";
import { AGENT_NODES } from "../config/agentConfig";
import { 
  User, 
  FileInput, 
  FileOutput, 
  Settings2, 
  FileCheck,
  BarChart3
} from "lucide-react";

export default function InspectorPanel() {
  const { selectedNodeId } = useMissionControlStore();

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12 px-4 italic">
        <User size={20} className="mb-2 text-slate-600" />
        <p className="text-[11px]">Select a node on the graph network to view agent execution metrics and active payloads.</p>
      </div>
    );
  }

  const node = AGENT_NODES.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-550 p-4">
        <User size={20} className="mb-2 text-slate-650" />
        <p className="text-xs">Node configuration not found.</p>
      </div>
    );
  }

  // Helper to resolve dynamic metrics based on node ID
  const getNodeMetrics = (nodeId: string) => {
    switch (nodeId) {
      case "chunking":
        return [
          { label: "Total Chunks", value: "124 Chunks" },
          { label: "Avg Chunk Size", value: "180 tokens" },
          { label: "Files Processed", value: "1 / 1" }
        ];
      case "embedding":
        return [
          { label: "Vector Dimension", value: "1536 dims" },
          { label: "Database", value: "pgvector" },
          { label: "Status", value: "Fully Indexed" }
        ];
      case "source_understanding":
        return [
          { label: "Content Coverage", value: "85%" },
          { label: "Identified Topics", value: "3 Core Topics" },
          { label: "Alerts / Warnings", value: "1 Warning" }
        ];
      case "intake_planner":
        return [
          { label: "Target QA Count", value: "30 QA Pairs" },
          { label: "Difficulty Split", value: "10 / 10 / 10" },
          { label: "Review Status", value: "Approved" }
        ];
      case "generator":
        return [
          { label: "Generated Count", value: "30 / 30 QA" },
          { label: "Success Rate", value: "100%" },
          { label: "Avg Gen Time", value: "1.2s / QA" }
        ];
      case "evaluator":
        return [
          { label: "Avg Faithfulness", value: "0.92" },
          { label: "Avg Relevance", value: "0.89" },
          { label: "Repair Loops", value: "2 Loops Run" }
        ];
      case "exporter":
        return [
          { label: "Format", value: "ZIP (.jsonl, .md)" },
          { label: "Destination", value: "Alibaba Cloud OSS" },
          { label: "File Size", value: "284 KB" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-4 text-xs select-none py-1">
      {/* 1. Agent Information Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <User size={12} className="text-indigo-400" />
          Agent Information
        </div>
        <div className="space-y-1 mt-2">
          <div className="text-sm font-bold text-white leading-snug">{node.label}</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{node.role}</div>
        </div>
      </div>

      {/* 2. Description Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <Settings2 size={12} className="text-rose-400" />
          Agent Description
        </div>
        <p className="text-slate-300 leading-normal text-[11px] mt-1.5">
          {node.description}
        </p>
      </div>

      {/* 3. Metrics Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <BarChart3 size={12} className="text-cyan-400" />
          Metrics & Telemetry
        </div>
        <div className="space-y-1.5 mt-2">
          {getNodeMetrics(node.id).map((metric) => (
            <div key={metric.label} className="flex justify-between items-center py-0.5 border-b border-white/[0.02] last:border-0 last:pb-0">
              <span className="text-slate-450 text-[10px]">{metric.label}</span>
              <span className="font-mono font-bold text-white text-[10px]">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Input Context Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <FileInput size={12} className="text-indigo-400" />
          Consumed Inputs
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {node.artifactIn ? (
            node.artifactIn.map((art) => (
              <span key={art} className="font-mono text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {art}
              </span>
            ))
          ) : (
            <span className="text-slate-500 italic text-[10px]">None (Entry Node)</span>
          )}
        </div>
      </div>

      {/* 5. Output Snapshot Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <FileOutput size={12} className="text-amber-400" />
          Produced Outputs
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {node.artifactOut ? (
            node.artifactOut.map((art) => (
              <span key={art} className="font-mono text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {art}
              </span>
            ))
          ) : (
            <span className="text-slate-500 italic text-[10px]">None (Exit Node)</span>
          )}
        </div>
      </div>

      {/* 6. Workflow States Section */}
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
          <FileCheck size={12} className="text-emerald-400" />
          Active Workflow States
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {node.workflowStates.map((state) => (
            <span key={state} className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-550/10 text-slate-400 border border-white/5">
              {state}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
