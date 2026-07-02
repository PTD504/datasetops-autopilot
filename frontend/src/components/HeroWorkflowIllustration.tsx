"use client"

import { useState, useEffect } from "react"
import { 
  Brain, Search, Sparkles, Scale, Download, 
  Terminal, FolderOpen 
} from "lucide-react"

// Simulated agent logs corresponding to each pipeline step
const LOG_DATA = [
  {
    step: 0,
    agent: "System",
    logs: [
      "[SYS] Initializing autopilot workflow instance...",
      "[SYS] Uploaded documents detected: 5 source files (text/markdown).",
      "[SYS] Chunking documents into semantic vectors (size: 512, overlap: 64)...",
      "[SYS] Created 142 semantic vector database chunks successfully."
    ]
  },
  {
    step: 1,
    agent: "Planner Agent",
    logs: [
      "[PLANNER] Planner Agent activated.",
      "[PLANNER] Target benchmark configuration loaded: 40 questions request.",
      "[PLANNER] Mapping blueprint: 20 troubleshooting QA, 10 API usage QA, 10 concept QA.",
      "[PLANNER] Formulated multi-turn generation strategy. Awaiting execution approval."
    ]
  },
  {
    step: 2,
    agent: "Source Agent",
    logs: [
      "[SOURCE] Source Scanning Agent activated.",
      "[SOURCE] Reading semantic maps and scanning chunk content for high-density facts...",
      "[SOURCE] Extracted 42 core concepts and 115 relation tuples.",
      "[SOURCE] Core themes mapped: Auto-Scaling, Cluster Setup, API Token Auth."
    ]
  },
  {
    step: 3,
    agent: "Generator Agent",
    logs: [
      "[GENERATOR] Generator Agent activated. Starting QA generation loop...",
      "[GENERATOR] Generating QA Pair 12/40. Context: cluster_config.md L45-90...",
      "[GENERATOR] Generating QA Pair 24/40. Context: auth_guidelines.md L10-35...",
      "[GENERATOR] QA Generation pass complete. 40 candidates created."
    ]
  },
  {
    step: 4,
    agent: "Evaluator Agent",
    logs: [
      "[EVALUATOR] Evaluator Agent activated. Starting quality audit...",
      "[EVALUATOR] Auditing Pair 18: Hallucination detected (ungrounded token in response).",
      "[EVALUATOR] Repair loop initiated. Regenerating answer with tighter grounding rules...",
      "[EVALUATOR] Audit success: 40 questions validated. Quality score: 98%."
    ]
  },
  {
    step: 5,
    agent: "Export Module",
    logs: [
      "[SYSTEM] Compilation of benchmark artifacts initiated...",
      "[SYSTEM] Writing rag_eval.jsonl, answer_key.jsonl, dataset_card.md...",
      "[SYSTEM] Packaging artifacts to export.zip...",
      "[SYSTEM] Export ready. Workflow completed successfully."
    ]
  }
]

