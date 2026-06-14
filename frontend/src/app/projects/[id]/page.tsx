"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { WorkflowTracePanel, TraceItem } from "@/components/WorkflowTracePanel"

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
  const [combinedTrace, setCombinedTrace] = useState<TraceItem[]>([])
  const [traceLoading, setTraceLoading] = useState(true)
  const [traceError, setTraceError] = useState(false)

  const fetchTrace = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setTraceLoading(true)
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/projects/${id}/trace`)
      if (res.ok) {
        const data = await res.json()
        setCombinedTrace(data)
        setTraceError(false)
      } else {
        setTraceError(true)
      }
    } catch (e) {
      console.error("Failed to fetch combined trace", e)
      setTraceError(true)
    } finally {
      setTraceLoading(false)
    }
  }, [id])

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

      await fetchTrace(false)
    } catch (e) {
      console.error(e)
    }
  }, [id, fetchTrace])

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
          <WorkflowTracePanel
            traceItems={combinedTrace}
            loading={traceLoading}
            error={traceError}
            onRefresh={() => fetchTrace(true)}
            rawTraces={traces}
            status={status}
          />
        </CardContent>
      </Card>
    </div>
  )
}
