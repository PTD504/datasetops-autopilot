import React, { useState } from "react"
import { 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Clock, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  Network,
  FileText
} from "lucide-react"

export interface ToolCallLog {
  id: string
  project_id: string
  agent_run_id: string | null
  tool_name: string
  input_summary: string | null
  output_summary: string | null
  status: string
  latency_ms: number | null
  created_at: string
}

export interface AgentRun {
  id: string
  project_id: string
  agent_name: string
  status: string
  input_summary: string | null
  decision_summary: string | null
  output_json: Record<string, unknown> | null
  warnings: string[] | string | null
  confidence_score: number | null
  started_at: string
  completed_at: string | null
  tool_calls?: ToolCallLog[]
}

export interface WorkflowEvent {
  id: string
  project_id: string
  event_type: string
  message: string
  event_metadata: Record<string, unknown> | null
  created_at: string
}

export interface AgentArtifact {
  id: string
  project_id: string
  agent_run_id: string | null
  artifact_type: string
  title: string
  summary: string | null
  content_json: Record<string, unknown> | null
  created_at: string
}

export interface TraceItem {
  type: "workflow_event" | "agent_run" | "tool_call" | "artifact"
  timestamp: string
  data: WorkflowEvent | AgentRun | ToolCallLog | AgentArtifact
}

export interface RawTraceItem {
  id: string
  agent_name?: string
  action: string
  details?: Record<string, unknown>
  created_at: string
}

interface WorkflowTracePanelProps {
  traceItems: TraceItem[]
  loading: boolean
  error: boolean
  onRefresh: () => void
  rawTraces: RawTraceItem[]
  status: string
  artifacts?: AgentArtifact[]
}


