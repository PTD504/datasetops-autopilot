import React from "react";
import { HelpCircle, CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";
import EvidencePreview from "./EvidencePreview";
import MetadataRow from "./MetadataRow";

interface EvidenceItem {
  id: string;
  index: number;
  document_name: string;
  text: string;
  evidence_unavailable?: boolean;
}

export interface SampleData {
  id: string;
  category: string;
  difficulty: string;
  sample_type: string;
  question: string;
  expected_answer: string;
  status: string;
  retry_count?: number;
  overall_score?: number | null;
  decision?: string | null;
  issues?: string[] | null;
  evaluator_notes?: string | null;
  evidence?: EvidenceItem[];
  evidence_unavailable?: boolean;
}

interface SampleCardProps {
  sample: SampleData;
}

export default function SampleCard({ sample }: SampleCardProps) {
  return (
    <div className="relative group p-4 md:p-5 rounded-2xl border border-white/[0.08] bg-[#12163f]/35 backdrop-blur-md transition-all duration-200 hover:bg-[#161c52]/55 hover:border-indigo-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.06)] flex flex-col gap-4 select-text">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
        <span className="text-slate-500">ID: {sample.id.substring(0, 8)}</span>
      </div>

      {/* Question section */}
      <div className="space-y-1">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle size={13} />
          </div>
          <div className="space-y-0.5 flex-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Question</span>
            <h3 className="text-sm font-semibold text-white leading-relaxed select-text">
              {sample.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Answer section */}
      <div className="pl-9 pr-2">
        <div className="p-3 rounded-xl border border-emerald-500/10 bg-[#05071a]/65 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] space-y-1 select-text">
          <div className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">Expected Answer</div>
          <p className="text-xs text-slate-350 leading-relaxed font-sans select-text">
            {sample.expected_answer}
          </p>
        </div>
      </div>



      {/* Evidence section */}
      <div className="pl-9 pr-2">
        <EvidencePreview evidence={sample.evidence} />
      </div>

      {/* Metadata Row */}
      <div className="pl-9 pr-2">
        <MetadataRow
          category={sample.category}
          difficulty={sample.difficulty}
          sampleType={sample.sample_type}
          status={sample.status}
          retryCount={sample.retry_count}
        />
      </div>

    </div>
  );
}
