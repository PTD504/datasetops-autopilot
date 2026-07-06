import React, { useState } from "react";
import { Eye, Copy, Check, FileJson, FileText, Folder, FileArchive } from "lucide-react";
import Section from "../../../components/Section";

interface PreviewPanelProps {
  filename: string | null;
  content: string;
  filesInZip?: string[];
}

export default function PreviewPanel({
  filename,
  content,
  filesInZip = [],
}: PreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!filename) {
    return (
      <Section title="Artifact Preview Panel" icon={<Eye size={12} className="text-cyan-400" />}>
        <div className="flex flex-col items-center justify-center py-20 text-center select-none">
          <Eye size={36} className="text-slate-600 animate-pulse mb-3" />
          <p className="text-xs text-slate-500 font-sans">
            Select an artifact from the Package Explorer to preview its contents.
          </p>
        </div>
      </Section>
    );
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  // Helper to parse simple markdown strings into React nodes
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // H1 Header
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-sm font-bold text-white border-b border-white/[0.06] pb-2 mt-4 mb-2 first:mt-0 font-sans">
            {trimmed.slice(2)}
          </h1>
        );
      }
      
      // H2 Header
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xs font-bold text-cyan-400 mt-4 mb-1.5 font-sans">
            {trimmed.slice(3)}
          </h2>
        );
      }
      
      // Bullet list items
      if (trimmed.startsWith("- ")) {
        const contentStr = trimmed.slice(2);
        // Look for bold text within bullets: **text:** or **text**
        const parts = contentStr.split("**");
        return (
          <li key={idx} className="text-[11px] text-slate-300 ml-4 list-disc leading-normal font-sans py-0.5">
            {parts.map((part, pIdx) => {
              if (pIdx % 2 === 1) {
                return <strong key={pIdx} className="text-white font-semibold">{part}</strong>;
              }
              return part;
            })}
          </li>
        );
      }

      // Strong text lines
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <p key={idx} className="text-[11px] text-white font-semibold py-1 font-sans">
            {trimmed.slice(2, -2)}
          </p>
        );
      }

      // Empty line
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }

      // Default paragraph
      const parts = trimmed.split("**");
      return (
        <p key={idx} className="text-[11px] text-slate-350 leading-relaxed font-sans py-0.5">
          {parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return <strong key={pIdx} className="text-white font-semibold">{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Render the index contents of the zip file
  const renderZipIndex = () => {
    return (
      <div className="space-y-3 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
          <Folder size={14} className="text-cyan-400 shrink-0" />
          <span className="text-white font-semibold">export.zip</span>
          <span className="text-[10px] text-slate-550">({filesInZip.length} files compressed)</span>
        </div>
        
        <div className="space-y-2 pl-3 border-l border-white/5">
          {filesInZip.map((file) => {
            const isJson = file.endsWith(".jsonl");
            return (
              <div key={file} className="flex items-center gap-2.5 py-0.5 select-none">
                {isJson ? (
                  <FileJson size={12} className="text-cyan-400/80 shrink-0" />
                ) : (
                  <FileText size={12} className="text-indigo-400/80 shrink-0" />
                )}
                <span>{file}</span>
              </div>
            );
          })}
        </div>
        
        <p className="text-[10px] text-slate-500 italic pt-2 leading-normal font-sans">
          This zip archive contains all compiled RAG evaluation jsonl datasets and specifications markdown files. Click the download button on the left to extract.
        </p>
      </div>
    );
  };

  // Check if Copy Button should render (not useful for Zip files)
  const showCopyBtn = ext !== "zip";

  return (
    <Section
      title={`Preview: ${filename}`}
      icon={
        ext === "zip" ? (
          <FileArchive size={12} className="text-cyan-400" />
        ) : ext === "jsonl" ? (
          <FileJson size={12} className="text-cyan-400" />
        ) : (
          <FileText size={12} className="text-cyan-400" />
        )
      }
    >
      <div className="flex flex-col gap-3">
        {showCopyBtn && (
          <div className="flex justify-end select-none">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-mono"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy Content"}</span>
            </button>
          </div>
        )}
        <div className="custom-preview-scroll custom-workspace-scroll max-h-[380px] overflow-y-auto pr-1 select-text">
          {ext === "zip" ? (
            renderZipIndex()
          ) : ext === "jsonl" ? (
            <pre className="font-mono text-[10px] text-slate-300 leading-normal bg-white/[0.005] border border-white/[0.03] p-3 rounded-xl whitespace-pre-wrap word-break">
              {content || "{}"}
            </pre>
          ) : (
            <div className="space-y-1 pl-1 bg-white/[0.005] border border-white/[0.03] p-4 rounded-xl">
              {renderMarkdown(content)}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
