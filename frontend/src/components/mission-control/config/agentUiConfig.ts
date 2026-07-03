import { 
  Scissors, 
  Binary, 
  Brain, 
  Map, 
  Sparkles, 
  ShieldCheck, 
  FileArchive,
  LucideIcon
} from "lucide-react";

export interface AgentUiConfig {
  colorClass: string;
  glowClass: string;
  borderColorClass: string;
  icon: LucideIcon;
}

export const AGENT_UI_CONFIGS: Record<string, AgentUiConfig> = {
  preprocessing: {
    colorClass: "text-slate-400",
    glowClass: "shadow-none",
    borderColorClass: "border-slate-700/40",
    icon: Binary,
  },
  source_understanding: {
    colorClass: "text-violet-400",
    glowClass: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    borderColorClass: "border-violet-500/30",
    icon: Brain,
  },
  intake_planner: {
    colorClass: "text-cyan-400",
    glowClass: "shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    borderColorClass: "border-cyan-500/30",
    icon: Map,
  },
  generator: {
    colorClass: "text-amber-400",
    glowClass: "shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    borderColorClass: "border-amber-500/30",
    icon: Sparkles,
  },
  evaluator: {
    colorClass: "text-rose-400",
    glowClass: "shadow-[0_0_15px_rgba(251,113,133,0.3)]",
    borderColorClass: "border-rose-500/30",
    icon: ShieldCheck,
  },
  exporter: {
    colorClass: "text-emerald-400",
    glowClass: "shadow-[0_0_15px_rgba(52,211,153,0.3)]",
    borderColorClass: "border-emerald-500/30",
    icon: FileArchive,
  },
};
