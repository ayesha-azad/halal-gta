import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECORD_SECONDS, TAJWEED_API_URL } from "../config.js";
import { apiFetch } from "./api.js";

const MAX_RECORD_MS = MAX_RECORD_SECONDS * 1000;
const ERROR_KEYS = {
  audio_too_short: "badAudio",
  decode_failed: "badAudio",
  invalid_reference: "badReference",
  audio_too_large: "audioTooLarge",
  inference_failed: "checkUnavailable",
  checker_busy: "checkerBusy",
  rate_limited: "rateLimited",
  unauthorized: "checkUnavailable",
  session_unavailable: "checkUnavailable",
};

function pickMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/wav", "audio/mp4"];
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionFor(type = "") {
  if (type.includes("wav")) return "wav";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("mp4")) return "m4a";
  return "webm";
}

export function useRecorder(ayah) {
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [errorKey, setErrorKey] = useState("");
  const [noticeKey, setNoticeKey] = useState("");
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const startedAtRef = useRef(0);
  const uploadRef = useRef(null);
  const mountedRef = useRef(true);

  const drawFrame = useCallback((analyser, active) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 68;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const bars = 56;
    const gap = 3;
    const barWidth = Math.max(2, (width - gap * (bars - 1)) / bars);
    let samples = null;
    if (analyser && active) {
      samples = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(samples);
    }
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#3d6ff6");
    gradient.addColorStop(0.35, "#aa63da");
    gradient.addColorStop(0.7, "#ff2b90");
    gradient.addColorStop(1, "#ffbc24");

    for (let i = 0; i < bars; i += 1) {
      let amplitude = 0.05;
      if (samples) {
        const start = Math.floor((i / bars) * samples.length);
        const end = Math.floor(((i + 1) / bars) * samples.length);
        let peak = 0;
        for (let j = start; j < end; j += 1) {
          peak = Math.max(peak, Math.abs(samples[j] - 128) / 128);
        }
        amplitude = Math.min(1, peak * 1.8);
      }
      const barHeight = Math.max(3, amplitude * height * 0.82);
      ctx.fillStyle = samples ? gradient : "rgba(148,163,184,0.28)";
      const x = i * (barWidth + gap);
      const y = (height - barHeight) / 2;
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
  }, []);

  const startLoop = useCallback(() => {
    const analyser = analyserRef.current;
    const tick = () => {
      drawFrame(analyser, true);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    drawFrame(null, false);
  }, [drawFrame]);

  useEffect(() => {
    mountedRef.current = true;
    drawFrame(null, false);
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      } catch {
        // Already stopped.
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [drawFrame]);

  const upload = useCallback(async (blob) => {
    if (!mountedRef.current) return;
    setPhase("processing");
    const body = new FormData();
    body.append("file", blob, `recitation.${extensionFor(blob.type)}`);
    body.append("text", ayah.uthmani || ayah.indopak);
    if (ayah.surah) body.append("surah", String(ayah.surah));
    if (ayah.ayah) body.append("ayah", String(ayah.ayah));

    try {
      const response = await apiFetch(`${TAJWEED_API_URL}/check`, { method: "POST", body });
      if (!response.ok) {
        let code = "";
        let detail = "";
        try {
          ({ code, detail } = await response.json());
        } catch {
          // Non-JSON error — fall back to the generic message below.
        }
        setErrorKey(
          ERROR_KEYS[code]
            || (response.status === 400 && /short/i.test(detail || "") ? "badAudio" : "checkUnavailable")
        );
        setPhase("idle");
        return;
      }
      const data = await response.json();
      if (!mountedRef.current) return;
      setResult(data);
      setPhase("done");
    } catch {
      if (!mountedRef.current) return;
      setErrorKey("checkUnavailable");
      setPhase("idle");
    }
  }, [ayah]);

  useEffect(() => {
    uploadRef.current = upload;
  }, [upload]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    setErrorKey("");
    setNoticeKey("");
    setResult(null);
    setElapsed(0);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErrorKey("micUnsupported");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1, sampleRate: 16000 },
      });
    } catch {
      setErrorKey("micDenied");
      return;
    }
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      stopLoop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioCtxRef.current?.close().catch(() => {});
      streamRef.current = null;
      audioCtxRef.current = null;
      analyserRef.current = null;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
      if (blob.size < 512) {
        setErrorKey("badAudio");
        setPhase("idle");
        return;
      }
      uploadRef.current?.(blob);
    };

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const context = new AudioCtx();
        audioCtxRef.current = context;
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        context.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
      }
    } catch {
      // Visualisation is decorative — recording works without it.
    }

    startedAtRef.current = Date.now();
    setPhase("recording");
    recorder.start(250);
    startLoop();
    timerRef.current = setInterval(() => setElapsed(Date.now() - startedAtRef.current), 200);
    maxTimerRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        setNoticeKey("maxReached");
        recorderRef.current.stop();
      }
    }, MAX_RECORD_MS);
  }, [startLoop, stopLoop]);

  const reset = useCallback(() => {
    setResult(null);
    setErrorKey("");
    setNoticeKey("");
    setElapsed(0);
    setPhase("idle");
  }, []);

  return { phase, elapsed, errorKey, noticeKey, result, canvasRef, startRecording, stopRecording, reset };
}
