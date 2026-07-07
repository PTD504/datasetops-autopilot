import React from "react";
import { HelpCircle, Sparkles, Layers, RefreshCw, Eye, MessageSquare, AlertCircle, Check, X, Edit3 } from "lucide-react";
import DecisionBadge from "./DecisionBadge";
import QualityScore from "./QualityScore";
import ReasoningPanel from "./ReasoningPanel";
import RepairInstruction from "./RepairInstruction";
import EvidencePreview from "./EvidencePreview";
import DifficultyBadge from "./DifficultyBadge";
import { EvaluatorSample } from "../useEvaluatorSamples";

interface EvaluationCardProps {
  sample: EvaluatorSample;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (sample: EvaluatorSample) => void;
}

export default function EvaluationCard({ sample, onApprove, onReject, onEdit }: EvaluationCardProps) {
  // Format sample type string
  const formatSampleType = (type: string) => {
    if (!type) return "General Query";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isReview = sample.decision === "human_review";
  const isRepair = sample.decision === "repair";

  return (
    <div className="relative group p-4 md:p-5 rounded-2xl border border-white/[0.08] bg-[#12163f]/35 backdrop-blur-md transition-all duration-200 hover:bg-[#161c52]/55 hover:border-indigo-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.06)] flex flex-col gap-4 select-text">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono border-b border-white/[0.03] pb-3">
        <span className="text-slate-500 font-medium">SAMPLE ID: {sample.id.substring(0, 8)}</span>
        
        {/* Badges */}
        <div className="flex items-center gap-2 select-none">
          {sample.retry_count > 0 && (
            <span className="text-[9px] text-slate-400 font-mono mr-1">
              Attempts: {sample.retry_count + 1}
            </span>
          )}
          
          {/* AI Evaluator Decision Badge */}
          {sample.decision && (
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">AI:</span>
              <DecisionBadge decision={sample.decision} />
            </div>
          )}
          
          {/* Human Decision Badge */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Human:</span>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider ${
              sample.status === "APPROVED" || sample.status === "PASS"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : sample.status === "REJECTED"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {sample.status === "APPROVED" || sample.status === "PASS" ? "Approved" : sample.status === "REJECTED" ? "Rejected" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Human Review Checkpoint Message (Hero state for REVIEW) */}
      {isReview && (
        <div className="flex items-start gap-3 bg-cyan-950/15 border border-cyan-500/15 p-3.5 rounded-2xl text-cyan-300 text-xs animate-[fadeIn_0.25s_ease-out]">
          <Eye size={15} className="mt-0.5 shrink-0 text-cyan-400" />
          <div className="space-y-1 text-left">
            <span className="font-extrabold uppercase tracking-widest text-[9px] font-mono block text-cyan-400">
              Human-in-the-Loop Checkpoint
            </span>
            <p className="text-slate-400 leading-relaxed font-sans">
              Waiting for human judgment. This sample has been routed for manual inspection. It is currently placed on hold for human review, not treated as a system failure.
            </p>
          </div>
        </div>
      )}

      {/* Question section */}
      <div className="space-y-1">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle size={13} />
          </div>
          <div className="space-y-0.5 flex-1 text-left">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Question Under Review</span>
            <h3 className="text-sm font-semibold text-white leading-relaxed select-text">
              {sample.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Expected Answer section */}
      <div className="pl-9 pr-2">
        <div className="p-3 rounded-xl border border-emerald-500/10 bg-[#05071a]/65 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] space-y-1 text-left">
          <div className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">Evaluated Answer</div>
          <p className="text-xs text-slate-350 leading-relaxed font-sans select-text">
            {sample.expected_answer}
          </p>
        </div>
      </div>

      {/* Supporting Quality Metrics Grid */}
      <div className="pl-9 pr-2">
        <QualityScore
          overallScore={sample.overall_score}
          faithfulness={sample.faithfulness_score}
          relevance={sample.answer_relevance_score}
          precision={sample.context_precision_score}
          recall={sample.context_recall_score}
          hallucinationRisk={sample.hallucination_risk_score}
          novelty={sample.novelty_score}
          clarity={sample.clarity_score}
        />
      </div>

      {/* Agent Reasoning Panel (Why decision was made) */}
      <div className="pl-9 pr-2">
        <ReasoningPanel
          notes={sample.evaluator_notes}
          issues={sample.issues}
        />
      </div>

      {/* Agent-to-Agent Negotiation Dialogue (Hero feature for Repair) */}
      {isRepair && sample.repair_instruction && (
        <div className="pl-9 pr-2">
          <RepairInstruction
            instruction={sample.repair_instruction}
            status={sample.status}
            retryCount={sample.retry_count}
          />
        </div>
      )}

      {/* Mapped Grounding Evidence */}
      <div className="pl-9 pr-2">
        <EvidencePreview evidence={sample.evidence} />
      </div>

      {/* Supporting Metadata Footer */}
      <div className="pl-9 pr-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono border-t border-white/[0.03] pt-3">
        {/* Category */}
        <div className="flex items-center gap-1">
          <Layers size={11} className="text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium">Category:</span>
          <span className="text-slate-350 font-semibold">{sample.category}</span>
        </div>

        <span className="text-white/10 select-none">•</span>

        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          <DifficultyBadge difficulty={sample.difficulty} />
        </div>

        <span className="text-white/10 select-none">•</span>

        {/* Sample Type */}
        <div className="flex items-center gap-1">
          <Sparkles size={11} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Type:</span>
          <span className="text-slate-355">{formatSampleType(sample.sample_type)}</span>
        </div>

        {sample.retry_count > 0 && (
          <>
            <span className="text-white/10 select-none">•</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <RefreshCw size={11} className="shrink-0" />
              <span>{sample.retry_count} {sample.retry_count === 1 ? "repair turn" : "repair turns"}</span>
            </div>
          </>
        )}
      </div>

      {/* Human Review Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04] justify-end select-none">
        <button
          onClick={() => onApprove?.(sample.id)}
          disabled={sample.status === "APPROVED" || sample.status === "PASS"}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-450 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none text-slate-950 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
        >
          <Check size={11} className="stroke-[3]" />
          Approve
        </button>
        <button
          onClick={() => onReject?.(sample.id)}
          disabled={sample.status === "REJECTED"}
          className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-455 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
        >
          <X size={11} className="stroke-[3]" />
          Reject
        </button>
        <button
          onClick={() => onEdit?.(sample)}
          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95"
        >
          <Edit3 size={11} />
          Edit Sample
        </button>
      </div>

    </div>
  );
}
