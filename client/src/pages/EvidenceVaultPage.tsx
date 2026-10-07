import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  FolderOpen,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "../components/Layout/Navbar";
import { EvidenceUploader } from "../components/Evidence/EvidenceUploader";
import { useCase } from "../hooks/useCase";
import { formatCurrency, formatDate } from "../lib/utils";

export const EvidenceVaultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { case: caseData, evidenceFiles, isLoading, refresh, runAnalysis, isAnalyzing } = useCase(id);

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar currentCaseId={id} caseTitle={caseData.title} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Case Metadata Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
                <span>Domain: {caseData.domain}</span>
                <span>•</span>
                <span>{caseData.subcategory}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{caseData.title}</h1>
            </div>

            {/* Trigger Fusion Engine Action */}
            <div className="flex items-center space-x-3">
              <Link
                to={`/cases/${id}/analysis`}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Evidence Fusion Hub →</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Opposing Entity</span>
              <span className="text-slate-200 font-semibold truncate block">{caseData.opposing_party}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction Value</span>
              <span className="text-emerald-400 font-semibold block">
                {formatCurrency(caseData.transaction_amount, caseData.currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Order Reference</span>
              <span className="text-slate-200 font-mono block">{caseData.order_reference_number || "None"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Purchase Date</span>
              <span className="text-slate-200 block">{formatDate(caseData.transaction_date)}</span>
            </div>
          </div>
        </div>

        {/* Evidence Ingestion Vault Component */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <span>Multimodal Evidence Vault</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely store and preview all supporting materials. Every document receives a SHA-256 integrity hash.
            </p>
          </div>

          <EvidenceUploader
            caseId={id!}
            evidenceFiles={evidenceFiles || []}
            onEvidenceChange={refresh}
          />
        </div>
      </main>
    </div>
  );
};
