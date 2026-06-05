import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-2">
          DatasetOps Autopilot
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
          An autonomous workflow agent that converts raw source documents and an ambiguous benchmark request into a validated RAG evaluation benchmark package.
        </p>
        <p className="text-md text-muted-foreground mb-10 font-medium">
          Qwen Cloud Global Hackathon — Track 4: Autopilot Agent
        </p>
        <Link href="/projects/new">
          <Button size="lg" className="px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
            Create Benchmark Project
          </Button>
        </Link>
      </div>

      <div className="space-y-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Autonomous Workflow</h2>
          <div className="grid gap-6 md:grid-cols-5">
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">1. Upload Docs</CardTitle>
                <CardDescription>Provide raw sources</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">2. Plan</CardTitle>
                <CardDescription>Autopilot analysis</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">3. Generate</CardTitle>
                <CardDescription>Agent creation</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">4. Evaluate</CardTitle>
                <CardDescription>Quality repair loop</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-primary text-primary-foreground shadow-md">
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-primary-foreground">5. Export</CardTitle>
                <CardDescription className="text-primary-foreground/80">Production artifacts</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center bg-muted/30 p-8 rounded-3xl border">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Production-Ready Outputs</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              The agent produces a complete, standardized benchmark dataset ready for integration into your evaluation pipelines.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">rag_eval.jsonl</span>
                <span className="text-muted-foreground text-sm">- The generated questions and source contexts</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">answer_key.jsonl</span>
                <span className="text-muted-foreground text-sm">- Expected answers for evaluation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">dataset_card.md</span>
                <span className="text-muted-foreground text-sm">- Documentation and methodology</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">quality_report.md</span>
                <span className="text-muted-foreground text-sm">- Evaluation metrics and repair stats</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-sm border-2 border-primary/20 shadow-xl">
               <CardHeader className="text-center pb-2">
                 <CardTitle className="text-2xl font-mono text-primary">export.zip</CardTitle>
               </CardHeader>
               <CardContent className="text-center text-muted-foreground text-sm">
                 All artifacts bundled into a single distributable package.
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
