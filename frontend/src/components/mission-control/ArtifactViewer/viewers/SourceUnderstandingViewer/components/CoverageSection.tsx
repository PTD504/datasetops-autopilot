import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import Section from "../../../components/Section";

interface CoverageSectionProps {
  strongSections?: string[];
  weakSections?: string[];
  unsupportedContent?: string[];
}

export default function CoverageSection({
  strongSections,
  weakSections,
  unsupportedContent,
}: CoverageSectionProps) {
  const hasStrong = strongSections && strongSections.length > 0;
  const hasWeak = weakSections && weakSections.length > 0;
  const hasUnsupported = unsupportedContent && unsupportedContent.length > 0;

  if (!hasStrong && !hasWeak && !hasUnsupported) {
    return (
      <Section title="Knowledge Coverage Audit" icon={<ShieldCheck size={12} className="text-cyan-400" />}>
        <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
          No knowledge coverage areas parsed from the source understanding report.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Knowledge Coverage Audit" icon={<ShieldCheck size={12} className="text-cyan-400" />}>
      <div className="space-y-4">
        {/* Strong Coverage */}
        {hasStrong && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Strong Coverage Topics</span>
            </div>
            <div className="space-y-1.5 pl-3 border-l border-emerald-500/20">
              {strongSections.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak Coverage */}
        {hasWeak && (
          <div className={`space-y-2 ${hasStrong ? "border-t border-white/[0.04] pt-3" : ""}`}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Weak Coverage Topics</span>
            </div>
            <div className="space-y-1.5 pl-3 border-l border-amber-500/20">
              {weakSections.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unsupported Content */}
        {hasUnsupported && (
          <div className={`space-y-2 ${(hasStrong || hasWeak) ? "border-t border-white/[0.04] pt-3" : ""}`}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">Unsupported or Missing Topics</span>
            </div>
            <div className="space-y-1.5 pl-3 border-l border-rose-500/20">
              {unsupportedContent.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-350">
                  <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
