import React from "react";
import { MessageSquare, ArrowRight, Bot, CheckCircle } from "lucide-react";

interface RepairInstructionProps {
  instruction: string | null;
  status: string;
  retryCount: number;
}

export default function RepairInstruction({
  instruction,
  status,
  retryCount,
}: RepairInstructionProps) {
  if (!instruction) return null;

  const isResolved = status === "APPROVED" || status === "REPAIRED" || status === "PASS";

  return (
    <div className="relative border border-purple-500/10 bg-[#160b33]/15 rounded-2xl p-4 flex flex-col gap-3 font-sans shadow-lg overflow-hidden group">
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-transparent pointer-events-none"></div>

      {/* Header storytelling title */}
      <div className="flex items-center justify-between border-b border-purple-500/10 pb-2 z-10 font-mono">
        <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare size={11} />
          Agent Negotiation Dialogue
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-500 font-semibold uppercase">Loop status:</span>
          {isResolved ? (
            <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              <CheckCircle size={8} /> Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
              Active Repair
            </span>
          )}
        </div>
      </div>

      {/* Chat dialogue layout */}
      <div className="flex flex-col gap-3.5 z-10 relative">
        {/* Message 1: From Critic Agent */}
        <div className="flex items-start gap-2.5 max-w-[85%] self-start">
          <div className="p-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Bot size={13} />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[8px] font-mono font-bold text-purple-400/80 uppercase">QualityEvaluatorAgent</span>
            <div className="bg-[#120a28]/60 border border-purple-500/10 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-300 leading-relaxed font-sans select-text">
              {instruction}
            </div>
          </div>
        </div>

        {/* Action transition arrow */}
        <div className="flex justify-center my-0.5">
          <div className="h-4 w-[1px] bg-gradient-to-b from-purple-500/30 to-indigo-500/30 relative">
            <ArrowRight size={10} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
          </div>
        </div>

        {/* Message 2: Response status from Generator Agent */}
        <div className="flex items-start gap-2.5 max-w-[85%] self-end flex-row-reverse">
          <div className="p-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Bot size={13} />
          </div>
          <div className="flex flex-col gap-1 text-right items-end">
            <span className="text-[8px] font-mono font-bold text-indigo-400/80 uppercase">BenchmarkGeneratorAgent</span>
            <div className="bg-[#05071a]/70 border border-indigo-500/10 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-slate-350 leading-relaxed font-sans">
              {isResolved ? (
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1 justify-end">
                    <CheckCircle size={10} /> Revision Accepted & Approved
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Re-synthesized expected answer to match policy specifications. Passed validation checks on Turn {retryCount}.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-amber-400 text-[11px] flex items-center gap-1 justify-end animate-pulse">
                    Refining Answer...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Currently performing semantic alignment corrections. Turn {retryCount + 1} execution in progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
