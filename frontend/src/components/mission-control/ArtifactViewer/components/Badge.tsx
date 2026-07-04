import React from "react";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
  className?: string;
}

export default function Badge({
  label,
  variant = "default",
  className = "",
}: BadgeProps) {
  let variantClass = "bg-slate-500/10 text-slate-450 border-slate-500/20";

  switch (variant) {
    case "success":
      variantClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      break;
    case "warning":
      variantClass = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
      break;
    case "error":
      variantClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      break;
    case "info":
      variantClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      break;
    case "secondary":
      variantClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      break;
    case "default":
    default:
      variantClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      break;
  }

  return (
    <span className={`inline-flex items-center text-[9px] border px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${variantClass} ${className}`}>
      {label}
    </span>
  );
}
