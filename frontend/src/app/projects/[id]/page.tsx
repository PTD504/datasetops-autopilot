"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type UsageSummary = {
  llm_mode: string
  guardrails_enabled: boolean
  budget_status: string
  calls_used: number
  attempted_calls?: number
  failed_calls?: number
  blocked_calls?: number
  max_calls: number
  total_tokens_used: number
  max_total_tokens: number
  estimated_cost_used: number
  max_estimated_cost: number
  cancel_requested?: boolean
  last_error?: string | null
}

interface TraceData {
  id: string
  agent_name?: string
  action: string
  details?: Record<string, unknown>
  created_at: string
}

export default function ProjectStatus() {
  const params = useParams()
  const id = params.id as string
  const [status, setStatus] = useState("LOADING")
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [traces, setTraces] = useState<TraceData[]>([])

  const terminalStates = ["DONE", "FAILED", "CANCELLED", "EXPORT_READY"]
  const isFinished = terminalStates.includes(status)

  const allStates = [
    "FILES_UPLOADED", "CHUNKING", "CHUNKED", "SOURCE_ANALYZING", "SOURCE_ANALYZED",
    "PLANNING", "WAITING_FOR_PLAN_APPROVAL", "PLAN_APPROVED", "GENERATING", "EVALUATING",
    "WAITING_FOR_SAMPLE_REVIEW", "EXPORT_READY"
  ]

  const currentStateIndex = allStates.indexOf(status)
  const progressValue = currentStateIndex >= 0 ? Math.max(5, ((currentStateIndex + 1) / allStates.length) * 100) : 100

  const fetchStatus = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/projects/${id}/status`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data.workflow_state)
        setLastError(data.last_error || null)
      }

      const usageRes = await fetch(`${apiUrl}/api/projects/${id}/usage`)
      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsage(usageData)
        setLastError(usageData.last_error || null)
      }

      const tracesRes = await fetch(`${apiUrl}/api/projects/${id}/traces`)
      if (tracesRes.ok) {
        const tracesData = await tracesRes.json()
        setTraces(tracesData)
      }
    } catch (e) {
      console.error(e)
    }
  }, [id])

  useEffect(() => {
    let stopped = false
    const poll = async () => {
      if (!stopped) {
        await fetchStatus()
      }
    }

    poll()
    if (isFinished || usage?.cancel_requested) {
      return () => {
        stopped = true
      }
    }

    const interval = setInterval(poll, 3000)
    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [fetchStatus, isFinished, usage?.cancel_requested])

  const handleStop = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      await fetch(`${apiUrl}/api/projects/${id}/stop`, { method: "POST" })
      fetchStatus()
    } catch (e) {
      console.error("Failed to stop workflow", e)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4 bg-muted/40 p-6 rounded-xl border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Workflow State</span>
              <span className={`px-4 py-1.5 font-mono text-sm rounded-full ${status === 'FAILED' ? 'bg-destructive text-destructive-foreground' : status === 'CANCELLED' ? 'bg-muted-foreground text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
                {status}
              </span>
            </div>

            {status !== 'FAILED' && status !== 'CANCELLED' && status !== 'LOADING' && (
              <div className="space-y-2 pt-2">
                 <div className="flex justify-between text-xs text-muted-foreground mb-1">
                   <span>Start</span>
                   <span>Export</span>
                 </div>
                 <Progress value={progressValue} className="h-2" />
              </div>
            )}
          </div>

          {lastError && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
              <div className="font-semibold mb-1">Workflow Error</div>
              <div>{lastError}</div>
            </div>
          )}

          {usage && (
            <div className="p-6 bg-secondary/30 border border-secondary rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Agent Telemetry & Usage Guard
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${usage.budget_status === 'ok' ? 'bg-green-100 text-green-800' : usage.budget_status === 'exceeded' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {usage.budget_status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">LLM Mode</div><div className="font-medium">{usage.llm_mode}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Guardrails</div><div className="font-medium">{usage.guardrails_enabled ? "Active" : "Disabled"}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">API Calls</div><div className="font-medium">{usage.calls_used} / {usage.max_calls}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Attempts</div><div className="font-medium">{usage.attempted_calls ?? usage.calls_used}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Failed Calls</div><div className="font-medium text-red-500">{usage.failed_calls ?? 0}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Blocked Calls</div><div className="font-medium text-orange-500">{usage.blocked_calls ?? 0}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Tokens Used</div><div className="font-medium">{usage.total_tokens_used.toLocaleString()} / {usage.max_total_tokens.toLocaleString()}</div></div>
                <div className="space-y-1"><div className="text-muted-foreground text-xs uppercase">Est. Cost</div><div className="font-medium">${usage.estimated_cost_used.toFixed(4)} / ${usage.max_estimated_cost.toFixed(2)}</div></div>
              </div>
              {usage.cancel_requested && (
                <div className="mt-4 pt-3 border-t border-border/50 text-destructive font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                  Cancellation processing...
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/projects/${id}/plan`} className="w-full">
              <Button className="w-full h-12" variant="outline">Review Benchmark Plan</Button>
            </Link>
            <Link href={`/projects/${id}/samples`} className="w-full">
              <Button className="w-full h-12" variant="outline">Review Samples (HITL)</Button>
            </Link>
            <Link href={`/projects/${id}/export`} className="w-full md:col-span-2">
              <Button className="w-full h-14 text-lg bg-primary hover:bg-primary/90" variant="default">Download Export Package</Button>
            </Link>
          </div>

          <div className="pt-4 border-t flex justify-end">
             <Button
              variant="destructive"
              onClick={handleStop}
              disabled={isFinished || usage?.cancel_requested || status === "LOADING"}
              className="w-full md:w-auto px-8"
            >
              {usage?.cancel_requested ? "Stopping..." : "Stop Workflow (Emergency)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Autopilot Execution Trace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto flex flex-col space-y-2">
            {traces.length === 0 ? (
              <div className="text-gray-500 italic">No traces available yet...</div>
            ) : (
              traces.map((trace, idx) => {
                let prefix = "[System]"
                if (trace.agent_name && trace.agent_name !== "System") {
                  prefix = `[Agent:${trace.agent_name}]`
                } else if (trace.action && trace.action.includes("tool") || trace.action.includes("chunk") || trace.action.includes("parse")) {
                  prefix = "[Tool]"
                }

                // Make the message human-readable
                let msg = trace.action
                if (trace.action === "start_source_analysis") msg = "SourceUnderstandingAgent analyzing document coverage."
                else if (trace.action === "source_analysis_complete") msg = "Source analysis complete."
                else if (trace.action === "start_planning") msg = "IntakePlannerAgent creating benchmark plan."
                else if (trace.action === "plan_created") msg = "Benchmark plan created."
                else if (trace.action === "start_generation_standard") msg = `BenchmarkGeneratorAgent generating ${trace.details?.count || 0} samples.`
                else if (trace.action === "start_generation_repair") msg = `BenchmarkGeneratorAgent repairing ${trace.details?.count || 0} samples.`
                else if (trace.action === "generation_standard_complete") msg = `Generated ${trace.details?.generated_count || 0} samples across types.`
                else if (trace.action === "generation_repair_complete") msg = `Repaired ${trace.details?.generated_count || 0} samples.`
                else if (trace.action === "start_evaluation") msg = `QualityEvaluatorAgent evaluating sample.`
                else if (trace.action === "evaluation_complete") msg = `Evaluation complete. Decision: ${trace.details?.decision}.`
                else if (trace.action === "start_export") msg = "ExportReportAgent generating dataset_card.md and quality_report.md."
                else if (trace.action === "export_complete") msg = `Export package ready. Included ${trace.details?.file_count || 0} files.`

                return (
                  <div key={idx} className="flex space-x-2 border-b border-gray-800 pb-1">
                    <span className="text-gray-500 w-24 flex-shrink-0">
                      {new Date(trace.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-blue-400 w-32 flex-shrink-0 font-bold">
                      {prefix}
                    </span>
                    <span>{msg}</span>
                  </div>
                )
              })
            )}
            {/* Add computed final states if export is ready */}
            {status === "EXPORT_READY" && (
                <div className="flex space-x-2 pt-2 border-t border-green-800/50 text-green-300">
                    <span className="w-24 flex-shrink-0 text-gray-500">{new Date().toLocaleTimeString()}</span>
                    <span className="w-32 flex-shrink-0 font-bold text-blue-400">[System]</span>
                    <span>Workflow completed successfully. Export package is ready.</span>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
