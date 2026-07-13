import React from "react";
import { CheckCircle2, Wrench, Eye, XCircle } from "lucide-react";

export type DecisionType = "pass" | "repair" | "human_review" | "reject";

interface DecisionBadgeProps {
  decision: DecisionType;
  className?: string;
}

function DecisionBadge({ decision, className = "" }: DecisionBadgeProps) {
  let config = {
    label: "PASS",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 size={11} className="shrink-0" />
  };

  switch (decision) {
    case "repair":
      config = {
        label: "REPAIR",
        classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: <Wrench size={11} className="shrink-0" />
      };
      break;
    case "human_review":
      config = {
        label: "REVIEW",
        classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        icon: <Eye size={11} className="shrink-0" />
      };
      break;
    case "reject":
      config = {
        label: "REJECT",
        classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icon: <XCircle size={11} className="shrink-0" />
      };
      break;
    case "pass":
    default:
      config = {
        label: "PASS",
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 size={11} className="shrink-0" />
      };
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[9px] border px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${config.classes} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export default React.memo(DecisionBadge);

