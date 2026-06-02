import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          DatasetOps Autopilot
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          RAG Benchmark Builder — Track 4: Autopilot Agent
        </p>
        <Link href="/projects/new">
          <Button size="lg" className="px-8">
            Start New Benchmark Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-12">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload</CardTitle>
            <CardDescription>Provide raw source documents and a benchmark request.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Plan</CardTitle>
            <CardDescription>Autopilot analyzes sources and proposes a detailed evaluation plan.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Export</CardTitle>
            <CardDescription>Generates samples, evaluates quality, and exports a clean dataset.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
