import React from "react";
import { Network } from "lucide-react";

export default function GraphPanel() {
  return (
    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#090b20]/25">
      {/* Blueprint grid mesh overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "2.5rem 2.5rem",
        }}
      ></div>

      {/* Subtle ambient indigo background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>

      {/* Main Empty Canvas Centerpiece */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
          <Network size={24} className="text-indigo-400" />
        </div>
        <h4 className="text-base font-extrabold tracking-wide text-white">Directed Flow Network</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          The multi-agent workflow coordinates autonomously here. Nodes and active repair pathways will render in Phase 3.
        </p>
      </div>
    </div>
  );
}
