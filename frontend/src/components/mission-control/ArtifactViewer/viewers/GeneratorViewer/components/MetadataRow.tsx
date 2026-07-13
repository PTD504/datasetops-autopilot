import React from "react";
import { Layers, RefreshCw, Sparkles, Award } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";

interface MetadataRowProps {
  category: string;
  difficulty: string;
  sampleType: string;
  status: string;
  retryCount?: number;
}

function MetadataRow({
  category,
  difficulty,
  sampleType,
  status,
  retryCount = 0,
}: MetadataRowProps) {
  // Format sample type
  const formatSampleType = (type: string) => {
    if (!type) return "General Query";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Status styling map
  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || "").toUpperCase();
    let variantClasses = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    let label = s;

    switch (s) {
      case "GENERATED":
        variantClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        label = "Generated";
        break;
      case "REPAIRED":
        variantClasses = "bg-purple-500/10 text-purple-400 border-purple-500/20";
        label = "Repaired";
        break;
      case "APPROVED":
      case "PASS":
        variantClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        label = "Approved";
        break;
      case "REJECTED":
      case "REJECT":
        variantClasses = "bg-rose-500/10 text-rose-400 border-rose-500/20";
        label = "Rejected";
        break;
      case "NEEDS_REVIEW":
      case "HUMAN_REVIEW":
        variantClasses = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
        label = "Needs Review";
        break;
    }

    return (
      <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded-md border font-mono font-semibold uppercase tracking-wider ${variantClasses}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono border-t border-white/[0.03] pt-3">
      {/* Category */}
      <div className="flex items-center gap-1">
        <Layers size={11} className="text-slate-400 shrink-0" />
        <span className="text-slate-400 font-medium">Category:</span>
        <span className="text-slate-350 font-semibold">{category}</span>
      </div>

      <span className="text-white/10 select-none">•</span>

      {/* Difficulty */}
      <div className="flex items-center gap-1.5">
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <span className="text-white/10 select-none">•</span>

      {/* Sample Type */}
      <div className="flex items-center gap-1">
        <Sparkles size={11} className="text-slate-400 shrink-0" />
        <span className="text-slate-400">Type:</span>
        <span className="text-slate-355">{formatSampleType(sampleType)}</span>
      </div>

      <span className="text-white/10 select-none">•</span>

      {/* Status */}
      <div className="flex items-center gap-1">
        {getStatusBadge(status)}
      </div>

      {retryCount > 0 && (
        <>
          <span className="text-white/10 select-none">•</span>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <RefreshCw size={11} className="shrink-0" />
            <span>{retryCount} {retryCount === 1 ? "retry" : "retries"}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(MetadataRow);

