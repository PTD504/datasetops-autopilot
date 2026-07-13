import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function Section({
  title,
  icon,
  children,
  className = "",
  collapsible = false,
  defaultExpanded = true,
}: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    if (collapsible) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div 
      style={{ willChange: "transform" }}
      className={`p-4 md:p-5 rounded-2xl border border-white/[0.05] bg-[#0b0e2d]/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-col gap-3 select-none ${className}`}
    >
      <div 
        onClick={toggleExpand}
        className={`flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/[0.03] pb-2 ${collapsible ? "cursor-pointer hover:text-white transition-colors" : ""}`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          {title}
        </div>
        {collapsible && (
          <span className="shrink-0 text-slate-500 hover:text-slate-350 transition-colors">
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
      </div>
      {(!collapsible || isExpanded) && (
        <div className="flex-1 w-full text-slate-350 text-xs leading-relaxed select-text">
          {children}
        </div>
      )}
    </div>
  );
}

