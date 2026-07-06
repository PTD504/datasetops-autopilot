import { TraceItem, ToolCallLog, WorkflowEvent } from "../../../../types";

export interface PreprocessingDoc {
  filename: string;
  charCount?: number;
  chunkCount?: number;
  latencyMs?: number;
  status: string;
}

export interface PreprocessingSummary {
  status: "idle" | "running" | "completed" | "failed";
  docs: PreprocessingDoc[];
  totalChunks: number;
  embeddingModel?: string;
  embeddingMode?: string;
  embeddingLatency?: number;
  chunkingLatency?: number;
  warnings: string[];
}

export function resolvePreprocessing(traces: TraceItem[], workflowStatus: string): PreprocessingSummary {
  const docs: PreprocessingDoc[] = [];
  let totalChunks = 0;
  let chunkingLatency = 0;
  let embeddingModel: string | undefined = undefined;
  let embeddingMode: string | undefined = undefined;
  let embeddingLatency: number | undefined = undefined;
  const warnings: string[] = [];

  // Parse tool calls for chunker
  const chunkerCalls = traces.filter(
    (t) => t.type === "tool_call" && (t.data as ToolCallLog).tool_name === "DocumentChunker.chunk"
  );

  chunkerCalls.forEach((t) => {
    const call = t.data as ToolCallLog;
    const input = call.input_summary || "";
    const output = call.output_summary || "";

    // Regex to extract info
    const filenameMatch = input.match(/Filename:\s*([^,]+)/i);
    const sizeMatch = input.match(/Content size:\s*(\d+)/i);
    const countMatch = output.match(/Generated\s*(\d+)/i);

    const filename = filenameMatch ? filenameMatch[1].trim() : "Unknown Document";
    const charCount = sizeMatch ? parseInt(sizeMatch[1]) : undefined;
    const chunkCount = countMatch ? parseInt(countMatch[1]) : undefined;

    docs.push({
      filename,
      charCount,
      chunkCount,
      latencyMs: call.latency_ms || undefined,
      status: call.status === "success" ? "Success" : "Failed",
    });

    if (chunkCount) {
      totalChunks += chunkCount;
    }
    if (call.latency_ms) {
      chunkingLatency += call.latency_ms;
    }
    if (call.status !== "success" && call.output_summary) {
      warnings.push(`Chunking failed for ${filename}: ${call.output_summary}`);
    }
  });

  // Parse embedding completed event
  const embeddingCompleted = traces.find(
    (t) => t.type === "workflow_event" && (t.data as WorkflowEvent).event_type === "embedding_completed"
  );

  if (embeddingCompleted) {
    const event = embeddingCompleted.data as WorkflowEvent;
    const meta = event.event_metadata;
    if (meta) {
      embeddingModel = meta.model as string || undefined;
      embeddingMode = meta.mode as string || undefined;
      embeddingLatency = meta.latency_ms as number || undefined;
    }
  }

  // Determine overall status
  let status: "idle" | "running" | "completed" | "failed" = "idle";
  if (workflowStatus === "FAILED") {
    status = "failed";
  } else if (embeddingCompleted) {
    status = "completed";
  } else if (
    traces.some(
      (t) =>
        t.type === "workflow_event" &&
        ((t.data as WorkflowEvent).event_type === "chunking_started" ||
          (t.data as WorkflowEvent).event_type === "embedding_started")
    )
  ) {
    status = "running";
  }

  return {
    status,
    docs,
    totalChunks,
    embeddingModel,
    embeddingMode,
    embeddingLatency,
    chunkingLatency: chunkingLatency || undefined,
    warnings,
  };
}