// Interactive workflow illustration component
export default function HeroWorkflowIllustration() {
  const [activeStep, setActiveStep] = useState(0)
  const [telemetry, setTelemetry] = useState({
    apiCalls: 0,
    cost: 0.0000,
    tokens: 0
  })

  const steps = [
    { name: "Documents", icon: FolderOpen, agent: "System" },
    { name: "Planner", icon: Brain, agent: "PlannerAgent" },
    { name: "Scanning", icon: Search, agent: "SourceAgent" },
    { name: "Generator", icon: Sparkles, agent: "GeneratorAgent" },
    { name: "Evaluator", icon: Scale, agent: "EvaluatorAgent" },
    { name: "Export Package", icon: Download, agent: "ExportSystem" }
  ]

  // Sequential progression timer - accelerated to 3.0s for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [steps.length])

  // Update telemetry metrics based on active step to simulate real-time agent execution
  useEffect(() => {
    const baseCalls = [2, 10, 22, 38, 48, 52]
    const baseCost = [0.0004, 0.0210, 0.0482, 0.1245, 0.1852, 0.2014]
    const baseTokens = [1200, 15400, 48900, 142000, 218900, 225400]

    let startCalls = baseCalls[activeStep === 0 ? steps.length - 1 : activeStep - 1]
    const targetCalls = baseCalls[activeStep]
    
    let startCost = baseCost[activeStep === 0 ? steps.length - 1 : activeStep - 1]
    const targetCost = baseCost[activeStep]

    let startTokens = baseTokens[activeStep === 0 ? steps.length - 1 : activeStep - 1]
    const targetTokens = baseTokens[activeStep]

    if (activeStep === 0) {
      startCalls = 0
      startCost = 0.0
      startTokens = 0
    }

    const duration = 700 // Faster transition for accelerated dynamic look
    const startTime = performance.now()

    let animFrameId: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      setTelemetry({
        apiCalls: Math.floor(startCalls + (targetCalls - startCalls) * ease),
        cost: Number((startCost + (targetCost - startCost) * ease).toFixed(4)),
        tokens: Math.floor(startTokens + (targetTokens - startTokens) * ease)
      })

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate)
      }
    }

    animFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameId)
  }, [activeStep, steps.length])

  // Assemble logs to display in the terminal panel
  const getTerminalLogs = () => {
    const logsList: string[] = []
    for (let i = 0; i <= activeStep; i++) {
      const stepLogs = LOG_DATA[i].logs
      if (i === activeStep) {
        logsList.push(...stepLogs)
      } else {
        logsList.push(stepLogs[stepLogs.length - 1])
      }
    }
    return logsList.slice(-6)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto group">
      {/* Ambient background glows behind the card */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-40 blur-2xl group-hover:opacity-60 transition duration-1000 pointer-events-none"></div>
      
      {/* Visual lighting point source above console */}
      <div className="absolute top-[-50px] left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none"></div>

      {/* Simulated IDE / Dashboard Window */}
      <div className="relative border border-white/[0.08] bg-[#070814]/95 backdrop-blur-xl rounded-2xl p-5 shadow-[0_0_50px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-4 font-mono text-xs overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="text-[10px] text-slate-500 ml-2 font-sans">trace_session_09e.log</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-sans font-semibold uppercase tracking-wide">RUNNING</span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-white/[0.01] border border-white/[0.06] rounded-xl p-3 text-center text-[10px]">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans">Active Agent</span>
            <span className="font-bold text-indigo-400 transition-all duration-300 font-mono truncate">{steps[activeStep].agent}</span>
          </div>
          <div className="flex flex-col gap-0.5 border-x border-white/[0.06]">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans">API Calls</span>
            <span className="font-bold text-slate-200 transition-all duration-300">{telemetry.apiCalls} / 50</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans">Estimated Cost</span>
            <span className="font-bold text-emerald-400 transition-all duration-300">${telemetry.cost.toFixed(4)}</span>
          </div>
        </div>

        {/* Layout: Pipeline Nodes (Left) & Terminal Output (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[250px] items-start pt-2">
          
          {/* Vertical Pipeline Nodes (col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full relative pl-2">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = activeStep === idx
              const isCompleted = activeStep > idx
              
              return (
                <div key={idx} className="relative flex items-center gap-3 h-[32px] group/node cursor-pointer">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-[21px] left-[10px] w-[2px] h-[19px] bg-slate-800/80">
                      {isActive && (
                        <div className="absolute left-[-1.5px] w-[5px] h-[5px] rounded-full bg-indigo-300 animate-particle shadow-[0_0_12px_rgba(129,140,248,1.0),0_0_6px_rgba(255,255,255,0.8)]"></div>
                      )}
                    </div>
                  )}

                  {/* Icon Circle */}
                  <div className={`relative w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all duration-300 z-10 ${
                    isActive 
                      ? "border-indigo-400 bg-indigo-950/60 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105" 
                      : isCompleted 
                        ? "border-emerald-500/80 bg-emerald-950/20 text-emerald-400" 
                        : "border-slate-800 bg-slate-900/30 text-slate-500"
                  }`}>
                    <Icon size={11} className={isActive ? "animate-pulse" : ""} />
                  </div>

                  {/* Text Details */}
                  <span className={`text-[10px] font-sans font-medium transition-colors duration-300 truncate ${
                    isActive 
                      ? "text-white font-bold" 
                      : isCompleted 
                        ? "text-slate-400" 
                        : "text-slate-600"
                  }`}>
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Terminal Logs (col-span-7) */}
          <div className="md:col-span-7 bg-black/50 border border-white/[0.04] rounded-xl p-3 h-full flex flex-col justify-end text-[9px] text-slate-400 leading-relaxed font-mono relative overflow-hidden">
            <div className="absolute top-2 left-3 flex items-center gap-1.5 opacity-40">
              <Terminal size={10} />
              <span className="text-[8px] uppercase tracking-wider font-sans">Live Console</span>
            </div>
            <div className="space-y-1.5 overflow-hidden flex flex-col justify-end">
              {getTerminalLogs().map((log, logIdx) => (
                <div key={logIdx} className={`transition-all duration-300 truncate ${
                  logIdx === getTerminalLogs().length - 1 ? "text-indigo-300" : "text-slate-500"
                }`}>
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-0.5 text-indigo-400 font-bold">
                <span>$ executing_agents</span>
                <span className="w-1.5 h-3 bg-indigo-400 animate-pulse ml-0.5"></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
