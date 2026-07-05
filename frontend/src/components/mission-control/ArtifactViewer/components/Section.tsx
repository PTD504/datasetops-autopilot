import React from "react";

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  title,
  icon,
  children,
  className = "",
}: SectionProps) {
  return (
    <div className={`p-4 md:p-5 rounded-2xl border border-white/[0.05] bg-[#0b0e2d]/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-col gap-3 backdrop-blur-sm select-none ${className}`}>
      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.03] pb-2">
        {icon && <span className="shrink-0">{icon}</span>}
        {title}
      </div>
      <div className="flex-1 w-full text-slate-350 text-xs leading-relaxed select-text">
        {children}
      </div>
    </div>
  );
}
