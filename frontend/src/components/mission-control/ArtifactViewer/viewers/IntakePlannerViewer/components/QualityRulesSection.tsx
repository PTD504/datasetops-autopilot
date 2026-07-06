import React from "react";
import { ShieldCheck } from "lucide-react";
import Section from "../../../components/Section";

interface QualityRulesSectionProps {
  rules?: string[];
}

export default function QualityRulesSection({ rules }: QualityRulesSectionProps) {
  return (
    <Section title="Quality Rules & Guardrails" icon={<ShieldCheck size={12} className="text-cyan-400" />}>
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Acceptance Criteria / Generation Constraints
        </p>
        
        {rules && rules.length > 0 ? (
          <div className="space-y-2.5">
            {rules.map((rule, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex h-5 items-center">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-400 select-none">
                    {idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
            No quality rules defined in the benchmark plan.
          </div>
        )}
      </div>
    </Section>
  );
}
