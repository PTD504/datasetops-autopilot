import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import Section from "../../../components/Section";

interface WarningsSectionProps {
  warnings?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function WarningsSection({
  warnings,
  collapsible = false,
  defaultExpanded = true,
}: WarningsSectionProps) {
  const hasWarnings = warnings && warnings.length > 0;

  // Memoize plan warnings rendering
  const warningsList = useMemo(() => {
    if (!warnings || warnings.length === 0) return null;
    return warnings.map((w, idx) => (
      <li key={idx}>{w}</li>
    ));
  }, [warnings]);

  if (!hasWarnings) {
    return null;
  }

  return (
    <Section 
      title="Source Document Warnings" 
      icon={<AlertTriangle size={12} className="text-amber-500" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      {hasWarnings && (
        <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
          {warningsList}
        </ul>
      )}
    </Section>
  );
}

// React.memo with custom comparison
export default React.memo(WarningsSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.warnings) === JSON.stringify(next.warnings)
  );
});

