import React from "react";
import { Brain, GitCommit } from "lucide-react";
import Section from "../../../components/Section";

interface DecisionsSectionProps {
  adjustments?: string[];
}

export default function DecisionsSection({
  adjustments,
}: DecisionsSectionProps) {
  const hasAdjustments = adjustments && adjustments.length > 0;

  return (
    <Section title="AI Planning Rationale & Adjustments" icon={<Brain size={12} className="text-cyan-400" />}>
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Adjustments Made by Intake Planner Agent
        </p>
        {hasAdjustments ? (
          <div className="space-y-2">
            {adjustments.map((adj, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/[0.03] bg-white/[0.005] text-xs text-slate-300">
                <GitCommit size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{adj}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
            No planning adjustments were recorded for this project.
          </div>
        )}
      </div>
    </Section>
  );
}
