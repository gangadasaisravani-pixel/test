import React, { useState } from "react";
import { Mic, Square, Play, RotateCcw, Upload, Volume2, Sparkles, CheckCircle2 } from "lucide-react";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { api } from "../../lib/api";

interface VoiceDictationModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const {
    isRecording,
    durationSeconds,
    audioBlob,
    audioUrl,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [description, setDescription] = useState<string>("Consumer Verbal Grievance Dictation");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("audio", audioBlob, `voice_dictation_${Date.now()}.webm`);
      formData.append("description", description);

      await api.uploadVoiceStatement(caseId, formData);
      resetRecording();
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload voice statement");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Direct Voice Grievance Capture</h3>
              <p className="text-xs text-slate-400">Dictate your account verbally for Gemini audio transcription</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetRecording();
              onClose();
            }}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Audio Visualizer & State Box */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-center space-y-5">
          {/* Animated Waveform Bars */}
          <div className="h-20 flex items-center justify-center space-x-1.5 w-full max-w-xs">
            {isRecording ? (
              audioLevels.length > 0 ? (
                audioLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(8, lvl * 80)}px`,
                    }}
                  />
                ))
              ) : (
                <div className="text-xs text-indigo-400 animate-pulse">Listening to microphone input...</div>
              )
            ) : audioBlob ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Audio recording captured ({formatTimer(durationSeconds)})</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span>Press Record to start dictating your grievance</span>
              </div>
            )}
          </div>

          {/* Recording Timer */}
          <div className="text-3xl font-black tracking-widest font-mono text-slate-100">
            {formatTimer(durationSeconds)}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center space-x-4">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-lg transition-all animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetRecording}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>
              </div>
            )}
          </div>

          {/* Native Audio Preview if captured */}
          {audioUrl && !isRecording && (
            <div className="w-full pt-2">
              <audio src={audioUrl} controls className="w-full h-10 rounded-lg filter invert" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-3 rounded-xl">
            {error}
          </div>
        )}

        {uploadError && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-3 rounded-xl">
            {uploadError}
          </div>
        )}

        {/* Statement Label */}
        {audioBlob && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Statement Description / Context
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Verbal phone call exchange with merchant supervisor"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              resetRecording();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!audioBlob || isRecording || isUploading}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isUploading ? (
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Storing in Vault...</span>
              </span>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Save Audio to Case</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
