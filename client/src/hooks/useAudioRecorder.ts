import { useState, useRef, useEffect, useCallback } from "react";

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioLevels: number[];
  error: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    durationSeconds: 0,
    audioBlob: null,
    audioUrl: null,
    audioLevels: [],
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, audioBlob: null, audioUrl: null, durationSeconds: 0 }));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio analysis for live visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl,
        }));
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorder.start(200);

      // Duration counter
      const startTimestamp = Date.now();
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          durationSeconds: Math.floor((Date.now() - startTimestamp) / 1000),
        }));
      }, 1000);

      // Realtime audio frequency visualizer loop
      const sampleLevels = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          // Pick 12 representative bars
          const bars: number[] = [];
          const step = Math.floor(dataArray.length / 12);
          for (let i = 0; i < 12; i++) {
            bars.push(dataArray[i * step] / 255);
          }
          setState((prev) => ({ ...prev, audioLevels: bars }));
        }
        animationFrameRef.current = requestAnimationFrame(sampleLevels);
      };
      sampleLevels();

      setState((prev) => ({ ...prev, isRecording: true, isPaused: false }));
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setState((prev) => ({
        ...prev,
        isRecording: false,
        error: err.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone permissions in your browser."
          : `Failed to initialize microphone: ${err.message}`,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      isPaused: false,
      durationSeconds: 0,
      audioBlob: null,
      audioUrl: null,
      audioLevels: [],
      error: null,
    });
  }, [stopRecording, state.audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    };
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
