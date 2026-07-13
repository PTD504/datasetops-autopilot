import React from "react";

interface QualityScoreProps {
  score: number | null;
  label: string;
  isRisk?: boolean; // If true, lower is better (red/green inverted)
}

const MetricPill = React.memo(function MetricPill({ score, label, isRisk = false }: QualityScoreProps) {
  if (score === null || score === undefined) return null;
  
  // Format percentage
  const percentage = Math.round(score * 100);
  
  // Determine color matching thresholds
  let barColor = "bg-indigo-500/60";
  let textColor = "text-slate-350";
  
  if (isRisk) {
    if (score > 0.4) {
      barColor = "bg-rose-500/60";
      textColor = "text-rose-400";
    } else if (score > 0.15) {
      barColor = "bg-amber-500/60";
      textColor = "text-amber-400";
    } else {
      barColor = "bg-emerald-500/60";
      textColor = "text-emerald-400";
    }
  } else {
    if (score >= 0.85) {
      barColor = "bg-emerald-500/60";
      textColor = "text-emerald-400";
    } else if (score >= 0.6) {
      barColor = "bg-amber-500/60";
      textColor = "text-amber-400";
    } else {
      barColor = "bg-rose-500/60";
      textColor = "text-rose-400";
    }
  }

  return (
    <div className="flex flex-col gap-1 border border-white/[0.03] bg-white/[0.01] rounded-xl p-2 font-mono">
      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-semibold text-slate-500">
        <span>{label}</span>
        <span className={`${textColor} font-bold`}>{percentage}%</span>
      </div>
      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

interface QualityScoreGridProps {
  overallScore: number | null;
  faithfulness: number | null;
  relevance: number | null;
  precision?: number | null;
  recall?: number | null;
  hallucinationRisk: number | null;
  novelty?: number | null;
  clarity?: number | null;
}

function QualityScore({
  overallScore,
  faithfulness,
  relevance,
  precision,
  recall,
  hallucinationRisk,
  novelty,
  clarity,
}: QualityScoreGridProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-b border-white/[0.03] py-3.5">
      
      {/* Prominent Overall Score (Left) */}
      <div className="flex items-center gap-3 shrink-0 select-none">
        <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 font-mono shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-[14px] font-extrabold text-white leading-none">
              {overallScore !== null ? (overallScore * 100).toFixed(0) : "N/A"}
            </span>
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Score</span>
          </div>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Quality Index</span>
          <span className="text-[11px] font-medium text-slate-350 leading-tight">
            {overallScore !== null && overallScore >= 0.85
              ? "Exceeds Threshold"
              : overallScore !== null && overallScore >= 0.6
              ? "Acceptable Quality"
              : "Requires Attention"}
          </span>
        </div>
      </div>

      {/* Grid of Supportive Metrics (Right) */}
      <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <MetricPill label="Faithful" score={faithfulness} />
        <MetricPill label="Relevance" score={relevance} />
        <MetricPill label="Precision" score={precision || null} />
        <MetricPill label="Recall" score={recall || null} />
        <MetricPill label="Novelty" score={novelty || null} />
        <MetricPill label="Halluc. Risk" score={hallucinationRisk} isRisk={true} />
      </div>
      
    </div>
  );
}

export default React.memo(QualityScore, (prev, next) => {
  return (
    prev.overallScore === next.overallScore &&
    prev.faithfulness === next.faithfulness &&
    prev.relevance === next.relevance &&
    prev.precision === next.precision &&
    prev.recall === next.recall &&
    prev.hallucinationRisk === next.hallucinationRisk &&
    prev.novelty === next.novelty &&
    prev.clarity === next.clarity
  );
});

