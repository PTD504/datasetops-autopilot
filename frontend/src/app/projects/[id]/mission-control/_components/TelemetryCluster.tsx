import React from "react";
import { 
  DollarSign, 
  Cpu, 
  Layers, 
  Activity, 
  AlertCircle, 
  ShieldAlert
} from "lucide-react";

export const TELEMETRY_ICONS = {
  DollarSign,
  Cpu,
  Layers,
  Activity,
  AlertCircle,
  ShieldAlert
};

export interface TelemetryMetric {
  id: string;
  label: string;
  value: string | number;
  maxValue?: string | number;
  percentage?: number; // Optional progress percentage (0 - 100)
  status?: "ok" | "warning" | "error" | "info" | "default";
  iconName?: keyof typeof TELEMETRY_ICONS;
}

interface TelemetryClusterProps {
  metrics: TelemetryMetric[];
  title?: string;
}

export default function TelemetryCluster({ metrics }: TelemetryClusterProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono select-none pointer-events-auto bg-[#07091d]/40 backdrop-blur-sm border border-white/[0.04] px-4 py-1.5 rounded-full shadow-lg">
      {metrics.map((metric, idx) => {
        let valColor = "text-slate-350 font-semibold";
        if (metric.status === "error") {
          valColor = "text-rose-400 font-bold";
        } else if (metric.status === "warning") {
          valColor = "text-amber-400 font-bold";
        }
        
        return (
          <React.Fragment key={metric.id}>
            {idx > 0 && <span className="text-slate-700 select-none">•</span>}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">{metric.label}:</span>
              <span className={valColor}>{metric.value}</span>
              {metric.maxValue && (
                <span className="text-slate-650 text-[9px]">/ {metric.maxValue}</span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

