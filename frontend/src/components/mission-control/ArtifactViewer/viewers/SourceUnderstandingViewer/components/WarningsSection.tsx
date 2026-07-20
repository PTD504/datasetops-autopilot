import React, { useMemo } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import Section from "../../../components/Section";

interface WarningsSectionProps {
  sourceWarnings?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function WarningsSection({
  sourceWarnings,
  collapsible = false,
  defaultExpanded = true,
}: WarningsSectionProps) {
  const hasSourceWarnings = sourceWarnings && sourceWarnings.length > 0;

  // Memoize source warnings list rendering
  const sourceWarningsList = useMemo(() => {
    if (!sourceWarnings || sourceWarnings.length === 0) return null;
    return sourceWarnings.map((w, idx) => (
      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
        <AlertCircle size={13} className="text-amber-500/80 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-sans">{w}</span>
      </div>
    ));
  }, [sourceWarnings]);

  if (!hasSourceWarnings) {
    return (
      <Section 
        title="Document Insights & Limitations" 
        icon={<AlertTriangle size={12} className="text-amber-500" />}
        collapsible={collapsible}
        defaultExpanded={defaultExpanded}
      >
        <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
          No quality warnings or content limitations discovered during analysis.
        </div>
      </Section>
    );
  }

  return (
    <Section 
      title="Document Insights & Limitations" 
      icon={<AlertTriangle size={12} className="text-amber-500" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Source Warnings (formatting, overlaps, indices) */}
        {hasSourceWarnings && (
          <div className="space-y-2 bg-amber-500/[0.01] border border-amber-500/10 p-3 rounded-xl">
            {sourceWarningsList}
          </div>
        )}
      </div>
    </Section>
  );
}

// React.memo to prevent unnecessary re-renders when parent properties haven't changed
export default React.memo(WarningsSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.sourceWarnings) === JSON.stringify(next.sourceWarnings)
  );
});

