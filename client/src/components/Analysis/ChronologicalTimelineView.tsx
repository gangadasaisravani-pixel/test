import React, { useState } from "react";
import {
  Calendar,
  Clock,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate, getConfidenceBadgeClass } from "../../lib/utils";

interface TimelineEventItem {
  id: string;
  event_date?: string | null;
  event_time?: string | null;
  is_date_uncertain: boolean;
  event_title: string;
  event_description: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN";
  evidence_references?: string[];
}

interface ChronologicalTimelineViewProps {
  timeline: TimelineEventItem[];
  evidenceFiles: any[];
}

export const ChronologicalTimelineView: React.FC<ChronologicalTimelineViewProps> = ({
  timeline,
  evidenceFiles,
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  };

  const getEvidenceName = (id: string) => {
    const found = evidenceFiles.find((f) => f.id === id);
    return found ? found.file_name : `Evidence Ref #${id.slice(0, 6)}`;
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
        No chronological timeline generated yet. Run the Evidence Fusion Engine to construct an audit-ready timeline.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Chronological Forensic Timeline ({timeline.length} Events)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministically reconstructed from invoice timestamps, courier tracking, and photo metadata.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-semibold">
            High Confidence
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-500/40 font-semibold">
            Uncertain Date
          </span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-slate-800">
        {timeline.map((event, index) => {
          const isExpanded = expandedEventId === event.id || index === 0;

          return (
            <div key={event.id || index} className="relative group">
              {/* Timeline Pin Indicator */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-all ${
                  event.is_date_uncertain
                    ? "border-purple-500 text-purple-400"
                    : event.confidence === "HIGH"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-indigo-500 text-indigo-400"
                }`}
              >
                {event.is_date_uncertain ? (
                  <HelpCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
              </div>

              {/* Event Card */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-indigo-500/40 transition-all">
                {/* Header: Date + Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-200">
                      {event.is_date_uncertain
                        ? "Approximate Date / Date Uncertain"
                        : formatDate(event.event_date)}
                    </span>
                    {event.event_time && (
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.event_time}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {event.is_date_uncertain && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-purple-400 border border-purple-500/40 flex items-center space-x-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Date Uncertain</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getConfidenceBadgeClass(
                        event.confidence
                      )}`}
                    >
                      {event.confidence} CONFIDENCE
                    </span>
                  </div>
                </div>

                {/* Event Title */}
                <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {event.event_title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {event.event_description}
                </p>

                {/* Supporting Evidence Citations */}
                {event.evidence_references && event.evidence_references.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Sources Cited:
                    </span>
                    {event.evidence_references.map((refId, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-indigo-300"
                      >
                        <FileText className="w-3 h-3 text-indigo-400" />
                        <span>{getEvidenceName(refId)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
