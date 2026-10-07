import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, MessageSquare, ArrowRight, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";

interface ContradictionItem {
  id: string;
  discrepancy_description: string;
  severity: string;
  is_resolved: boolean;
  user_resolution_comment?: string | null;
}

interface ContradictionCardProps {
  contradictions: ContradictionItem[];
  onResolved: () => void;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({
  contradictions,
  onResolved,
}) => {
  const [activeClarifyId, setActiveClarifyId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleResolve = async (id: string, isDismiss = false) => {
    try {
      setIsSubmitting(true);
      await api.resolveContradiction(
        id,
        true,
        isDismiss ? "Reviewed and verified as consistent by consumer." : commentText
      );
      setActiveClarifyId(null);
      setCommentText("");
      onResolved();
    } catch (err: any) {
      alert("Failed to update contradiction: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contradictions || contradictions.length === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-100">Zero Internal Contradictions Detected</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All extracted facts across invoices, communications, and photographic proofs exhibit forensic factual consistency.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Factual Discrepancy & Contradiction Alerts ({contradictions.length})</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Objective, non-accusatory flags highlighting variance between merchant communication, invoices, and physical conditions.
        </p>
      </div>

      <div className="space-y-4">
        {contradictions.map((c, idx) => (
          <div
            key={c.id || idx}
            className={`rounded-2xl p-5 border transition-all ${
              c.is_resolved
                ? "bg-slate-900/40 border-slate-800 opacity-70"
                : "bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-950/20"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    c.is_resolved
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                      : "bg-amber-950/80 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {c.is_resolved ? "Resolved / Clarified" : "Variance Requiring Verification"}
                </span>
                <span className="text-xs text-slate-400 font-medium">Alert #{idx + 1}</span>
              </div>

              {!c.is_resolved && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResolve(c.id, true)}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Dismiss Variance
                  </button>
                  <button
                    onClick={() => {
                      setActiveClarifyId(activeClarifyId === c.id ? null : c.id);
                      setCommentText("");
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Provide Clarification</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {c.discrepancy_description}
            </p>

            {/* If Resolved, show comment */}
            {c.is_resolved && c.user_resolution_comment && (
              <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">Consumer Resolution Note: </span>
                {c.user_resolution_comment}
              </div>
            )}

            {/* Clarification Input Box */}
            {activeClarifyId === c.id && (
              <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Enter explanation / corroborating detail to reconcile this discrepancy:
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="e.g. The invoice states 55-inch because of merchant bundle SKU, but merchant email mistakenly quoted 43-inch model."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setActiveClarifyId(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleResolve(c.id, false)}
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30"
                  >
                    {isSubmitting ? "Saving..." : "Save Resolution"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
