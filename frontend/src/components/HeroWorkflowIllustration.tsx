"use client"

import { useState, useEffect } from "react"
import { 
  Brain, Search, Sparkles, Scale, Download, 
  Terminal, FolderOpen, RefreshCw
} from "lucide-react"

// Simulated agent logs corresponding to each pipeline step in the actual codebase
const LOG_DATA = [
  {
    step: 0,
    agent: "System",
    logs: [
      "[SYS] Initializing Autopilot workflow session...",
      "[SYS] Ingested 5 document files (markdown/text).",
      "[SYS] Formed 142 semantic text chunks.",
      "[SYS] Document ingestion completed successfully."
    ]
  },
  {
    step: 1,
    agent: "Source Understander",
    logs: [
      "[SOURCE] Source Scanner activated.",
      "[SOURCE] Reading semantic maps and scanning chunk content for high-density facts...",
      "[SOURCE] Extracted 42 core concepts and 115 relation tuples.",
      "[SOURCE] Mapped category coverage levels: Troubleshooting, Setup, Token Auth."
    ]
  },
  {
    step: 2,
    agent: "Intake Planner",
    logs: [
      "[PLANNER] Intake Planner activated.",
      "[PLANNER] Analyzing category distributions. Formulating benchmark plan...",
      "[PLANNER] Blueprint generated. AWAITING HUMAN APPROVAL...",
      "[PLANNER] Human approval received. Commencing 40-slot generation."
    ]
  },
  {
    step: 3,
    agent: "Generator",
    logs: [
      "[GENERATOR] Generator activated. Accessing source chunks...",
      "[GENERATOR] Generating single-hop, multi-hop, unanswerable, and edge-case QA pairs...",
      "[GENERATOR] Grounding QA pairs strictly in document references...",
      "[GENERATOR] Candidate QA generation complete. 40 samples created."
    ]
  },
  {
    step: 4,
    agent: "Quality Evaluator",
    logs: [
      "[EVALUATOR] Quality Evaluator activated. Starting quality checks...",
      "[EVALUATOR] Running multi-criteria quality check (Faithfulness, Relevance, Hallucination Risk)...",
      "[EVALUATOR] Audit mismatch: Hallucination detected in sample 18 (failed faithfulness).",
      "[EVALUATOR] Flagging sample 18 for repair."
    ]
  },
  {
    step: 5,
    agent: "RepairLoopAgent",
    logs: [
      "[REPAIR LOOP] Repair Loop activated. Initiating Self-Repair Loop...",
      "[REPAIR LOOP] Providing repair instructions to Generator Agent for sample 18...",
      "[REPAIR LOOP] Regenerated sample 18. Evaluator audit: PASSED.",
      "[REPAIR LOOP] Self-repair completed. All 40 samples verified."
    ]
  },
  {
    step: 6,
    agent: "Exporter",
    logs: [
      "[EXPORTER] Exporter compiling output bundle...",
      "[EXPORTER] Creating rag_eval.jsonl, answer_key.jsonl, dataset_card.md, quality_report.md...",
      "[EXPORTER] Packaging benchmark suite into ZIP package...",
      "[EXPORTER] Export ZIP ready. Autopilot session completed successfully."
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
    { name: "Ingestion", icon: FolderOpen, agent: "System" },
    { name: "Source Scanner", icon: Search, agent: "Source Understander" },
    { name: "Planner", icon: Brain, agent: "Intake Planner" },
    { name: "Generator", icon: Sparkles, agent: "Generator" },
    { name: "Evaluator", icon: Scale, agent: "Quality Evaluator" },
    { name: "Repair Loop", icon: RefreshCw, agent: "Repair Loop" },
    { name: "Exporter", icon: Download, agent: "Exporter" }
  ]

  // Sequential progression timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [steps.length])

  // Update telemetry metrics based on active step to simulate real-time agent execution
  useEffect(() => {
    const baseCalls = [2, 10, 15, 38, 48, 52, 55]
    const baseCost = [0.0004, 0.0210, 0.0350, 0.1245, 0.1852, 0.1985, 0.2014]
    const baseTokens = [1200, 15400, 24800, 142000, 218950, 222400, 225400]

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

    const duration = 700 
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
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-40 blur-2xl group-hover:opacity-60 transition duration-1000 pointer-events-none"></div>
      
      {/* Visual lighting point source above console */}
      <div className="absolute top-[-50px] left-1/4 w-40 h-40 bg-indigo-500/15 rounded-full blur-[50px] pointer-events-none"></div>

      {/* Simulated IDE / Dashboard Window */}
      <div className="relative glass-panel rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-4 font-mono text-xs overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] text-slate-500 ml-2 font-sans font-medium">autopilot_session.log</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-sans font-semibold uppercase tracking-wider">RUNNING</span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center text-[10px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans font-bold">Active Agent</span>
            <span className="font-extrabold text-indigo-400 transition-all duration-300 font-mono truncate">{steps[activeStep].agent}</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-white/[0.06] relative z-10">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans font-bold">API Calls</span>
            <span className="font-bold text-slate-200 transition-all duration-300">{telemetry.apiCalls} / 150</span>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-slate-500 uppercase tracking-wider text-[8px] font-sans font-bold">EST. COST</span>
            <span className="font-extrabold text-emerald-400 transition-all duration-300">${telemetry.cost.toFixed(4)}</span>
          </div>
        </div>

        {/* Layout: Pipeline Nodes (Left) & Terminal Output (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[280px] items-start pt-1">
          
          {/* Vertical Pipeline Nodes (col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full relative pl-2">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = activeStep === idx
              const isCompleted = activeStep > idx
              
              return (
                <div key={idx} className="relative flex items-center gap-3 h-[36px] group/node cursor-pointer select-none">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-[23px] left-[10px] w-[2px] h-[23px] bg-slate-800/80">
                      {isActive && (
                        <div className="absolute left-[-1.5px] w-[5px] h-[5px] rounded-full bg-indigo-400 animate-particle shadow-[0_0_12px_rgba(129,140,248,1.0),0_0_6px_rgba(255,255,255,0.8)]"></div>
                      )}
                    </div>
                  )}

                  {/* Icon Circle */}
                  <div className={`relative w-5.5 h-5.5 rounded-full flex items-center justify-center border text-[10px] transition-all duration-500 z-10 ${
                    isActive 
                      ? "border-indigo-400 bg-indigo-950/80 text-indigo-300 shadow-[0_0_20px_rgba(99,102_241,0.6)] scale-110" 
                      : isCompleted 
                        ? "border-emerald-500/80 bg-emerald-950/20 text-emerald-400" 
                        : "border-slate-800 bg-slate-900/30 text-slate-500"
                  }`}>
                    <Icon size={11} className={isActive ? "animate-pulse" : ""} />
                    {isActive && (
                      <div className="absolute -inset-1 rounded-full border border-indigo-400/30 animate-ping opacity-60"></div>
                    )}
                  </div>

                  {/* Text Details */}
                  <span className={`text-[10px] font-sans font-semibold transition-colors duration-300 truncate ${
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
          <div className="md:col-span-7 bg-black/60 border border-white/[0.04] rounded-xl p-3.5 h-full flex flex-col justify-end text-[9px] text-slate-400 leading-relaxed font-mono relative overflow-hidden shadow-inner">
            <div className="absolute top-2 left-3 flex items-center gap-1.5 opacity-40">
              <Terminal size={10} />
              <span className="text-[8px] uppercase tracking-wider font-sans font-bold">Live Console</span>
            </div>
            <div className="space-y-1.5 overflow-hidden flex flex-col justify-end">
              {getTerminalLogs().map((log, logIdx) => (
                <div key={logIdx} className={`transition-all duration-300 truncate font-mono ${
                  logIdx === getTerminalLogs().length - 1 ? "text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]" : "text-slate-500"
                }`}>
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-0.5 text-indigo-400 font-bold mt-1">
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
