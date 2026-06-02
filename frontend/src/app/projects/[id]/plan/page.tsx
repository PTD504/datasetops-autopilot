"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  if (!plan) return <div className="p-8 text-center">Loading plan...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Plan Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Goal</h3>
            <p className="text-muted-foreground">{plan.goal || "Evaluate RAG System"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Language</h3>
              <p className="text-muted-foreground">{plan.language || "English"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Total Samples</h3>
              <p className="text-muted-foreground">{plan.sample_count?.total || 10}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="flex gap-2">
              {(plan.categories || ["General"]).map((c: string) => (
                <span key={c} className="px-2 py-1 bg-secondary rounded-md text-sm">{c}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={handleApprove} className="w-full">Approve Plan</Button>
            <Button variant="outline" className="w-full">Reject / Edit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
