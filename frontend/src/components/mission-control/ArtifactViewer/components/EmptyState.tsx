import React from "react";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "No Artifact Available",
  description = "This stage has not produced any artifacts yet or the pipeline is waiting to execute it.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.005] select-none min-h-[200px]">
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-500 mb-3 flex items-center justify-center">
        {icon || <AlertCircle size={20} />}
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
