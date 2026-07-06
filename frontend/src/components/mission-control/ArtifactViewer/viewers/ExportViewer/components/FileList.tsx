import React from "react";
import { FileJson, FileText, FileArchive, Download, ChevronRight } from "lucide-react";
import Section from "../../../components/Section";

interface FileListProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
  onDownloadAll: () => void;
  generatedAt?: string;
  approvedCount?: number;
}

export default function FileList({
  files,
  selectedFile,
  onSelectFile,
  onDownloadAll,
  generatedAt,
  approvedCount,
}: FileListProps) {
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "jsonl":
      case "json":
        return <FileJson size={16} className="text-cyan-400" />;
      case "md":
        return <FileText size={16} className="text-indigo-400" />;
      case "zip":
        return <FileArchive size={16} className="text-amber-500" />;
      default:
        return <FileText size={16} className="text-slate-400" />;
    }
  };

  const getFileLabel = (filename: string) => {
    switch (filename) {
      case "rag_eval.jsonl":
        return "RAG Questions Dataset";
      case "answer_key.jsonl":
        return "Expected Answers Key";
      case "dataset_card.md":
        return "Dataset Specifications Card";
      case "quality_report.md":
        return "Quality Rubric Report";
      case "export.zip":
        return "Complete Deliverable Archive";
      default:
        return "Deliverable Artifact";
    }
  };

  const formattedDate = generatedAt 
    ? new Date(generatedAt).toLocaleString() 
    : "Recently Generated";

  return (
    <Section title="Deliverable Package Explorer" icon={<FileArchive size={12} className="text-cyan-400" />}>
      <div className="space-y-4">
        {/* Package Metadata Info */}
        <div className="space-y-1 bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl text-[11px] font-mono text-slate-500">
          <div className="flex justify-between">
            <span>Export Version:</span>
            <span className="text-slate-300">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Approved Samples:</span>
            <span className="text-slate-300">{approvedCount !== undefined ? approvedCount : "N/A"} QA Pairs</span>
          </div>
          <div className="flex justify-between">
            <span>Generated At:</span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* Directory/File Tree List */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-2 select-none">
            Artifacts Included
          </span>
          {files.map((file) => {
            const isSelected = selectedFile === file;
            return (
              <button
                key={file}
                onClick={() => onSelectFile(file)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-white/[0.01] text-slate-300 border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="shrink-0">{getFileIcon(file)}</div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold font-mono truncate">{file}</span>
                    <span className={`text-[10px] font-sans truncate ${isSelected ? "text-cyan-500/80" : "text-slate-500"}`}>
                      {getFileLabel(file)}
                    </span>
                  </div>
                </div>
                
                <ChevronRight 
                  size={12} 
                  className={`shrink-0 transition-transform ${isSelected ? "text-cyan-400 translate-x-0.5" : "text-slate-650"}`} 
                />
              </button>
            );
          })}
        </div>

        {/* Download all package button */}
        <button
          onClick={onDownloadAll}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-450 text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] select-none"
        >
          <Download size={14} />
          <span>Download Package ZIP</span>
        </button>
      </div>
    </Section>
  );
}
