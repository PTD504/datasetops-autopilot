import React from "react";
import { AlertTriangle } from "lucide-react";
import Section from "../../../components/Section";

interface WarningsSectionProps {
  warningsConsidered?: string[];
  warnings?: string[];
}

export default function WarningsSection({
  warningsConsidered,
  warnings,
}: WarningsSectionProps) {
  const hasWarningsConsidered = warningsConsidered && warningsConsidered.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  if (!hasWarningsConsidered && !hasWarnings) {
    return null;
  }

  return (
    <Section title="Source Document Warnings" icon={<AlertTriangle size={12} className="text-amber-500" />}>
      <div className="space-y-4">
        {/* Warnings considered during planning */}
        {hasWarningsConsidered && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Warnings Considered in Planning</span>
            <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
              {warningsConsidered.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General Plan warnings */}
        {hasWarnings && (
          <div className={`space-y-2 ${hasWarningsConsidered ? "border-t border-white/[0.04] pt-3" : ""}`}>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Plan Warnings / Constraints</span>
            <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
