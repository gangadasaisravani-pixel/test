import React from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "../components/Layout/Navbar";
import { ComplaintDossierPreview } from "../components/Package/ComplaintDossierPreview";
import { useCase } from "../hooks/useCase";

export const ComplaintPackagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    case: caseData,
    complaintPackage,
    isLoading,
    generateDossier,
    isAnalyzing,
  } = useCase(id);

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link to={`/cases/${id}/analysis`} className="hover:text-white transition-colors">
              Evidence Fusion
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">CPA 2019 Formal Legal Dossier</span>
          </div>
        </div>

        <ComplaintDossierPreview
          caseId={id!}
          complaintPackage={complaintPackage}
          onRegenerate={generateDossier}
          isGenerating={isAnalyzing}
        />
      </main>
    </div>
  );
};
