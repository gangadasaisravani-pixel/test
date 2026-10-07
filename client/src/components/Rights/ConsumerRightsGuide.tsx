import React, { useState } from "react";
import {
  Scale,
  ShieldCheck,
  Info,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Gavel,
  Building,
  CheckCircle2,
} from "lucide-react";
import { STATUTORY_CPA_RIGHTS, ESCALATION_TIERS } from "@shared/schema";

interface ConsumerRightsGuideProps {
  caseSubcategory?: string;
}

export const ConsumerRightsGuide: React.FC<ConsumerRightsGuideProps> = ({ caseSubcategory }) => {
  const [expandedRightId, setExpandedRightId] = useState<string | null>("RIGHT_TO_SAFETY");

  const toggleRight = (id: string) => {
    setExpandedRightId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Statutory Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Statutory Consumer Rights Advisory
            </h3>
            <p className="text-xs text-slate-400">
              Governed by the Consumer Protection Act (CPA), 2019 & E-Commerce Rules, 2020 (India)
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Under Indian consumer jurisprudence, buyers have inalienable statutory protections against defective merchandise, deficient service delivery, and deceptive practices. Every ClaimProof dossier is structured according to these codified statutory definitions.
        </p>
      </div>

      {/* Escalation Pathways (Tier 1, Tier 2, Tier 3) */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Gavel className="w-4 h-4 text-indigo-400" />
          <span>Statutory 3-Tier Escalation Framework</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ESCALATION_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    Level {tier.tier}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{tier.timeline}</span>
                </div>

                <h5 className="text-sm font-bold text-slate-100">{tier.title}</h5>
                <div className="text-xs text-indigo-300 font-medium mt-1">{tier.authority}</div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tier.action}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                Basis: {tier.legalBasis}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Codified CPA Rights */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>The 6 Statutory Consumer Rights under CPA 2019</span>
        </h4>

        <div className="space-y-3">
          {STATUTORY_CPA_RIGHTS.map((right) => {
            const isExpanded = expandedRightId === right.id;
            const isDirectlyApplicable = caseSubcategory
              ? right.relevanceCriteria.some((c) =>
                  caseSubcategory.toLowerCase().includes(c.toLowerCase())
                )
              : false;

            return (
              <div
                key={right.id}
                className={`glass-card rounded-2xl border transition-all ${
                  isDirectlyApplicable
                    ? "border-indigo-500/50 bg-indigo-950/15"
                    : "border-slate-800/80"
                }`}
              >
                <button
                  onClick={() => toggleRight(right.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-100">{right.title}</span>
                        {isDirectlyApplicable && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            Directly Applicable to Case
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{right.sectionRef}</span>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 text-xs text-slate-300 space-y-3">
                    <p className="leading-relaxed">{right.description}</p>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider block">
                        Typical Trigger Scenarios:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {right.relevanceCriteria.map((crit, cIdx) => (
                          <li key={cIdx}>{crit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Useful Government Escalation Portals */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <PhoneCall className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="font-bold text-slate-200">National Consumer Helpline (NCH): </span>
            <span className="text-emerald-400 font-mono font-bold">Call 1915</span>
            <span className="text-slate-400"> (Toll-Free, 8 AM - 8 PM, all days)</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://consumerhelpline.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>INGRAM Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://edaakhil.nic.in"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>e-Daakhil DCDRC E-Filing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
