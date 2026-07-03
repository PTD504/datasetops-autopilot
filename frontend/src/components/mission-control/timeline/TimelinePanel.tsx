import { 
  Network, 
  Wrench, 
  FileText, 
  Play 
} from "lucide-react";
import { TraceItem, AgentRun, WorkflowEvent, ToolCallLog, AgentArtifact } from "../types";

interface TimelinePanelProps {
  traces: TraceItem[];
}

export default function TimelinePanel({ traces }: TimelinePanelProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return "00:00:00";
    }
  };

  if (!traces || traces.length === 0) {
    return (
      <div className="text-slate-500 text-xs text-center py-12 italic">
        No execution traces logged.
      </div>
    );
  }

  return (
    <div className="space-y-4 pr-2 select-none">
      {traces.map((trace, idx) => {
        const timeStr = formatTime(trace.timestamp);
        
        switch (trace.type) {
          case "workflow_event": {
            const data = trace.data as WorkflowEvent;
            return (
              <div key={data.id || idx} className="flex gap-3 relative pb-2 border-b border-white/[0.02] last:border-0 last:pb-0">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                  <Play size={10} className="text-blue-400 fill-current" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{timeStr}</span>
                    <span className="text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/20 tracking-wider">
                      {data.event_type}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">{data.message}</p>
                </div>
              </div>
            );
          }

          case "agent_run": {
            const data = trace.data as AgentRun;
            const isCompleted = data.status === "completed";
            const badgeColor = isCompleted 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
            
            return (
              <div key={data.id || idx} className="flex gap-3 relative pb-2 border-b border-white/[0.02] last:border-0 last:pb-0">
                <div className={`w-5 h-5 rounded-full bg-white/[0.02] border flex items-center justify-center shrink-0 mt-0.5 ${
                  isCompleted ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
                }`}>
                  <Network size={10} className={isCompleted ? "text-emerald-400" : "text-amber-400"} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{timeStr}</span>
                      <span className="text-xs font-extrabold text-slate-200">{data.agent_name}</span>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border tracking-wider ${badgeColor}`}>
                      {data.status}
                    </span>
                  </div>
                  {data.input_summary && (
                    <p className="text-slate-400 text-[11px] leading-relaxed bg-white/[0.01] border border-white/[0.03] p-1.5 rounded-lg">
                      {data.input_summary}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          case "tool_call": {
            const data = trace.data as ToolCallLog;
            return (
              <div key={data.id || idx} className="flex gap-3 relative pb-2 border-b border-white/[0.02] last:border-0 last:pb-0">
                <div className="w-5 h-5 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench size={10} className="text-slate-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{timeStr}</span>
                    <span className="text-xs font-bold text-slate-400">{data.tool_name}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Tool execution status: <span className="font-semibold text-slate-400">{data.status}</span>
                  </p>
                </div>
              </div>
            );
          }

          case "artifact": {
            const data = trace.data as AgentArtifact;
            return (
              <div key={data.id || idx} className="flex gap-3 relative pb-2 border-b border-white/[0.02] last:border-0 last:pb-0">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                  <FileText size={10} className="text-purple-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{timeStr}</span>
                      <span className="text-[11px] font-extrabold text-purple-300">{data.title}</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/20 font-mono tracking-wider">
                      {data.artifact_type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{data.summary}</p>
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
