import React, { useMemo } from "react";
import { Database, BarChart3 } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";
import Badge from "../../../components/Badge";

interface DatasetSectionProps {
  totalCount?: number;
  difficultyDistribution?: {
    total?: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
  categories?: string[];
  coverageByCategory?: Record<string, { coverage_level: string; coverage_score: number }>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function DatasetSection({
  totalCount,
  difficultyDistribution,
  categories,
  coverageByCategory,
  collapsible = false,
  defaultExpanded = true,
}: DatasetSectionProps) {
  const easy = difficultyDistribution?.easy || 0;
  const medium = difficultyDistribution?.medium || 0;
  const hard = difficultyDistribution?.hard || 0;
  
  // Memoize total count calculation
  const total = useMemo(() => {
    return difficultyDistribution?.total || totalCount || (easy + medium + hard) || 0;
  }, [difficultyDistribution, totalCount, easy, medium, hard]);

  // Percentage calculations for distribution bar (memoized)
  const easyPct = useMemo(() => total > 0 ? (easy / total) * 100 : 0, [easy, total]);
  const mediumPct = useMemo(() => total > 0 ? (medium / total) * 100 : 0, [medium, total]);
  const hardPct = useMemo(() => total > 0 ? (hard / total) * 100 : 0, [hard, total]);

  const getCoverageBadgeVariant = (level: string) => {
    switch (level?.toLowerCase()) {
      case "strong": return "success";
      case "medium": return "default";
      case "weak": return "warning";
      case "unsupported": return "error";
      default: return "secondary";
    }
  };

  // Memoize categories checklist rendering
  const categoriesList = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return categories.map((cat) => {
      const cov = coverageByCategory?.[cat];
      return (
        <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] border border-white/[0.03] text-xs">
          <span className="font-medium text-slate-200 truncate pr-2" title={cat}>{cat}</span>
          {cov ? (
            <Badge 
              label={`${cov.coverage_level} (${Math.round((cov.coverage_score || 0) * 100)}%)`}
              variant={getCoverageBadgeVariant(cov.coverage_level)} 
            />
          ) : (
            <span className="text-[9px] font-mono text-slate-500 uppercase">No Audit Data</span>
          )}
        </div>
      );
    });
  }, [categories, coverageByCategory]);

  return (
    <Section 
      title="Planned Dataset Blueprint" 
      icon={<Database size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-5">
        {/* Top telemetry metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric
            label="Total Planned Samples"
            value={`${total} QA Pairs`}
            icon={<Database size={12} className="text-indigo-400" />}
          />
          <Metric
            label="Difficulty Spread"
            value={`E: ${easy} | M: ${medium} | H: ${hard}`}
            icon={<BarChart3 size={12} className="text-amber-400" />}
          />
        </div>

        {/* Difficulty Distribution visual progress bar */}
        {total > 0 && (
          <div className="space-y-2 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Difficulty Split Breakdown</span>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
              <div style={{ width: `${easyPct}%` }} className="bg-emerald-500/80" title={`Easy: ${easy}`} />
              <div style={{ width: `${mediumPct}%` }} className="bg-indigo-500/80" title={`Medium: ${medium}`} />
              <div style={{ width: `${hardPct}%` }} className="bg-rose-500/80" title={`Hard: ${hard}`} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Easy ({easy})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Medium ({medium})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <span>Hard ({hard})</span>
              </div>
            </div>
          </div>
        )}

        {/* Categories checklist & coverage targets */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Planned Categories & Source Coverage</span>
          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
              {categoriesList}
            </div>
          ) : (
            <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
              No categories specified in the benchmark plan.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// React.memo with custom comparison
export default React.memo(DatasetSection, (prev, next) => {
  return (
    prev.totalCount === next.totalCount &&
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.difficultyDistribution) === JSON.stringify(next.difficultyDistribution) &&
    JSON.stringify(prev.categories) === JSON.stringify(next.categories) &&
    JSON.stringify(prev.coverageByCategory) === JSON.stringify(next.coverageByCategory)
  );
});

