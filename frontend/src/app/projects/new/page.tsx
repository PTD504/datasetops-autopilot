"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NewProject() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [request, setRequest] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
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

      if (files.length === 0) {
        throw new Error("Upload at least one source document before starting.")
      }

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        const uploadRes = await fetch(`${apiUrl}/api/projects/${data.id}/documents`, {
          method: "POST",
          body: formData,
        })
        if (!uploadRes.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      const startRes = await fetch(`${apiUrl}/api/projects/${data.id}/start`, {
        method: "POST"
      })
      if (!startRes.ok) {
        const error = await startRes.json().catch(() => null)
        throw new Error(error?.detail || "Failed to start workflow")
      }

      router.push(`/projects/${data.id}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error creating project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <CardTitle className="text-2xl">Create New Benchmark</CardTitle>
          <CardDescription className="text-base">
            Upload your source documents and describe the type of benchmark dataset you want to build. Autopilot will handle the rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg font-semibold">Project Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp Technical Docs Benchmark" className="text-base py-6" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="files" className="text-lg font-semibold">Source Documents</Label>
              <Input
                id="files"
                type="file"
                multiple
                required
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={e => setFiles(Array.from(e.target.files || []))}
                className="py-3 px-4 border-2 border-dashed h-20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">Upload the text or markdown files representing your knowledge base (max 10MB total recommended for demo).</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="request" className="text-lg font-semibold">Benchmark Request</Label>
              <Textarea
                id="request"
                required
                className="h-40 text-base"
                value={request}
                onChange={e => setRequest(e.target.value)}
                placeholder="e.g. Generate 20 technical questions focusing on troubleshooting procedures and API usage. Include a mix of factual and reasoning questions. Target an intermediate developer audience."
              />
              <p className="text-sm text-muted-foreground">Describe the goals, topics, difficulty, and format of the benchmark you need.</p>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl" disabled={loading}>
                {loading ? "Starting Autopilot Workflow..." : "Start Autopilot Workflow"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
