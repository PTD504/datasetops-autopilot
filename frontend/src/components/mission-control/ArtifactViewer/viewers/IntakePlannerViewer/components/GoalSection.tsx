import React from "react";
import { Target, Languages, Compass } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";

interface GoalSectionProps {
  goal?: string;
  language?: string;
  domain?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function GoalSection({
  goal,
  language,
  domain,
  collapsible = false,
  defaultExpanded = true,
}: GoalSectionProps) {
  return (
    <Section 
      title="Benchmark Goal & Scope" 
      icon={<Target size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Goal statement */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Objective / Target Use Case</span>
          {goal ? (
            <p className="text-sm font-medium text-white leading-relaxed bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl">
              {goal}
            </p>
          ) : (
            <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-3.5 rounded-xl">
              No objective stated in the benchmark plan.
            </div>
          )}
        </div>

        {/* Supporting metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric
            label="Target Language"
            value={language || "Not Specified"}
            icon={<Languages size={12} className="text-indigo-400" />}
          />
          <Metric
            label="Evaluation Domain"
            value={domain || "Not Specified"}
            icon={<Compass size={12} className="text-purple-400" />}
          />
        </div>
      </div>
    </Section>
  );
}

export default React.memo(GoalSection, (prev, next) => {
  return (
    prev.goal === next.goal &&
    prev.language === next.language &&
    prev.domain === next.domain &&
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded
  );
});

