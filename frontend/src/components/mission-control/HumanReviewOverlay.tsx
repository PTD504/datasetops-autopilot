import React from "react";
import { WorkflowStatus } from "./types";
import { getWorkflowDerivedState } from "./workflowStateHelpers";

interface HumanReviewOverlayProps {
  projectId: string;
  workflowStatus: WorkflowStatus;
}

export default function HumanReviewOverlay({
  projectId,
  workflowStatus,
}: HumanReviewOverlayProps) {
  const derivedState = getWorkflowDerivedState(workflowStatus, projectId);

  if (!derivedState.isPaused || !derivedState.bannerActionLabel || !derivedState.bannerActionHref) {
    return null;
  }

  // Determine indicator color theme matching the warning banner
  const accentColorClass = "text-amber-400";
  const bgBorderClass = "border-amber-500/50 bg-[#0e0904]/90 text-slate-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse";

  return (
    <div 
      className={`flex items-center justify-center gap-3 px-5 py-2.5 rounded-full border-2 backdrop-blur-md text-[11px] font-medium leading-none select-none ${bgBorderClass}`}
    >
      {/* Pulsing ring indicator */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      
      <span className="font-semibold text-white tracking-wide">
        Checkpoint Active: <span className={accentColorClass}>{derivedState.bannerActionLabel}</span>
      </span>
    </div>
  );
}
