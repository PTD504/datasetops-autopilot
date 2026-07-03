import React from "react";
import { RawTraceItem } from "../types";

interface ConsolePanelProps {
  rawTraces: RawTraceItem[];
}

export default function ConsolePanel({ rawTraces }: ConsolePanelProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return "00:00:00";
    }
  };

  const getLogLineColor = (action: string) => {
    if (action.includes("complete") || action.includes("complete") || action.includes("produced")) {
      return "text-emerald-400";
    }
    if (action.includes("warning") || action.includes("warn")) {
      return "text-amber-400";
    }
    if (action.includes("failed") || action.includes("error")) {
      return "text-rose-400";
    }
    return "text-slate-350";
  };

  if (!rawTraces || rawTraces.length === 0) {
    return (
      <div className="text-slate-650 italic font-mono text-xs">
        Console stream idle. Waiting for logs...
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
      {rawTraces.map((t, idx) => {
        const timeStr = formatTime(t.created_at);
        const logColor = getLogLineColor(t.action);
        
        let prefix = "INFO";
        let prefixColor = "text-sky-500";
        if (t.action.includes("complete") || t.action.includes("produced")) {
          prefix = "OK  ";
          prefixColor = "text-emerald-500";
        } else if (t.action.includes("warning") || t.action.includes("warn")) {
          prefix = "WARN";
          prefixColor = "text-amber-500";
        } else if (t.action.includes("failed") || t.action.includes("error")) {
          prefix = "FAIL";
          prefixColor = "text-rose-500";
        }

        return (
          <div key={t.id || idx} className="flex gap-2.5 items-start py-0.5 border-b border-white/[0.01] last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors">
            <span className="text-slate-600 shrink-0 select-none">[{timeStr}]</span>
            <span className={`${prefixColor} font-extrabold shrink-0 select-none`}>[{prefix}]</span>
            <span className="text-sky-400 font-bold shrink-0">
              {t.agent_name || "System"}
            </span>
            <span className={`${logColor} break-all`}>{t.action}</span>
          </div>
        );
      })}
    </div>
  );
}
