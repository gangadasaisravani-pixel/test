import React from "react";
import { useParams, Link } from "react-router-dom";
import { Bot, ArrowRight, Sparkles, FolderOpen } from "lucide-react";
import { Navbar } from "../components/Layout/Navbar";
import { FollowUpInteractiveChat } from "../components/Agent/FollowUpInteractiveChat";
import { useCase } from "../hooks/useCase";

export const ClarificationAgentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    case: caseData,
    followUpQuestions,
    isLoading,
    refresh,
    runAnalysis,
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link to={`/cases/${id}/analysis`} className="hover:text-white transition-colors">
              Evidence Fusion
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">AI Clarification Agent</span>
          </div>

          <Link
            to={`/cases/${id}/package`}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <span>Proceed to Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Chat Console */}
        <FollowUpInteractiveChat
          caseId={id!}
          questions={followUpQuestions || []}
          onAnswerSubmitted={refresh}
        />
      </main>
    </div>
  );
};
