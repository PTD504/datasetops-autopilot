"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewProject() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [request, setRequest] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          benchmark_request: request
        }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const data = await res.json()

      // We are skipping the real file upload for MVP/hackathon UI speed,
      // but the backend supports it. For now, we auto-start workflow.
      await fetch(`${apiUrl}/api/projects/${data.id}/start`, {
        method: "POST"
      })

      router.push(`/projects/${data.id}`)
    } catch (err) {
      console.error(err)
      alert("Error creating project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vietnamese Ecommerce Bot" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request">Benchmark Request</Label>
              <Textarea
                id="request"
                required
                className="h-32"
                value={request}
                onChange={e => setRequest(e.target.value)}
                placeholder="Describe what kind of questions you want generated, target difficulty, and topics..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Source Documents (TXT, MD)</Label>
              <Input id="files" type="file" multiple />
              <p className="text-sm text-muted-foreground">Upload the knowledge base the RAG system will use.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Starting..." : "Start Autopilot Workflow"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
