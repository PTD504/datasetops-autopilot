"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectStatus() {
  const params = useParams()
  const id = params.id as string
  const [status, setStatus] = useState("LOADING")

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/api/projects/${id}/status`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.workflow_state)
        }
      } catch (e) {
        console.error(e)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [id])

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

          <div className="flex flex-col gap-4">
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
