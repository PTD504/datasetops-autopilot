import React, { useMemo } from "react";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import Section from "../../../components/Section";
import Badge from "../../../components/Badge";
import { PreprocessingDoc } from "../utils/preprocessingResolver";

interface DocumentsSectionProps {
  documents?: PreprocessingDoc[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function DocumentsSection({ 
  documents,
  collapsible = false,
  defaultExpanded = true,
}: DocumentsSectionProps) {
  const hasDocs = documents && documents.length > 0;

  // Memoize documents list elements rendering
  const documentList = useMemo(() => {
    if (!documents || documents.length === 0) return null;
    return documents.map((doc, idx) => (
      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-white/[0.02] last:border-0">
        <div className="flex items-center gap-2 truncate pr-3">
          <FileText size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-200 truncate font-sans" title={doc.filename}>{doc.filename}</span>
          {doc.charCount !== undefined && (
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              ({doc.charCount.toLocaleString()} chars)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {doc.chunkCount !== undefined && (
            <span className="text-[10px] font-mono text-slate-400">
              {doc.chunkCount} Chunks
            </span>
          )}
          {doc.status === "Success" ? (
            <Badge label="Success" variant="success" />
          ) : (
            <Badge label="Failed" variant="error" />
          )}
        </div>
      </div>
    ));
  }, [documents]);

  return (
    <Section 
      title="Uploaded Source Documents" 
      icon={<FileText size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Processed Files</span>
        
        {hasDocs ? (
          <div className="space-y-2 border border-white/[0.04] bg-white/[0.005] p-3 rounded-xl max-h-52 overflow-y-auto pr-1">
            {documentList}
          </div>
        ) : (
          <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-4 rounded-xl text-center">
            No source documents uploaded or processed.
          </div>
        )}
      </div>
    </Section>
  );
}

// React.memo with custom comparison to avoid unnecessary renders
export default React.memo(DocumentsSection, (prev, next) => {
  return (
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded &&
    JSON.stringify(prev.documents) === JSON.stringify(next.documents)
  );
});

