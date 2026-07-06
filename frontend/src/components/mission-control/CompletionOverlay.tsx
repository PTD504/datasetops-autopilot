import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, ArrowRight, Sparkles } from "lucide-react";
import { useMissionControlStore } from "./store/useMissionControlStore";

export default function CompletionOverlay() {
  const router = useRouter();
  const { showCompletionOverlay, setShowCompletionOverlay } = useMissionControlStore();

  if (!showCompletionOverlay) return null;

  const handleCreateAnother = () => {
    setShowCompletionOverlay(false);
    router.push("/projects/new");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030014]/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-[COFadeIn_0.3s_ease-out_forwards]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes COFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes COScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      ` }} />

      <div 
        className="bg-gradient-to-b from-[#0b0f2d]/95 to-[#05071a]/95 border border-white/[0.08] backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] rounded-3xl w-full max-w-md p-8 relative flex flex-col items-center text-center animate-[COScaleIn_0.25s_ease-out_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowCompletionOverlay(false)}
          aria-label="Dismiss Completion Screen"
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Floating background sparkles */}
        <div className="absolute top-10 left-12 w-6 h-6 text-emerald-500/20 animate-pulse">
          <Sparkles size={24} />
        </div>
        <div className="absolute bottom-16 right-12 w-4 h-4 text-emerald-500/20 animate-pulse delay-75">
          <Sparkles size={16} />
        </div>

        {/* Big checkmark badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-6 animate-bounce">
          <CheckCircle2 size={36} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-2 font-sans">
          Benchmark Exported!
        </h2>
        
        <p className="text-slate-400 text-xs leading-relaxed max-w-xs mb-8 font-sans font-medium">
          Your evaluation dataset package, specifications specifications card, and quality audit report have been generated and downloaded successfully.
        </p>

        {/* Create another button */}
        <button
          onClick={handleCreateAnother}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/20 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-[0.98] group"
        >
          <span>Create Another Benchmark</span>
          <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Dismiss hint link */}
        <button 
          onClick={() => setShowCompletionOverlay(false)}
          className="mt-4 text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors cursor-pointer"
        >
          Return to Mission Control
        </button>
      </div>
    </div>
  );
}
