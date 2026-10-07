import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Brain,
  Sparkles,
  Clock,
  FileBadge,
  AlertTriangle,
  ClipboardCheck,
  ArrowRight,
  HelpCircle,
  FileText,
  Building2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Navbar } from "../components/Layout/Navbar";
import { ChronologicalTimelineView } from "../components/Analysis/ChronologicalTimelineView";
import { ClaimEvidenceMatrix } from "../components/Analysis/ClaimEvidenceMatrix";
import { ContradictionCard } from "../components/Analysis/ContradictionCard";
import { MissingEvidenceAlert } from "../components/Analysis/MissingEvidenceAlert";
import { useCase } from "../hooks/useCase";
import { formatCurrency, formatDate } from "../lib/utils";

export const AnalysisHubPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    case: caseData,
    evidenceFiles,
    timeline,
    claims,
    contradictions,
    facts,
    isLoading,
    isAnalyzing,
    refresh,
    runAnalysis,
  } = useCase(id);

  const [activeTab, setActiveTab] = useState<"TIMELINE" | "CLAIMS" | "CONTRADICTIONS" | "GAPS">(
    "TIMELINE"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto p-12 text-center text-slate-400">
          Case not found.
        </div>
      </div>
    );
  }

  const unresolvedConflicts = contradictions?.filter((c: any) => !c.is_resolved) || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar currentCaseId={id} caseTitle={caseData.title} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hub Header & Fusion Engine Trigger */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
                <Brain className="w-4 h-4" />
                <span>Multimodal Evidence Fusion Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{caseData.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Opposing Party: <strong className="text-slate-200">{caseData.opposing_party}</strong> • Ref: {caseData.order_reference_number || "N/A"}
              </p>
            </div>

            {/* Run Fusion Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Gemini Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Run Full Evidence Fusion</span>
                  </>
                )}
              </button>

              <Link
                to={`/cases/${id}/package`}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <span>Export Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Attached Exhibits</span>
              <span className="text-slate-200 font-bold text-sm">{evidenceFiles?.length || 0} Files</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Chronological Events</span>
              <span className="text-indigo-400 font-bold text-sm">{timeline?.length || 0} Milestones</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Statutory Claims</span>
              <span className="text-emerald-400 font-bold text-sm">{claims?.length || 0} Substantive</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Factual Discrepancies</span>
              <span className="text-amber-400 font-bold text-sm">{unresolvedConflicts.length} Unresolved</span>
            </div>
          </div>
        </div>

        {/* 4 Forensic Analysis Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "TIMELINE"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Reconstructed Timeline ({timeline?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("CLAIMS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "CLAIMS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>2. Claim-to-Evidence Matrix ({claims?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("CONTRADICTIONS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "CONTRADICTIONS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>3. Contradictions & Discrepancies ({contradictions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("GAPS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "GAPS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>4. Evidence Completeness Audit</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div>
          {activeTab === "TIMELINE" && (
            <ChronologicalTimelineView
              timeline={timeline || []}
              evidenceFiles={evidenceFiles || []}
            />
          )}

          {activeTab === "CLAIMS" && (
            <ClaimEvidenceMatrix claims={claims || []} />
          )}

          {activeTab === "CONTRADICTIONS" && (
            <ContradictionCard
              contradictions={contradictions || []}
              onResolved={refresh}
            />
          )}

          {activeTab === "GAPS" && (
            <MissingEvidenceAlert
              caseId={id!}
              checklist={[]}
            />
          )}
        </div>
      </main>
    </div>
  );
};
