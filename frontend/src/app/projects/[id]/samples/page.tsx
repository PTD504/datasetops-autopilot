"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface SampleData {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  expected_answer: string;
  status: string;
}

export default function SamplesReview() {
  const params = useParams()
  const id = params.id as string
  const [samples, setSamples] = useState<SampleData[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/samples`)
      .then(r => r.json())
      .then(setSamples)
      .catch(console.error)
  }, [id])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Samples Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Expected Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>{s.difficulty}</TableCell>
                  <TableCell className="max-w-xs truncate">{s.question}</TableCell>
                  <TableCell className="max-w-xs truncate">{s.expected_answer}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {samples.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No samples generated yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
