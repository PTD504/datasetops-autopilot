import React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import Section from "../../../components/Section";

interface WarningsSectionProps {
  sourceWarnings?: string[];
  runWarnings?: string[];
}

export default function WarningsSection({
  sourceWarnings,
  runWarnings,
}: WarningsSectionProps) {
  const hasSourceWarnings = sourceWarnings && sourceWarnings.length > 0;
  const hasRunWarnings = runWarnings && runWarnings.length > 0;

  if (!hasSourceWarnings && !hasRunWarnings) {
    return (
      <Section title="Document Insights & Limitations" icon={<AlertTriangle size={12} className="text-amber-500" />}>
        <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
          No quality warnings or content limitations discovered during analysis.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Document Insights & Limitations" icon={<AlertTriangle size={12} className="text-amber-500" />}>
      <div className="space-y-4">
        {/* Source Warnings (formatting, overlaps, indices) */}
        {hasSourceWarnings && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Quality & Structural Observations</span>
            <div className="space-y-2 bg-amber-500/[0.01] border border-amber-500/10 p-3 rounded-xl">
              {sourceWarnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <AlertCircle size={13} className="text-amber-500/80 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run Warnings (agent log constraints) */}
        {hasRunWarnings && (
          <div className={`space-y-2 ${hasSourceWarnings ? "border-t border-white/[0.04] pt-3" : ""}`}>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Agent Scoping Limitations</span>
            <ul className="list-disc pl-5 text-xs text-slate-350 space-y-1.5 leading-relaxed font-sans">
              {runWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
