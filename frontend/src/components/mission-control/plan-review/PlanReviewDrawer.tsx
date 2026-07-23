import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, Cpu, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { useMissionControlStore } from "../store/useMissionControlStore";
import BenchmarkPlanForm, { PlanData } from "./BenchmarkPlanForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PlanReviewDrawerProps {
  projectId: string;
  onClose: () => void;
  onPlanApproved: () => void;
}

export default function PlanReviewDrawer({
  projectId,
  onClose,
  onPlanApproved,
}: PlanReviewDrawerProps) {
  const { setSelectedNodeId, currentWorkflowStatus } = useMissionControlStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = "";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/plan`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      } else {
        setError("Failed to load benchmark plan draft from server.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setTimeout(() => {
      fetchPlan();
    }, 0);
  }, [projectId, fetchPlan]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const handleSavePlan = async (updatedPlan: PlanData): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const apiUrl = "";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan),
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        setIsSaving(false);
        return true;
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to save plan changes.");
        setIsSaving(false);
        return false;
      }
    } catch (e) {
      console.error(e);
      setError("Network error: Failed to save changes.");
      setIsSaving(false);
      return false;
    }
  };

  const handleApprovePlan = async () => {
    setIsApproving(true);
    setApproveError(null);
    try {
      const apiUrl = "";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/plan/approve`, {
        method: "POST",
      });

      if (res.ok) {
        onPlanApproved();
      } else {
        const errData = await res.json();
        setApproveError(errData.detail || "Failed to approve plan. Check budget or quota constraints.");
      }
    } catch (e) {
      console.error(e);
      setApproveError("Network error: Failed to approve plan.");
    } finally {
      setIsApproving(false);
    }
  };

  const isPreGeneration = currentWorkflowStatus === "WAITING_FOR_PLAN_APPROVAL" || currentWorkflowStatus === "PLAN_READY" || currentWorkflowStatus === "PLANNING" || currentWorkflowStatus === "LOADING";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end select-none animate-[MCFadeIn_0.2s_ease-out_forwards] pointer-events-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes MCFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes MCSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .custom-workspace-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-workspace-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          border: 1px solid transparent;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      ` }} />

      <div
        ref={drawerRef}
        className="w-full max-w-xl bg-gradient-to-b from-[#0a0d30]/98 to-[#05061c]/98 border-l border-white/[0.08] backdrop-blur-xl h-full shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] flex flex-col relative z-50 overflow-hidden animate-[MCSlideIn_0.25s_ease-out_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left colored border stripe accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-600 opacity-80"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5 shrink-0 relative z-10">
          <div className="space-y-0.5 text-left pl-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Review & Approve Benchmark Plan
              </h2>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider animate-pulse">
                Human Checkpoint
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Review proposed targets, edit parameters, and approve to begin generation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-workspace-scroll select-text space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                Fetching draft plan...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="border-red-500/20 bg-red-950/20 text-red-200 text-left">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="font-bold text-xs uppercase tracking-wide">Error Loading Plan</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : plan ? (
            <>
              {/* Informational Callout */}
              <div className="p-3.5 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.02] text-[11px] text-slate-350 space-y-2 text-left">
                <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[10px]">
                  <Sparkles size={11} className="text-cyan-400" />
                  AI Generation Scoping Report
                </div>
                <p className="leading-relaxed">
                  The planner has completed document coverage mapping. You can review the compiled goals, categories, and rule constraints. Click below to inspect chunk-level match metadata and AI reasoning summaries.
                </p>
                <button
                  onClick={() => setSelectedNodeId("intake_planner")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold transition-colors cursor-pointer text-[10px]"
                >
                  <Cpu size={10} className="text-cyan-400" />
                  View Detailed AI Reasoning & Coverage
                </button>
              </div>

              {/* Source warnings if exist */}
              {plan.source_warnings && plan.source_warnings.length > 0 && (
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] text-[11px] text-amber-250 space-y-1.5 text-left">
                  <div className="font-bold flex items-center gap-1.5 text-white uppercase text-[10px] tracking-wider">
                    ⚠️ Applied Guardrails & Source Warnings
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {plan.source_warnings.map((w, idx) => (
                      <li key={idx} className="leading-relaxed">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form itself */}
              <BenchmarkPlanForm
                plan={plan}
                onSave={handleSavePlan}
                isSaving={isSaving}
                onCancel={onClose}
                isPreGeneration={isPreGeneration}
              />
            </>
          ) : null}
        </div>

        {/* Footer: Approve & Generate */}
        {plan && !loading && isPreGeneration && (
          <div className="border-t border-white/[0.06] p-5 shrink-0 bg-[#05061c]/40 relative z-10">
            {approveError && (
              <Alert variant="destructive" className="border-red-500/20 bg-red-950/20 text-red-200 text-left mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertTitle className="font-bold text-xs uppercase tracking-wide">Approval Failed</AlertTitle>
                <AlertDescription className="text-xs">{approveError}</AlertDescription>
              </Alert>
            )}

            <button
              onClick={handleApprovePlan}
              disabled={isSaving || isApproving}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold h-12 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all"
            >
              {isApproving ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Approving & Starting Generation...
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  Approve & Generate Samples
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
