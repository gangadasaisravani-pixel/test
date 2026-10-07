import React from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Calendar,
  Building2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Sparkles,
  FileBadge,
} from "lucide-react";
import { formatCurrency, formatDate, getDomainInfo, getStatusBadgeClass } from "../../lib/utils";

interface CaseCardProps {
  caseData: any;
  onDelete: (id: string) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onDelete }) => {
  const domainInfo = getDomainInfo(caseData.domain);
  const completeness = caseData.completenessScore || 35;

  return (
    <div className="glass-card rounded-2xl p-6 relative group overflow-hidden border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />

      <div>
        {/* Top Header: Domain & Status */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
            <span>{domainInfo.label}</span>
          </span>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadgeClass(
                caseData.status
              )}`}
            >
              {caseData.status?.replace(/_/g, " ")}
            </span>
            <button
              onClick={() => onDelete(caseData.id)}
              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Delete case"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Case Title */}
        <Link to={`/cases/${caseData.id}/analysis`} className="block">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
            {caseData.title}
          </h3>
        </Link>

        {/* Subcategory */}
        <p className="text-xs text-indigo-400/90 font-medium mt-1">
          {caseData.subcategory}
        </p>

        {/* Merchant & Transaction particulars */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center space-x-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium text-slate-200" title={caseData.opposing_party}>
              {caseData.opposing_party}
            </span>
          </div>

          <div className="flex items-center justify-end font-semibold text-emerald-400">
            {formatCurrency(caseData.transaction_amount, caseData.currency)}
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatDate(caseData.transaction_date)}</span>
          </div>

          <div className="flex items-center justify-end text-slate-400 truncate">
            Ref: {caseData.order_reference_number || "N/A"}
          </div>
        </div>

        {/* Case Metric Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <FolderOpen className="w-3 h-3 text-indigo-400" />
            <span>{caseData.evidenceCount || 0} Evidence Files</span>
          </div>

          {caseData.unresolvedContradictions > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>{caseData.unresolvedContradictions} Conflict Flag</span>
            </div>
          )}

          {caseData.claimsCount > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <FileBadge className="w-3 h-3 text-emerald-400" />
              <span>{caseData.claimsCount} Claims Linked</span>
            </div>
          )}
        </div>

        {/* Completeness Meter */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 font-medium">Evidence Completeness</span>
            <span className="font-bold text-indigo-400">{completeness}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/cases/${caseData.id}/evidence`}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center space-x-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload Files</span>
        </Link>

        <Link
          to={`/cases/${caseData.id}/analysis`}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 group-hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Analysis Hub</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>
    </div>
  );
};
