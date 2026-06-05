"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlanData {
  goal?: string;
  language?: string;
  sample_count?: { total: number };
  categories?: string[];
}

export default function PlanApproval() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [plan, setPlan] = useState<PlanData | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/plan`)
      .then(r => r.json())
      .then(setPlan)
      .catch(console.error)
  }, [id])

  const handleApprove = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/plan/approve`, { method: "POST" })
    router.push(`/projects/${id}`)
  }

  if (!plan) return <div className="p-8 flex justify-center mt-12"><div className="animate-pulse flex items-center space-x-4"><div className="rounded-full bg-primary/20 h-10 w-10"></div><div className="space-y-2"><div className="h-4 bg-primary/20 rounded w-[200px]"></div><div className="h-4 bg-primary/20 rounded w-[150px]"></div></div></div></div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Benchmark Plan Approval</CardTitle>
              <CardDescription className="text-base mt-2">
                Human-in-the-loop checkpoint: Review the autonomous agent&apos;s proposed evaluation plan before sample generation begins.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 uppercase tracking-wider hidden sm:block">Human Review Required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-secondary/30 shadow-none">
              <CardHeader className="pb-3">
                 <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Benchmark Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium">{plan.goal || "Evaluate RAG System Accuracy and Reasoning"}</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/30 shadow-none">
              <CardHeader className="pb-3">
                 <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Target Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Language</div>
                    <div className="font-semibold text-lg">{plan.language || "English"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Samples</div>
                    <div className="font-semibold text-lg">{plan.sample_count?.total || 10}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-secondary/30 shadow-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Proposed Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(plan.categories || ["Factual Retrieval", "Reasoning", "Summarization"]).map((c: string) => (
                  <Badge key={c} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{c}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
            <Button size="lg" onClick={handleApprove} className="w-full sm:flex-1 text-lg h-14 rounded-xl shadow-md hover:shadow-lg transition-all">
              Approve & Generate Samples
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:flex-1 text-lg h-14 rounded-xl opacity-60" disabled title="Coming soon">
              Reject / Edit Plan (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
