import React from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Pause, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStatus } from "./types";
import { getWorkflowDerivedState } from "./workflowStateHelpers";

interface WorkflowBannerProps {
  projectId: string;
  workflowStatus: WorkflowStatus;
  sampleReviewCount?: number;
}

import { useMissionControlStore } from "./store/useMissionControlStore";

export default function WorkflowBanner({
  projectId,
  workflowStatus,
  sampleReviewCount = 3,
}: WorkflowBannerProps) {
  const { isDownloaded, setSelectedNodeId, setIsPlanReviewOpen } = useMissionControlStore();
  const derivedState = getWorkflowDerivedState(workflowStatus, projectId, sampleReviewCount);

  // Customize banner fields for the final Export stage based on download status
  if (workflowStatus === "EXPORT_READY" || workflowStatus === "DONE") {
    if (isDownloaded) {
      derivedState.bannerTitle = "Mission Complete";
      derivedState.bannerDescription = "Benchmark exported successfully. Ready for evaluation.";
      derivedState.bannerActionLabel = "Create Another Benchmark";
      derivedState.bannerActionHref = "/projects/new";
    } else {
      derivedState.bannerTitle = "Workflow Complete";
      derivedState.bannerDescription = "Package generated successfully.";
      derivedState.bannerActionLabel = "Open Package Explorer";
      derivedState.bannerActionHref = "#";
    }
  }

  if (derivedState.bannerType === "none") {
    return null;
  }

  // Define visual themes based on banner type
  let bannerClass = "";
  let glowClass = "";
  let iconComponent = null;
  let actionButtonVariant: "default" | "secondary" | "outline" = "default";
  let actionButtonClass = "";

  switch (derivedState.bannerType) {
    case "running":
      bannerClass = "border-indigo-500/20 bg-indigo-500/[0.02] text-indigo-200";
      glowClass = "from-indigo-500/10 to-transparent";
      iconComponent = <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />;
      break;
    case "warning":
      bannerClass = "border-amber-500/30 bg-amber-500/[0.03] text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
      glowClass = "from-amber-500/10 to-transparent";
      iconComponent = <Pause className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />;
      actionButtonVariant = "default";
      actionButtonClass = "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)] border-none";
      break;
    case "success":
      bannerClass = "border-emerald-500/30 bg-emerald-500/[0.03] text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
      glowClass = "from-emerald-500/10 to-transparent";
      iconComponent = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      actionButtonVariant = "default";
      actionButtonClass = "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)] border-none";
      break;
    case "info":
    default:
      bannerClass = "border-slate-700/40 bg-slate-800/[0.02] text-slate-300";
      glowClass = "from-slate-500/5 to-transparent";
      iconComponent = <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />;
      actionButtonVariant = "outline";
      actionButtonClass = "border-white/10 hover:bg-white/5 text-white";
      break;
  }

  return (
    <div 
      className={`relative w-full border backdrop-blur-md rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden transition-all duration-500 ease-in-out shrink-0 ${bannerClass}`}
    >
      {/* Dynamic ambient background glow */}
      <div className={`absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-br ${glowClass} rounded-full blur-[40px] pointer-events-none opacity-40`}></div>
      <div className={`absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-br ${glowClass} rounded-full blur-[40px] pointer-events-none opacity-20`}></div>

      {/* Banner message context */}
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
          {iconComponent}
        </div>
        <div className="space-y-0.5">
          {derivedState.bannerTitle && (
            <h4 className="text-[10px] font-bold tracking-wider uppercase opacity-65 font-mono">
              {derivedState.bannerTitle}
            </h4>
          )}
          <p className="text-sm font-semibold leading-normal text-white">
            {derivedState.bannerDescription}
          </p>
        </div>
      </div>

      {/* Action button (surfaced contextually) */}
      {derivedState.bannerActionLabel && derivedState.bannerActionHref && (
        <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
          <Link 
            href={derivedState.bannerActionHref} 
            className="w-full md:w-auto"
            onClick={(e) => {
              if (workflowStatus === "WAITING_FOR_PLAN_APPROVAL") {
                e.preventDefault();
                setIsPlanReviewOpen(true);
              } else if (workflowStatus === "WAITING_FOR_SAMPLE_REVIEW") {
                e.preventDefault();
                setSelectedNodeId("evaluator");
              } else if (derivedState.bannerActionLabel === "Open Package Explorer") {
                e.preventDefault();
                setSelectedNodeId("exporter");
              }
            }}
          >
            <Button
              variant={actionButtonVariant}
              size="sm"
              className={`rounded-xl px-5 h-9 text-xs flex items-center justify-center gap-1.5 w-full md:w-auto transition-all duration-300 active:scale-95 group ${actionButtonClass}`}
            >
              {derivedState.bannerActionLabel}
              <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
