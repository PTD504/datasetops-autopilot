import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { EvidenceItem } from "../useEvaluatorSamples";

interface EvidencePreviewProps {
  evidence?: EvidenceItem[];
}

function EvidencePreview({ evidence = [] }: EvidencePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-[11px] text-slate-500 italic font-sans select-none">
        No grounding evidence chunks mapped.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 select-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          Grounding Evidence ({evidence.length} {evidence.length === 1 ? "Chunk" : "Chunks"})
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors focus:outline-none cursor-pointer"
        >
          {isExpanded ? (
            <>
              Hide Context <ChevronUp size={12} />
            </>
          ) : (
            <>
              Show Context <ChevronDown size={12} />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 animate-[MCFadeIn_0.22s_ease-out_forwards]">
          {evidence.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3 rounded-xl border border-white/[0.04] bg-[#05071a]/65 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] space-y-1.5 transition-all hover:bg-[#070924]/85"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/[0.03] pb-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-350">
                  <FileText size={11} className="text-indigo-400" />
                  <span>{item.document_name}</span>
                </div>
                <div className="text-slate-500">
                  {item.index >= 0 ? `Chunk #${item.index}` : `ID: ${item.id.substring(0, 8)}`}
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-450 leading-relaxed whitespace-pre-wrap select-text">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(EvidencePreview, (prev, next) => {
  if (prev.evidence?.length !== next.evidence?.length) return false;
  if (!prev.evidence || !next.evidence) return true;
  const nextEv = next.evidence;
  return prev.evidence.every((item, index) => {
    const n = nextEv[index];
    return !!(n && item.id === n.id && 
           item.index === n.index && 
           item.document_name === n.document_name && 
           item.text === n.text);
  });
});

