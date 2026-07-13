import React, { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import Section from "../../../components/Section";

interface QualityRulesSectionProps {
  rules?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function QualityRulesSection({
  rules,
  collapsible = false,
  defaultExpanded = true,
}: QualityRulesSectionProps) {
  // Memoize rules list rendering
  const rulesList = useMemo(() => {
    if (!rules || rules.length === 0) return null;
    return rules.map((rule, idx) => (
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
    ));
  }, [rules]);

  return (
    <Section 
      title="Quality Rules & Guardrails" 
      icon={<ShieldCheck size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Acceptance Criteria / Generation Constraints
        </p>
        
        {rules && rules.length > 0 ? (
          <div className="space-y-2.5">
            {rulesList}
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

// React.memo with custom comparison
export default React.memo(QualityRulesSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.rules) === JSON.stringify(next.rules)
  );
});

