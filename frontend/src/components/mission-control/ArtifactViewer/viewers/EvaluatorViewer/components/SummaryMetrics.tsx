import React, { useMemo } from "react";
import Metric from "../../../components/Metric";
import { ClipboardCheck, Sparkles, AlertTriangle, XOctagon, RefreshCw, BarChart2 } from "lucide-react";
import { EvaluatorSample } from "../useEvaluatorSamples";

interface SummaryMetricsProps {
  samples: EvaluatorSample[];
}

function SummaryMetrics({ samples }: SummaryMetricsProps) {
  const totalCount = samples.length;
  
  // Memoize counts based on decisions
  const passCount = useMemo(() => samples.filter((s) => s.decision === "pass" && s.retry_count === 0).length, [samples]);
  const repairCount = useMemo(() => samples.filter((s) => s.decision === "repair" || s.retry_count > 0).length, [samples]);
  const reviewCount = useMemo(() => samples.filter((s) => s.decision === "human_review").length, [samples]);
  const rejectCount = useMemo(() => samples.filter((s) => s.decision === "reject").length, [samples]);

  // Memoize average overall quality score
  const averagePercentage = useMemo(() => {
    const samplesWithScores = samples.filter((s) => s.overall_score !== null);
    const avgScore = samplesWithScores.length > 0
      ? samplesWithScores.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / samplesWithScores.length
      : 0;
    return Math.round(avgScore * 100);
  }, [samples]);

  // Formatting strings
  const passRate = useMemo(() => totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0, [passCount, totalCount]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 select-none">
      <Metric
        label="Total Evaluated"
        value={`${totalCount} Samples`}
        icon={<ClipboardCheck size={12} className="text-indigo-400" />}
      />
      <Metric
        label="Passed (PASS)"
        value={`${passCount} (${passRate}%)`}
        icon={<Sparkles size={12} className="text-emerald-400" />}
      />
      <Metric
        label="Needs Repair (REPAIR)"
        value={`${repairCount} Items`}
        icon={<RefreshCw size={12} className="text-purple-400" />}
      />
      <Metric
        label="Needs Review (REVIEW)"
        value={`${reviewCount} Checkpoints`}
        icon={<AlertTriangle size={12} className="text-cyan-400" />}
      />
      <Metric
        label="Rejected (REJECT)"
        value={`${rejectCount} Pruned`}
        icon={<XOctagon size={12} className="text-rose-400" />}
      />
      <Metric
        label="Avg Quality Score"
        value={`${averagePercentage}%`}
        icon={<BarChart2 size={12} className="text-amber-400" />}
      />
    </div>
  );
}

export default React.memo(SummaryMetrics, (prev, next) => {
  if (prev.samples.length !== next.samples.length) return false;
  return prev.samples.every((s, i) => {
    const n = next.samples[i];
    return s.id === n.id && 
           s.decision === n.decision && 
           s.overall_score === n.overall_score && 
           s.retry_count === n.retry_count;
  });
});

