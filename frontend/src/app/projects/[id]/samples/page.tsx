"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PASS':
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">{status}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">{status}</Badge>;
      case 'NEEDS_REPAIR':
      case 'REPAIRING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">{status}</Badge>;
      case 'HUMAN_REVIEW':
      case 'PENDING':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/samples`)
      .then(r => r.json())
      .then(setSamples)
      .catch(console.error)
  }, [id])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <CardTitle className="text-2xl">Human-in-the-Loop Workbench</CardTitle>
          <CardDescription className="text-base mt-2">
            Review the generated evaluation samples. The autonomous agent has already applied self-reflection and repair loops where necessary.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px]">Difficulty</TableHead>
                  <TableHead className="min-w-[250px]">Question</TableHead>
                  <TableHead className="min-w-[250px]">Expected Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((s) => (
                  <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{getStatusBadge(s.status)}</TableCell>
                    <TableCell className="text-sm">{s.category}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="font-normal text-xs">{s.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate group-hover:whitespace-normal group-hover:break-words group-hover:bg-background/95 transition-all group-hover:absolute group-hover:z-10 group-hover:border group-hover:shadow-lg group-hover:p-4 group-hover:rounded-md" title={s.question}>{s.question}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate group-hover:whitespace-normal group-hover:break-words group-hover:bg-background/95 transition-all group-hover:absolute group-hover:z-10 group-hover:border group-hover:shadow-lg group-hover:p-4 group-hover:rounded-md group-hover:ml-[300px]" title={s.expected_answer}>{s.expected_answer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                         <Button size="sm" variant="outline" className="opacity-50" disabled title="Coming soon">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {samples.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p>No samples generated or processing yet. Check back soon.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
