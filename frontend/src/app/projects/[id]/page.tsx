"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function ProjectStatus() {
  const params = useParams()
  const id = params.id as string
  const [status, setStatus] = useState("LOADING")
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  const terminalStates = ["DONE", "FAILED", "CANCELLED", "EXPORT_READY"]
  const isFinished = terminalStates.includes(status)

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
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-semibold">Current State:</span>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
              {status}
            </span>
          </div>

          {lastError && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
              <div className="font-semibold mb-1">Workflow Error</div>
              <div>{lastError}</div>
            </div>
          )}

          {usage && (
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-base">Usage & Budget Guard</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${usage.budget_status === 'ok' ? 'bg-green-100 text-green-800' : usage.budget_status === 'exceeded' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {usage.budget_status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Mode:</span> {usage.llm_mode}</div>
                <div><span className="text-muted-foreground">Guardrails:</span> {usage.guardrails_enabled ? "Enabled" : "Disabled"}</div>
                <div><span className="text-muted-foreground">Calls:</span> {usage.calls_used} / {usage.max_calls}</div>
                <div><span className="text-muted-foreground">Attempts:</span> {usage.attempted_calls ?? usage.calls_used}</div>
                <div><span className="text-muted-foreground">Failed:</span> {usage.failed_calls ?? 0}</div>
                <div><span className="text-muted-foreground">Blocked:</span> {usage.blocked_calls ?? 0}</div>
                <div><span className="text-muted-foreground">Tokens:</span> {usage.total_tokens_used.toLocaleString()} / {usage.max_total_tokens.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Est. Cost:</span> ${usage.estimated_cost_used.toFixed(4)} / ${usage.max_estimated_cost.toFixed(2)}</div>
                {usage.cancel_requested && <div><span className="text-red-500 font-semibold">Cancel Requested</span></div>}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleStop}
              disabled={isFinished || usage?.cancel_requested}
            >
              Stop Workflow
            </Button>
            <Link href={`/projects/${id}/plan`}>
              <Button className="w-full" variant="outline">Review Benchmark Plan</Button>
            </Link>
            <Link href={`/projects/${id}/samples`}>
              <Button className="w-full" variant="outline">Review Generated Samples</Button>
            </Link>
            <Link href={`/projects/${id}/export`}>
              <Button className="w-full" variant="default">Download Export Package</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
