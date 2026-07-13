import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import Section from "../../../components/Section";

interface CoverageSectionProps {
  strongSections?: string[];
  weakSections?: string[];
  unsupportedContent?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function CoverageSection({
  strongSections,
  weakSections,
  unsupportedContent,
  collapsible = false,
  defaultExpanded = true,
}: CoverageSectionProps) {
  const hasStrong = strongSections && strongSections.length > 0;
  const hasWeak = weakSections && weakSections.length > 0;
  const hasUnsupported = unsupportedContent && unsupportedContent.length > 0;

  // Memoize strong coverage list rendering
  const strongList = useMemo(() => {
    if (!strongSections || strongSections.length === 0) return null;
    return strongSections.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-sans">{item}</span>
      </div>
    ));
  }, [strongSections]);

  // Memoize weak coverage list rendering
  const weakList = useMemo(() => {
    if (!weakSections || weakSections.length === 0) return null;
    return weakSections.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
        <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-sans">{item}</span>
      </div>
    ));
  }, [weakSections]);

  // Memoize unsupported coverage list rendering
  const unsupportedList = useMemo(() => {
    if (!unsupportedContent || unsupportedContent.length === 0) return null;
    return unsupportedContent.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2 text-xs text-slate-350">
        <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-sans">{item}</span>
      </div>
    ));
  }, [unsupportedContent]);

  if (!hasStrong && !hasWeak && !hasUnsupported) {
    return (
      <Section 
        title="Knowledge Coverage Audit" 
        icon={<ShieldCheck size={12} className="text-cyan-400" />}
        collapsible={collapsible}
        defaultExpanded={defaultExpanded}
      >
        <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
          No knowledge coverage areas parsed from the source understanding report.
        </div>
      </Section>
    );
  }

  return (
    <Section 
      title="Knowledge Coverage Audit" 
      icon={<ShieldCheck size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Strong Coverage */}
        {hasStrong && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Strong Coverage Topics</span>
            </div>
            <div className="space-y-1.5 pl-3 border-l border-emerald-500/20">
              {strongList}
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
              {weakList}
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
              {unsupportedList}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// React.memo to prevent unnecessary re-renders when parent properties haven't changed
export default React.memo(CoverageSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.strongSections) === JSON.stringify(next.strongSections) &&
    JSON.stringify(prev.weakSections) === JSON.stringify(next.weakSections) &&
    JSON.stringify(prev.unsupportedContent) === JSON.stringify(next.unsupportedContent)
  );
});

