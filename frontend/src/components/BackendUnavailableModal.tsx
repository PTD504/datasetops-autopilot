"use client"

import React from "react"
import { 
  AlertTriangle, 
  X, 
  Terminal, 
  RefreshCw 
} from "lucide-react"

interface BackendUnavailableModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry?: () => void
}

export default function BackendUnavailableModal({
  isOpen,
  onClose,
  onRetry
}: BackendUnavailableModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Glow Container */}
      <div className="relative w-full max-w-lg bg-[#08091a] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.18)] overflow-hidden text-slate-100 transition-all">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />

        {/* Ambient Radial Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Header Section */}
          <div className="space-y-3">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>Backend Status: Compute Paused</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1 shadow-inner">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Backend Cloud Service Unavailable
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The backend multi-agent orchestration server is currently paused due to compute resource limitations. Live workflow execution and graph trace logging cannot be processed at this moment.
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic Console Box */}
          <div className="p-3.5 rounded-xl bg-[#040510] border border-white/10 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Terminal size={12} className="text-amber-400" />
                <span className="font-semibold text-slate-200">System Diagnostic</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                HTTP 503
              </span>
            </div>

            <div className="space-y-1 text-slate-300 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Target:</span>
                <span className="text-slate-300 font-mono">api.autopilot-rag.internal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Error Reason:</span>
                <span className="text-amber-300 font-medium">COMPUTE_QUOTA_EXHAUSTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Worker Status:</span>
                <span className="text-slate-400">Paused (Resource Limit Reached)</span>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            {onRetry && (
              <button
                onClick={() => {
                  onClose()
                  onRetry()
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry Connection</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[size:200%_auto] hover:bg-right text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
            >
              <span>Close</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
