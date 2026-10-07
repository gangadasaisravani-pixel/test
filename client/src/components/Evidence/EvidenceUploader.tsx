import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Mic,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import { VoiceDictationModal } from "./VoiceDictationModal";

interface EvidenceUploaderProps {
  caseId: string;
  evidenceFiles: any[];
  onEvidenceChange: () => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  caseId,
  evidenceFiles,
  onEvidenceChange,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [selectedPreview, setSelectedPreview] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      await api.uploadEvidenceFiles(caseId, formData);
      onEvidenceChange();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm("Are you sure you want to remove this evidence file?")) return;
    try {
      await api.deleteEvidence(evidenceId);
      onEvidenceChange();
    } catch (err: any) {
      alert("Failed to delete evidence: " + err.message);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case "VIDEO":
        return <Video className="w-5 h-5 text-purple-400" />;
      case "AUDIO":
        return <Music className="w-5 h-5 text-amber-400" />;
      case "DOCUMENT":
      default:
        return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone & Voice Dictation Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropzone (Span 2 cols) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-2 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
              : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-indigo-500/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            accept="image/*,video/mp4,video/webm,audio/*,application/pdf"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-base font-bold text-slate-100">
            {isUploading ? "Uploading & Calculating SHA-256..." : "Drag & Drop Multimodal Evidence"}
          </h4>

          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Supports Invoices (PDF), Damage Photos (PNG/JPG), Unboxing Videos (MP4), and Communication Logs. Max 50MB per file.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300">
              PDF Invoices
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-cyan-300">
              Photos (JPG/PNG)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-purple-300">
              Video Proof (MP4)
            </span>
          </div>
        </div>

        {/* Live Audio Dictation Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Direct Voice Statement</h4>
            <p className="text-xs text-slate-400 mt-1">
              Verbal grievance dictation using in-browser microphone. Gemini extracts timestamps and creates sworn narrative context.
            </p>
          </div>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Mic className="w-4 h-4" />
            <span>Launch Microphone</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Vault Inventory List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified Evidence Vault ({evidenceFiles.length})</span>
          </h3>
          <span className="text-xs text-slate-500">All items tagged with SHA-256 for audit defensibility</span>
        </div>

        {evidenceFiles.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No evidence files attached yet. Upload receipts, photos, or voice dictations to begin forensic indexing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceFiles.map((file) => (
              <div
                key={file.id}
                className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-indigo-500/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-100 truncate" title={file.file_name}>
                          {file.file_name}
                        </h5>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span>{file.file_type}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.file_size_bytes)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800"
                      title="Remove evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {file.user_description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {file.user_description}
                    </p>
                  )}
                </div>

                {/* Cryptographic SHA-256 Footprint */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500 truncate max-w-[180px]" title={file.sha256_hash}>
                    SHA: {file.sha256_hash?.slice(0, 12)}...
                  </span>

                  <button
                    onClick={() => setSelectedPreview(file)}
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Capture Modal */}
      <VoiceDictationModal
        caseId={caseId}
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onUploadSuccess={onEvidenceChange}
      />

      {/* Evidence Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-100 text-sm truncate max-w-md">
                  {selectedPreview.file_name}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  SHA-256: {selectedPreview.sha256_hash}
                </div>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800">
              {selectedPreview.file_type === "IMAGE" ? (
                <img
                  src={`/uploads/${selectedPreview.file_name}`}
                  alt={selectedPreview.file_name}
                  className="max-h-[50vh] object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback visual placeholder
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : selectedPreview.file_type === "AUDIO" ? (
                <div className="p-8 text-center space-y-4 w-full">
                  <Music className="w-12 h-12 text-indigo-400 mx-auto" />
                  <audio
                    src={`/uploads/${selectedPreview.file_name}`}
                    controls
                    className="w-full filter invert"
                  />
                </div>
              ) : selectedPreview.file_type === "VIDEO" ? (
                <video
                  src={`/uploads/${selectedPreview.file_name}`}
                  controls
                  className="max-h-[50vh] rounded-lg"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                  <p className="text-xs text-slate-300">Document File Indexed</p>
                  <a
                    href={`/uploads/${selectedPreview.file_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-semibold"
                  >
                    <span>Open In New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
