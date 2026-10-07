import React, { useState } from "react";
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";

interface FollowUpQuestion {
  id: string;
  question_text: string;
  rationale: string;
  target_evidence_type?: string | null;
  user_response?: string | null;
  is_answered: boolean;
}

interface FollowUpInteractiveChatProps {
  caseId: string;
  questions: FollowUpQuestion[];
  onAnswerSubmitted: () => void;
}

export const FollowUpInteractiveChat: React.FC<FollowUpInteractiveChatProps> = ({
  caseId,
  questions,
  onAnswerSubmitted,
}) => {
  const [activeAnswers, setActiveAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<Record<string, boolean>>({});

  const handleInputChange = (id: string, text: string) => {
    setActiveAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = async (questionId: string) => {
    const text = activeAnswers[questionId];
    if (!text || !text.trim()) return;

    try {
      setLoadingQuestions((prev) => ({ ...prev, [questionId]: true }));
      await api.answerFollowUp(caseId, questionId, text.trim());
      setActiveAnswers((prev) => ({ ...prev, [questionId]: "" }));
      onAnswerSubmitted();
    } catch (err: any) {
      alert("Failed to submit clarification: " + err.message);
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const unanswered = questions.filter((q) => !q.is_answered);
  const answered = questions.filter((q) => q.is_answered);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 p-6 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Adaptive Clarification Agent</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                Gemini 2.5 Follow-Up
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted inquiries formulated by AI reasoning to lock factual ambiguities before legal notice generation.
            </p>
          </div>
        </div>

        <div className="text-xs text-right">
          <div className="font-bold text-slate-200">
            {unanswered.length} Open Inquiries • {answered.length} Resolved
          </div>
          <div className="text-slate-500 text-[11px]">
            {unanswered.length === 0 ? "All critical gaps bridged!" : "Resolving these locks timeline dates."}
          </div>
        </div>
      </div>

      {/* Unanswered Queries Form Stream */}
      {unanswered.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Actionable Inquiries Requiring Consumer Input
          </h4>

          {unanswered.map((q, idx) => {
            const isLoading = loadingQuestions[q.id];

            return (
              <div
                key={q.id || idx}
                className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-indigo-500/30 space-y-4 transition-all"
              >
                {/* Agent Question Bubble */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="text-sm font-bold text-slate-100">
                      {q.question_text}
                    </div>
                    <div className="text-xs text-indigo-300/80 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-800/30 inline-block">
                      <span className="font-semibold">Investigative Rationale: </span>
                      {q.rationale}
                    </div>
                  </div>
                </div>

                {/* Consumer Reply Input */}
                <div className="pl-11 space-y-2">
                  <div className="relative">
                    <textarea
                      value={activeAnswers[q.id] || ""}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder="Type your clarification here (e.g. Yes, technician issued job sheet #TECH-8921 on Sept 19 confirming panel crack)..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors pr-24"
                    />
                    <button
                      onClick={() => handleSubmit(q.id)}
                      disabled={!activeAnswers[q.id]?.trim() || isLoading}
                      className="absolute right-2.5 bottom-3.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
                    >
                      {isLoading ? (
                        <span>Re-fusing...</span>
                      ) : (
                        <>
                          <span>Submit</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answered Queries Log */}
      {answered.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Integrated Consumer Statements ({answered.length})</span>
          </h4>

          {answered.map((q) => (
            <div
              key={q.id}
              className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Q: {q.question_text}</span>
              </div>
              <div className="pl-5 text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded-xl">
                <span className="font-bold text-slate-400">Sworn Consumer Response: </span>
                {q.user_response}
              </div>
            </div>
          ))}
        </div>
      )}

      {unanswered.length === 0 && answered.length === 0 && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
          No follow-up inquiries generated yet. Run the Evidence Fusion Engine to begin AI clarification.
        </div>
      )}
    </div>
  );
};