export function WorkflowTracePanel({
  traceItems,
  loading,
  error,
  onRefresh,
  rawTraces,
  status,
  artifacts = []
}: WorkflowTracePanelProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "console" | "artifacts">("timeline")

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return "00:00:00"
    }
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "Active..."
    try {
      const ms = new Date(end).getTime() - new Date(start).getTime()
      if (ms < 1000) return `${ms}ms`
      return `${(ms / 1000).toFixed(1)}s`
    } catch {
      return ""
    }
  }

  const renderTimelineItem = (item: TraceItem) => {
    const { type, data } = item
    const isExpanded = expandedItems[data.id] || false

    if (type === "workflow_event") {
      const event = data as WorkflowEvent
      return (
        <div key={event.id} className="relative pl-8 pb-6 border-l border-border/60 last:pb-0 last:border-transparent">
          {/* Timeline Node Icon */}
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs text-muted-foreground font-mono">{formatTime(event.created_at)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider self-start sm:self-auto font-mono">
              {event.event_type}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{event.message}</p>
          
          {event.event_metadata && Object.keys(event.event_metadata).length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => toggleExpand(event.id)}
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? "Hide Details" : "Show Details"}
              </button>
              {isExpanded && (
                <pre className="mt-2 p-3 text-xs bg-muted/50 rounded-lg overflow-x-auto border font-mono max-h-48 text-muted-foreground">
                  {JSON.stringify(event.event_metadata, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    if (type === "agent_run") {
      const run = data as AgentRun
      const isSuccess = run.status === "completed"
      const isFailed = run.status === "failed"

      return (
        <div key={run.id} className="relative pl-8 pb-6 border-l border-border/60 last:pb-0 last:border-transparent">
          {/* Timeline Node Icon */}
          <div className={`absolute -left-3.5 top-1 w-7 h-7 rounded-full border-2 border-background flex items-center justify-center ${
            isSuccess ? "bg-green-500" : isFailed ? "bg-red-500" : "bg-yellow-500 animate-pulse"
          }`}>
            <Network size={14} className="text-white" />
          </div>

          <div className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
              <div>
                <span className="text-xs text-muted-foreground font-mono block mb-0.5">{formatTime(run.started_at)}</span>
                <span className="text-sm font-bold text-primary">{run.agent_name}</span>
              </div>
              <div className="flex items-center gap-2">
                {run.completed_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(run.started_at, run.completed_at)}
                  </span>
                )}
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isSuccess ? "bg-green-50 text-green-700 border-green-200" : 
                  isFailed ? "bg-red-50 text-red-700 border-red-200" : 
                  "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  {run.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {run.input_summary && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Input Goal / Context</span>
                  <p className="text-xs text-foreground bg-background/50 border rounded-lg p-2.5 leading-relaxed font-medium">{run.input_summary}</p>
                </div>
              )}

              {run.decision_summary && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Decision Summary</span>
                  <p className="text-xs text-foreground font-medium bg-secondary/20 p-2.5 rounded-lg border border-secondary/40 leading-relaxed">{run.decision_summary}</p>
                </div>
              )}

              {run.warnings && (Array.isArray(run.warnings) ? run.warnings.length > 0 : run.warnings) && (
                <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <AlertCircle size={14} className="text-amber-600" />
                    Agent Warnings
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {Array.isArray(run.warnings) ? (
                      run.warnings.map((w, idx) => <li key={idx} className="leading-normal">{w}</li>)
                    ) : (
                      <li className="leading-normal">{String(run.warnings)}</li>
                    )}
                  </ul>
                </div>
              )}

              {run.confidence_score !== null && run.confidence_score !== undefined && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Evaluation Score:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">{(run.confidence_score * 100).toFixed(0)}%</span>
                    <div className="w-24 bg-secondary/50 rounded-full h-2 overflow-hidden border">
                      <div 
                        className={`h-full rounded-full ${
                          run.confidence_score >= 0.85 ? "bg-green-500" : run.confidence_score >= 0.60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${run.confidence_score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {run.output_json && Object.keys(run.output_json).length > 0 && (
                <div className="pt-1">
                  <button 
                    onClick={() => toggleExpand(run.id)}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? "Hide Output Snapshot" : "View Output Snapshot"}
                  </button>
                  {isExpanded && (
                    <pre className="mt-2 p-3 text-xs bg-background border rounded-lg overflow-x-auto font-mono max-h-48 text-muted-foreground">
                      {JSON.stringify(run.output_json, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (type === "tool_call") {
      const tc = data as ToolCallLog
      const isSuccess = tc.status === "success"
      return (
        <div key={tc.id} className="relative pl-8 pb-6 border-l border-border/60 last:pb-0 last:border-transparent">
          {/* Timeline Node Icon */}
          <div className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border border-background flex items-center justify-center ${
            isSuccess ? "bg-slate-500" : "bg-red-500"
          }`}>
            <Wrench size={8} className="text-white" />
          </div>

          <div className="p-3 bg-muted/15 border border-border/50 rounded-lg space-y-2 max-w-xl">
            <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">{formatTime(tc.created_at)}</span>
                <span className="text-xs font-semibold text-muted-foreground">{tc.tool_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tc.latency_ms !== null && (
                  <span className="text-[10px] font-mono font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-muted/65">
                    {tc.latency_ms}ms
                  </span>
                )}
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isSuccess ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"
                }`}>
                  {tc.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {tc.input_summary && (
                <div className="text-[11px] text-muted-foreground leading-normal">
                  <span className="font-bold text-[9px] uppercase tracking-wider mr-1 text-muted-foreground/80">Input:</span>
                  {tc.input_summary}
                </div>
              )}
              {tc.output_summary && (
                <div className="text-[11px] text-foreground font-medium leading-normal">
                  <span className="font-bold text-[9px] uppercase tracking-wider mr-1 text-muted-foreground/80">Output:</span>
                  {tc.output_summary}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (type === "artifact") {
      const artifact = data as AgentArtifact
      const isExpanded = expandedItems[artifact.id] || false
      return (
        <div key={artifact.id} className="relative pl-8 pb-6 border-l border-border/60 last:pb-0 last:border-transparent">
          {/* Timeline Node Icon: FileText style icon */}
          <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-indigo-500 border-2 border-background flex items-center justify-center shadow-sm">
            <FileText size={12} className="text-white" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs text-muted-foreground font-mono">{formatTime(artifact.created_at)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider self-start sm:self-auto font-mono">
              {artifact.artifact_type}
            </span>
          </div>
          <h4 className="mt-1 text-sm font-bold text-foreground">Handoff: {artifact.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground font-medium">{artifact.summary}</p>
          
          {artifact.content_json && Object.keys(artifact.content_json).length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => toggleExpand(artifact.id)}
                className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? "Hide Payload" : "View Structured Payload"}
              </button>
              {isExpanded && (
                <pre className="mt-2 p-3 text-xs bg-muted/50 rounded-lg overflow-x-auto border font-mono max-h-48 text-muted-foreground">
                  {JSON.stringify(artifact.content_json, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      {/* Tabs Selector & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex bg-muted p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "timeline" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Execution Flow
          </button>
          <button
            onClick={() => setActiveTab("artifacts")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "artifacts" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Handoff Artifacts
          </button>
          <button
            onClick={() => setActiveTab("console")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "console" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Console Log
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {loading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-background hover:bg-muted/50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === "timeline" ? (
        <div className="pt-2">
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 border rounded-xl bg-red-50/10 border-red-200/50">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Trace Loading Failed</p>
                <p className="text-xs text-muted-foreground max-w-sm">There was a problem loading the agent trace details from the server.</p>
              </div>
              <button 
                onClick={onRefresh} 
                className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-md shadow"
              >
                Retry Fetch
              </button>
            </div>
          ) : loading && traceItems.length === 0 ? (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded-md w-1/4"></div>
                  <div className="h-20 bg-muted animate-pulse rounded-md w-full"></div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded-md w-1/5"></div>
                  <div className="h-10 bg-muted animate-pulse rounded-md w-2/3"></div>
                </div>
              </div>
            </div>
          ) : traceItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/10">
              <Network className="w-10 h-10 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="text-sm font-bold text-foreground">No Logs Available Yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-normal">
                Upload document files and click &quot;Start Autopilot&quot; to kick off the multi-agent pipeline and track execution.
              </p>
            </div>
          ) : (
            <div className="flow-root max-h-[500px] overflow-y-auto pr-1">
              <div className="my-2 ml-3">
                {traceItems.map((item) => renderTimelineItem(item))}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "artifacts" ? (
        <div className="space-y-4 pt-2">
          {artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/10">
              <FileText className="w-10 h-10 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="text-sm font-bold text-foreground">No Handoff Artifacts Yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-normal">
                Handoff artifacts will appear here as each agent finishes its workflow stage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {artifacts.map((artifact) => {
                const isExpanded = expandedItems[artifact.id] || false
                return (
                  <div key={artifact.id} className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                      <div>
                        <span className="text-xs text-muted-foreground font-mono block mb-0.5">{formatTime(artifact.created_at)}</span>
                        <span className="text-sm font-bold text-primary">{artifact.title}</span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono self-start sm:self-auto uppercase tracking-wider">
                        {artifact.artifact_type}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">{artifact.summary}</p>
                    {artifact.content_json && Object.keys(artifact.content_json).length > 0 && (
                      <div className="pt-1">
                        <button 
                          onClick={() => toggleExpand(artifact.id)}
                          className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? "Hide Payload" : "View Structured Payload"}
                        </button>
                        {isExpanded && (
                          <pre className="mt-2 p-3 text-xs bg-background border rounded-lg overflow-x-auto font-mono max-h-60 text-muted-foreground">
                            {JSON.stringify(artifact.content_json, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Console Log Raw Output Tab */
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-72 overflow-y-auto flex flex-col space-y-2 border border-gray-900">
          {rawTraces.length === 0 ? (
            <div className="text-gray-500 italic">No traces available yet...</div>
          ) : (
            rawTraces.map((trace, idx) => {
              let msg = trace.action
              if (trace.action === "start_source_analysis") msg = "Source Understander analyzing document coverage."
              else if (trace.action === "source_analysis_complete") msg = "Source analysis complete."
              else if (trace.action === "start_planning") msg = "Intake Planner creating benchmark plan."
              else if (trace.action === "plan_created") msg = "Benchmark plan created."
              else if (trace.action === "start_generation_standard") msg = `Benchmark Generator generating ${trace.details?.count || 0} samples.`
              else if (trace.action === "start_generation_repair") msg = `Benchmark Generator repairing ${trace.details?.count || 0} samples.`
              else if (trace.action === "generation_standard_complete") msg = `Generated ${trace.details?.generated_count || 0} samples across types.`
              else if (trace.action === "generation_repair_complete") msg = `Repaired ${trace.details?.generated_count || 0} samples.`
              else if (trace.action === "start_evaluation") msg = `Quality Evaluator evaluating sample.`
              else if (trace.action === "evaluation_complete") msg = `Evaluation complete. Decision: ${trace.details?.decision}.`
              else if (trace.action === "start_export") msg = "Exporter generating dataset_card.md and quality_report.md."
              else if (trace.action === "export_complete") msg = `Export package ready. Included ${trace.details?.file_count || 0} files.`

              return (
                <div
                  key={trace.id || idx}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-gray-800 py-1.5 sm:grid-cols-[5.5rem_13rem_minmax(0,1fr)] text-xs"
                >
                  <span className="text-gray-500">{formatTime(trace.created_at)}</span>
                  <span className="font-bold text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    {trace.agent_name || "System"}
                  </span>
                  <span className="col-start-2 whitespace-pre-wrap break-words text-green-400 sm:col-start-3">
                    {msg}
                  </span>
                </div>
              )
            })
          )}
          {status === "EXPORT_READY" && (
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-green-800/30 py-1.5 text-green-300 sm:grid-cols-[5.5rem_13rem_minmax(0,1fr)] text-xs">
              <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
              <span className="font-bold text-blue-400">[System]</span>
              <span className="col-start-2 whitespace-pre-wrap break-words sm:col-start-3">Workflow completed successfully. Export package is ready.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
