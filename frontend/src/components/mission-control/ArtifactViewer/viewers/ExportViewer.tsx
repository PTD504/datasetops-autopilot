import React, { useState } from "react";
import { TraceItem, AgentArtifact, WorkflowEvent } from "../../types";
import { useMissionControlStore } from "../../store/useMissionControlStore";
import { useGeneratorSamples } from "./GeneratorViewer/useGeneratorSamples";
import { 
  resolveExportSummaryArtifact, 
  reconstructRagEval, 
  reconstructAnswerKey, 
  reconstructDatasetCard, 
  reconstructQualityReport 
} from "./ExportViewer/utils/exportResolver";
import FileList from "./ExportViewer/components/FileList";
import PreviewPanel from "./ExportViewer/components/PreviewPanel";
import { PlanData } from "../../plan-review/BenchmarkPlanForm";
import { EvaluatorSample } from "./EvaluatorViewer/useEvaluatorSamples";

interface ExportViewerProps {
  projectId: string;
  workflowStatus: string;
  traces: TraceItem[];
}

export default function ExportViewer({
  projectId,
  workflowStatus,
  traces,
}: ExportViewerProps) {
  const { setIsDownloaded, setShowCompletionOverlay, setSelectedNodeId } = useMissionControlStore();
  const { samples, loading: samplesLoading } = useGeneratorSamples(projectId);
  const [selectedFile, setSelectedFile] = useState<string | null>("dataset_card.md");

  // 1. Resolve Export Summary
  const exportSummary = resolveExportSummaryArtifact(traces);

  // 2. Resolve Plan details for Spec Card reconstruction
  const planArtifact = traces.find(
    (t) =>
      t.type === "artifact" &&
      ((t.data as AgentArtifact).artifact_type === "approved_benchmark_plan" ||
        (t.data as AgentArtifact).artifact_type === "benchmark_plan_draft")
  );
  const planData = planArtifact ? ((planArtifact.data as AgentArtifact).content_json as unknown as PlanData) : null;

  // 3. Extract project name from the start trace if available
  const startEvent = traces.find(
    (t) => t.type === "workflow_event" && (t.data as WorkflowEvent).event_type === "workflow_started"
  );
  let projectName = "Acme Docs Evaluation";
  if (startEvent) {
    const eventData = startEvent.data as WorkflowEvent;
    if (eventData.message) {
      const match = eventData.message.match(/project:\s*(.+)$/i);
      if (match) {
        projectName = match[1].trim();
      }
    }
  }

  // Check exporting progress status
  const isExporting = workflowStatus === "EXPORTING";

  // Renders empty/loading state if summary is not yet resolved
  if (!exportSummary) {
    if (isExporting) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
            Compiling Export Deliverables...
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
        <p className="text-xs text-slate-500 italic">
          Deliverable package has not been exported yet. Please complete Human Review and finalize.
        </p>
      </div>
    );
  }

  // Handle entire package zip download redirection
  const handleDownloadAll = () => {
    const apiUrl = "";
    const downloadUrl = `${apiUrl}/api/projects/${projectId}/export/download`;
    
    // Download using a hidden anchor tag to prevent browser tab flashing/stuttering
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `datasetops-export-${projectId}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark as downloaded to animate progress bar to 100%
    setIsDownloaded(true);

    // Quicker, smoother delay (600ms) to sync with progress bar transition (500ms)
    setTimeout(() => {
      setSelectedNodeId(null); // Close the viewer slide-out
      setShowCompletionOverlay(true); // Open the overlay
    }, 600);
  };

  // Reconstruct preview content depending on the selected file
  const getPreviewContent = () => {
    if (samplesLoading) return "Loading preview dataset...";
    
    switch (selectedFile) {
      case "rag_eval.jsonl":
        return reconstructRagEval(samples as unknown as EvaluatorSample[]);
      case "answer_key.jsonl":
        return reconstructAnswerKey(samples as unknown as EvaluatorSample[]);
      case "dataset_card.md":
        return reconstructDatasetCard(
          projectName,
          planData?.goal || "",
          planData?.language || "",
          planData?.categories || [],
          samples as unknown as EvaluatorSample[]
        );
      case "quality_report.md":
        return reconstructQualityReport(samples as unknown as EvaluatorSample[]);
      default:
        return "";
    }
  };

  // Filter out export.zip from the sidebar list (only show previewable files)
  const explorerFiles = exportSummary.exported_files.filter((f) => f !== "export.zip");

  // Extract filenames index tree inside zip
  const filesInZip = exportSummary.exported_files.filter((f) => f !== "export.zip");

  return (
    <div className="flex flex-col gap-5 select-none text-left">
      {/* Subtitle description */}
      <div className="border-b border-white/[0.04] pb-4">
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This workspace acts as the Package Explorer for deliverable evaluation datasets, specifications specs cards, and quality reports generated upon approval.
        </p>
      </div>

      {/* Split Explorer layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
        {/* Left Explorer Sidebar (Columns: 2/5) */}
        <div className="md:col-span-2">
          <FileList
            files={explorerFiles}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onDownloadAll={handleDownloadAll}
            generatedAt={exportSummary.generated_at}
            approvedCount={exportSummary.approved_sample_count}
          />
        </div>

        {/* Right Preview Panel (Columns: 3/5) */}
        <div className="md:col-span-3">
          <PreviewPanel
            filename={selectedFile}
            content={getPreviewContent()}
            filesInZip={filesInZip}
          />
        </div>
      </div>
    </div>
  );
}
