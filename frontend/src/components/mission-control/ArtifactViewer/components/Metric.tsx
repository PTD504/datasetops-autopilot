import React from "react";

interface MetricProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function Metric({
  label,
  value,
  icon,
  className = "",
}: MetricProps) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.04] bg-white/[0.01] text-xs ${className}`}>
      {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
      <div className="flex flex-col select-none">
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider leading-none">
          {label}
        </span>
        <span className="font-mono font-bold text-white leading-tight mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}
