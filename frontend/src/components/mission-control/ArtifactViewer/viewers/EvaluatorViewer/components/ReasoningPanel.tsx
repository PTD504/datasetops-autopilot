import React from "react";
import { MessageSquareCode, ShieldAlert } from "lucide-react";

interface ReasoningPanelProps {
  notes: string | null;
  issues: string[];
}

export default function ReasoningPanel({ notes, issues }: ReasoningPanelProps) {
  const hasIssues = issues && issues.length > 0;

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* 1. Qualitative Agent Notes */}
      {notes && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            <MessageSquareCode size={11} className="text-indigo-400" />
            <span>Evaluator Agent Notes</span>
          </div>
          <p className="text-xs text-slate-350 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl select-text">
            {notes}
          </p>
        </div>
      )}

      {/* 2. Validation Issue Checklist */}
      {hasIssues && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            <ShieldAlert size={11} className="text-rose-400" />
            <span>Validation Checks Failed</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {issues.map((issue, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2 text-xs bg-rose-500/[0.03] border border-rose-500/10 p-2.5 rounded-xl text-rose-300 font-sans leading-relaxed select-text"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0 animate-pulse"></span>
                <span className="flex-1">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
