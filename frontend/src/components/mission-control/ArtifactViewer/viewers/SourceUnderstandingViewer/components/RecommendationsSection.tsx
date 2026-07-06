import React from "react";
import { Brain, GitCommit } from "lucide-react";
import Section from "../../../components/Section";

interface RecommendationsSectionProps {
  recommendations?: string[];
}

export default function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps) {
  const hasRecs = recommendations && recommendations.length > 0;

  return (
    <Section title="AI Benchmark Recommendations" icon={<Brain size={12} className="text-cyan-400" />}>
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Planning Recommendations passed to Intake Planner
        </p>
        {hasRecs ? (
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/[0.03] bg-white/[0.005] text-xs text-slate-350">
                <GitCommit size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{rec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
            No planning adjustments or strategy recommendations were passed.
          </div>
        )}
      </div>
    </Section>
  );
}
