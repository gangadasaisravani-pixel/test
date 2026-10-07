import React from "react";
import { CheckCircle2, AlertCircle, FileBadge, ArrowUpRight, ShieldCheck, Scale } from "lucide-react";
import { getConfidenceBadgeClass } from "../../lib/utils";

interface ClaimItem {
  id: string;
  claim_statement: string;
  requested_remedy: string;
  evidence_strength: "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN";
  missing_proof_notes?: string | null;
  supportingEvidence?: any[];
}

interface ClaimEvidenceMatrixProps {
  claims: ClaimItem[];
}

export const ClaimEvidenceMatrix: React.FC<ClaimEvidenceMatrixProps> = ({ claims }) => {
  if (!claims || claims.length === 0) {
    return (
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
        No claims mapped yet. Run the Evidence Fusion Engine to link consumer allegations against forensic exhibits.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Claim-to-Evidence Corroboration Matrix ({claims.length} Claims)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Maps specific consumer assertions directly to objective visual proofs, document quotes, and statutory remedy demands.
        </p>
      </div>

      <div className="space-y-4">
        {claims.map((claim, idx) => {
          const isCorroborated = claim.supportingEvidence && claim.supportingEvidence.length > 0;

          return (
            <div
              key={claim.id || idx}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-indigo-500/40 space-y-4 transition-all"
            >
              {/* Claim Header & Strength */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Claim #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isCorroborated
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                        : "bg-rose-950/80 text-rose-400 border-rose-500/40"
                    }`}
                  >
                    {isCorroborated ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Corroborated</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Unsupported</span>
                      </>
                    )}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getConfidenceBadgeClass(
                      claim.evidence_strength
                    )}`}
                  >
                    {claim.evidence_strength} PROOF STRENGTH
                  </span>
                </div>
              </div>

              {/* Statement */}
              <div className="text-sm font-semibold text-slate-100 leading-snug">
                "{claim.claim_statement}"
              </div>

              {/* Grid: Supporting Evidence & Requested Remedy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Supporting Evidence Chips */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Corroborating Exhibits</span>
                  </div>

                  {claim.supportingEvidence && claim.supportingEvidence.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {claim.supportingEvidence.map((sup, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 text-[11px] font-medium"
                        >
                          {sup.file_name || `Exhibit ${sIdx + 1}`}
                          {sup.specific_support_excerpt && (
                            <span className="text-slate-400 block text-[10px] mt-0.5">
                              {sup.specific_support_excerpt}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[11px] italic">
                      No uploaded file directly confirms this point yet.
                    </div>
                  )}
                </div>

                {/* Requested Remedy */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileBadge className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Statutory Remedy Claimed</span>
                  </div>
                  <div className="text-slate-200 font-medium text-xs leading-relaxed">
                    {claim.requested_remedy}
                  </div>
                </div>
              </div>

              {/* Missing Proof Notes if any */}
              {claim.missing_proof_notes && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-bold">Evidentiary Gap Note: </span>
                    {claim.missing_proof_notes}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
