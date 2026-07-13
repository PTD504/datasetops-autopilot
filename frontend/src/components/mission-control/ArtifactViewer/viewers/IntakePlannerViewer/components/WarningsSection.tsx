import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import Section from "../../../components/Section";

interface WarningsSectionProps {
  warningsConsidered?: string[];
  warnings?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function WarningsSection({
  warningsConsidered,
  warnings,
  collapsible = false,
  defaultExpanded = true,
}: WarningsSectionProps) {
  const hasWarningsConsidered = warningsConsidered && warningsConsidered.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  // Memoize warnings considered rendering
  const warningsConsideredList = useMemo(() => {
    if (!warningsConsidered || warningsConsidered.length === 0) return null;
    return warningsConsidered.map((w, idx) => (
      <li key={idx}>{w}</li>
    ));
  }, [warningsConsidered]);

  // Memoize plan warnings rendering
  const warningsList = useMemo(() => {
    if (!warnings || warnings.length === 0) return null;
    return warnings.map((w, idx) => (
      <li key={idx}>{w}</li>
    ));
  }, [warnings]);

  if (!hasWarningsConsidered && !hasWarnings) {
    return null;
  }

  return (
    <Section 
      title="Source Document Warnings" 
      icon={<AlertTriangle size={12} className="text-amber-500" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Warnings considered during planning */}
        {hasWarningsConsidered && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Warnings Considered in Planning</span>
            <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
              {warningsConsideredList}
            </ul>
          </div>
        )}

        {/* General Plan warnings */}
        {hasWarnings && (
          <div className={`space-y-2 ${hasWarningsConsidered ? "border-t border-white/[0.04] pt-3" : ""}`}>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Plan Warnings / Constraints</span>
            <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
              {warningsList}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}

// React.memo with custom comparison
export default React.memo(WarningsSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.warningsConsidered) === JSON.stringify(next.warningsConsidered) &&
    JSON.stringify(prev.warnings) === JSON.stringify(next.warnings)
  );
});

