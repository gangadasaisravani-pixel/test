import React, { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  ListOrdered,
  FileBadge,
  Send,
} from "lucide-react";
import { api } from "../../lib/api";

interface ComplaintDossierPreviewProps {
  caseId: string;
  complaintPackage: any;
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
}

export const ComplaintDossierPreview: React.FC<ComplaintDossierPreviewProps> = ({
  caseId,
  complaintPackage,
  onRegenerate,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<"NOTICE" | "NCH" | "ANNEXURES">("NOTICE");
  const [noticeMarkdown, setNoticeMarkdown] = useState<string>(
    complaintPackage?.formal_notice_markdown || ""
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (complaintPackage?.formal_notice_markdown) {
      setNoticeMarkdown(complaintPackage.formal_notice_markdown);
    }
  }, [complaintPackage]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([noticeMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Formal_Legal_Notice_${caseId.slice(0, 8)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openPrintableView = () => {
    window.open(`/api/cases/${caseId}/export/pdf`, "_blank");
  };

  let annexures: any[] = [];
  try {
    if (complaintPackage?.evidence_checklist) {
      annexures = typeof complaintPackage.evidence_checklist === "string"
        ? JSON.parse(complaintPackage.evidence_checklist)
        : complaintPackage.evidence_checklist;
    }
  } catch (err) {
    annexures = [];
  }

  if (!complaintPackage) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Audit-Ready Complaint Package Not Yet Generated</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Synthesize all extracted facts, chronological timeline events, and statutory CPA 2019 claims into a formal merchant dispute notice.
        </p>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Compiling Dossier with Gemini..." : "Generate CPA 2019 Legal Dossier"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Dossier Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("NOTICE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "NOTICE"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formal Legal Notice (Markdown)</span>
          </button>

          <button
            onClick={() => setActiveTab("NCH")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "NCH"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>NCH 1915 Portal Payload</span>
          </button>

          <button
            onClick={() => setActiveTab("ANNEXURES")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "ANNEXURES"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Evidence Annexure Index ({annexures.length})</span>
          </button>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={openPrintableView}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            title="Open printable A4 view"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            title="Download notice as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Synthesizing..." : "Regenerate Dossier"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Formal Legal Notice (Markdown Live Editor) */}
      {activeTab === "NOTICE" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>
              CPA 2019 Formal Notice Draft • Mandatory 15-day rectification window before DCDRC escalation
            </span>
            <button
              onClick={() => handleCopy(noticeMarkdown, "notice")}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              {copiedKey === "notice" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Notice</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Live Markdown Editor */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Editable Notice Buffer
              </span>
              <textarea
                value={noticeMarkdown}
                onChange={(e) => setNoticeMarkdown(e.target.value)}
                rows={22}
                className="w-full bg-transparent text-slate-200 text-xs font-mono leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Formatted Preview */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 max-h-[600px] overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-800 pb-2">
                Live Document Render
              </span>
              <div className="whitespace-pre-wrap font-sans text-xs text-slate-300">
                {noticeMarkdown}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NCH Grievance Portal Payload */}
      {activeTab === "NCH" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100">National Consumer Helpline (1915) Payload</h4>
              <p className="text-xs text-slate-400">
                Pre-formatted for direct pasting into the INGRAM web portal form (Max 1,500 characters).
              </p>
            </div>

            <button
              onClick={() => handleCopy(complaintPackage.nch_grievance_text, "nch")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              {copiedKey === "nch" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy NCH Text</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {complaintPackage.nch_grievance_text}
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Character count: {complaintPackage.nch_grievance_text?.length || 0} / 1500 limit</span>
            <a
              href="https://consumerhelpline.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline"
            >
              Open consumerhelpline.gov.in ↗
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Numbered Evidence Annexures Index */}
      {activeTab === "ANNEXURES" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-100">Evidence Annexure Index (Exhibits A-Z)</h4>
            <p className="text-xs text-slate-400">
              Corroborated list of files cross-referenced in Section 4 of the Formal Legal Notice.
            </p>
          </div>

          {annexures.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No annexure items indexed in this package version.
            </div>
          ) : (
            <div className="space-y-3">
              {annexures.map((ann, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold text-xs rounded-lg flex-shrink-0">
                      {ann.exhibit_number}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">{ann.file_name}</h5>
                      <p className="text-xs text-slate-400 mt-1">{ann.evidentiary_purpose}</p>
                    </div>
                  </div>

                  {ann.date_of_document && (
                    <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                      {ann.date_of_document}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
