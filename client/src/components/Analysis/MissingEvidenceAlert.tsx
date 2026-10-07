import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, UploadCloud, HelpCircle } from "lucide-react";

interface MissingItem {
  item_name: string;
  status: "AVAILABLE" | "PARTIAL" | "MISSING";
  importance: "CRITICAL" | "RECOMMENDED" | "OPTIONAL";
  reason: string;
}

interface MissingEvidenceAlertProps {
  caseId: string;
  checklist: MissingItem[];
}

export const MissingEvidenceAlert: React.FC<MissingEvidenceAlertProps> = ({
  caseId,
  checklist,
}) => {
  if (!checklist || checklist.length === 0) {
    // Default standard checklist if empty
    checklist = [
      {
        item_name: "Original Tax Invoice / Proof of Payment",
        status: "AVAILABLE",
        importance: "CRITICAL",
        reason: "Establishes privity of contract and value of consideration.",
      },
      {
        item_name: "Physical Proof of Defect / Damage",
        status: "AVAILABLE",
        importance: "CRITICAL",
        reason: "Required under CPA 2019 Section 84 for product liability.",
      },
      {
        item_name: "Technician Unboxing Inspection Sheet / DOA Slip",
        status: "MISSING",
        importance: "RECOMMENDED",
        reason: "Locks chronological proof against claims of consumer-induced harm.",
      },
      {
        item_name: "Customer Support Communication Log / Deadlock Email",
        status: "PARTIAL",
        importance: "RECOMMENDED",
        reason: "Demonstrates exhaustion of internal merchant grievance redressal.",
      },
    ];
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case "PARTIAL":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/80 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            <span>Partial</span>
          </span>
        );
      case "MISSING":
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-500/40">
            <XCircle className="w-3 h-3" />
            <span>Missing</span>
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "CRITICAL":
        return "bg-rose-950/60 text-rose-400 border-rose-800/40 font-bold";
      case "RECOMMENDED":
        return "bg-indigo-950/60 text-indigo-300 border-indigo-800/40";
      case "OPTIONAL":
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Statutory Evidence Completeness Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Checklist calibrated to District Commission (e-Daakhil) and NCH admissibility standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className={`glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-3 ${
              item.status === "MISSING" && item.importance === "CRITICAL"
                ? "border-rose-500/30 bg-rose-950/10"
                : "border-slate-800/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold border ${getImportanceBadge(
                    item.importance
                  )}`}
                >
                  {item.importance}
                </span>

                {getStatusBadge(item.status)}
              </div>

              <h4 className="text-sm font-bold text-slate-100">{item.item_name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.reason}</p>
            </div>

            {item.status !== "AVAILABLE" && (
              <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                <Link
                  to={`/cases/${caseId}/evidence`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload this Document</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
