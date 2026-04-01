"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, Square, FileText, Loader2, AlertTriangle, CheckCircle,
  Download, ExternalLink, ArrowRight, Volume2, VolumeX, X, RotateCcw,
} from "lucide-react";

interface SOAPData {
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  icd10Codes: Array<{ code: string; description: string; confidence: number }>;
  redFlags: string[];
  chiefComplaint: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
}

export default function ScribePage() {
  const [phase, setPhase] = useState<"ready" | "recording" | "processing" | "done">("ready");
  const [transcript, setTranscript] = useState("");
  const [soap, setSoap] = useState<SOAPData | null>(null);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [statusText, setStatusText] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer
  useEffect(() => {
    if (phase === "recording") {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const speak = useCallback(async (text: string) => {
    if (!voiceOn) return;
    try {
      const r = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!r.ok) return;
      const blob = await r.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch { /* silent */ }
  }, [voiceOn]);

  // ── START: one tap ──
  const start = useCallback(async () => {
    setError("");
    setTranscript("");
    setSoap(null);
    setShowReview(false);
    setStatusText("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        runPipeline(blob);
      };

      recorderRef.current = recorder;
      recorder.start(500);
      setPhase("recording");
      speak("Recording. Speak naturally.");
    } catch {
      setError("Allow microphone access in your browser to record.");
    }
  }, [speak]);

  // ── STOP: one tap ──
  const stop = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── PIPELINE: transcribe → SOAP → auto-show review ──
  const runPipeline = async (blob: Blob) => {
    setPhase("processing");

    // 1. Transcribe
    setStatusText("Transcribing with Gemini 2.5 Flash...");
    try {
      const fd = new FormData();
      fd.append("audio", blob, "consultation.webm");
      const r1 = await fetch("/api/scribe/transcribe", { method: "POST", body: fd });
      const d1 = await r1.json();

      if (!d1.transcript || d1.transcript === "[silence]" || d1.error) {
        setError(d1.error || "No speech detected. Try recording again.");
        setPhase("ready");
        return;
      }
      setTranscript(d1.transcript);
    } catch {
      setError("Transcription failed — check connection.");
      setPhase("ready");
      return;
    }

    // 2. SOAP
    setStatusText("Generating SOAP notes + ICD-10 codes...");
    try {
      const r2 = await fetch("/api/scribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      // transcript state may not have updated yet — re-read from the transcribe response
      // Actually let's use a local var
    } catch {
      setError("SOAP analysis failed.");
      setPhase("ready");
      return;
    }

    setPhase("ready"); // fallback
  };

  // Fixed pipeline that uses local variables instead of state
  const runFullPipeline = async (blob: Blob) => {
    setPhase("processing");

    // 1. Transcribe
    setStatusText("Transcribing with Gemini 2.5 Flash...");
    let transcriptText = "";
    try {
      const fd = new FormData();
      fd.append("audio", blob, "consultation.webm");
      const r1 = await fetch("/api/scribe/transcribe", { method: "POST", body: fd });
      const d1 = await r1.json();

      if (!d1.transcript || d1.transcript === "[silence]" || d1.error) {
        setError(d1.error || "No speech detected. Record again.");
        setPhase("ready");
        return;
      }
      transcriptText = d1.transcript;
      setTranscript(transcriptText);
      speak("Transcript ready. Analyzing.");
    } catch {
      setError("Transcription failed.");
      setPhase("ready");
      return;
    }

    // 2. SOAP
    setStatusText("Generating SOAP notes + ICD-10 codes...");
    try {
      const r2 = await fetch("/api/scribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptText }),
      });
      const d2 = await r2.json();

      if (d2.analysis) {
        setSoap(d2.analysis);
        setPhase("done");
        setShowReview(true);
        const codes = d2.analysis.icd10Codes.map((c: { code: string }) => c.code).join(", ");
        speak(`Done. ${d2.analysis.icd10Codes.length} codes: ${codes}. Review the document.`);
      } else {
        setError("SOAP failed — " + (d2.error || "unknown error"));
        setPhase("ready");
      }
    } catch {
      setError("SOAP analysis failed.");
      setPhase("ready");
    }
  };

  // Override the recorder onstop to use the fixed pipeline
  const startRecording = useCallback(async () => {
    setError("");
    setTranscript("");
    setSoap(null);
    setShowReview(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        runFullPipeline(blob);
      };

      recorderRef.current = recorder;
      recorder.start(500);
      setPhase("recording");
      speak("Recording started.");
    } catch {
      setError("Microphone blocked. Allow access in browser settings.");
    }
  }, [speak]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Documents ──
  const buildDoc = (data: SOAPData) => [
    "CLINICAL CONSULTATION — CODING DOCUMENT",
    "=".repeat(45),
    `Date: ${new Date().toLocaleDateString("en-ZA")}`,
    "", `Chief Complaint: ${data.chiefComplaint}`,
    "", "ICD-10 CODES", "-".repeat(30),
    ...data.icd10Codes.map(c => `  ${c.code}  ${c.description}  [${c.confidence}%]`),
    "", "S — Subjective", data.soap.subjective || "—",
    "", "O — Objective", data.soap.objective || "—",
    "", "A — Assessment", data.soap.assessment || "—",
    "", "P — Plan", data.soap.plan || "—",
    ...(data.medications.length ? ["", "Medications", ...data.medications.map(m => `  ${m.name} ${m.dosage} — ${m.frequency}`)] : []),
    ...(data.redFlags.length ? ["", "RED FLAGS", ...data.redFlags.map(f => `  ! ${f}`)] : []),
  ].join("\n");

  const download = () => {
    if (!soap) return;
    const b = new Blob([buildDoc(soap)], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = `consultation-${new Date().toISOString().split("T")[0]}.txt`; a.click();
  };

  const sendToVisioCode = () => {
    if (!soap) return;
    download();
    const codes = soap.icd10Codes.map(c => c.code).join(", ");
    const p = `Doctor OS consultation:\n\nChief Complaint: ${soap.chiefComplaint}\nICD-10: ${codes}\nAssessment: ${soap.soap.assessment}\nPlan: ${soap.soap.plan}\n\nValidate codes and check scheme compatibility.`;
    window.open(`https://visiocode.vercel.app/chat?prompt=${encodeURIComponent(p)}`, "_blank");
    setShowReview(false);
  };

  const reset = () => { setPhase("ready"); setTranscript(""); setSoap(null); setShowReview(false); setError(""); setSeconds(0); };

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">AI Scribe</h1>
          <p className="text-[11px] text-muted-foreground">
            {phase === "ready" && "Tap the mic to start a consultation."}
            {phase === "recording" && "Listening... tap the stop button when done."}
            {phase === "processing" && statusText}
            {phase === "done" && "Consultation ready. Review and send for coding."}
          </p>
        </div>
        <button onClick={() => setVoiceOn(!voiceOn)} className="p-1.5 rounded-md ring-1 ring-border transition" title="Toggle voice">
          {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-rejected)]/10 text-[var(--color-rejected)] text-[12px] mb-4">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* ═══ PHASE: READY — Big mic button ═══ */}
      {phase === "ready" && !soap && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={startRecording}
            className="w-32 h-32 rounded-full ring-2 ring-border bg-card flex items-center justify-center hover:bg-accent hover:ring-foreground transition-all group"
          >
            <Mic className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition" />
          </button>
          <p className="mt-6 text-[13px] text-muted-foreground">Tap to record consultation</p>
          <p className="text-[11px] text-muted-foreground mt-1">Gemini transcribes &rarr; SOAP auto-generates &rarr; Review &rarr; Send to VisioCode</p>
        </div>
      )}

      {/* ═══ PHASE: RECORDING — Pulsing stop button + live indicator ═══ */}
      {phase === "recording" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={stopRecording}
            className="w-32 h-32 rounded-full ring-2 ring-[var(--color-rejected)] bg-[var(--color-rejected)]/10 flex items-center justify-center animate-pulse"
          >
            <Square className="w-10 h-10 text-[var(--color-rejected)]" />
          </button>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--color-rejected)] animate-pulse" />
            <span className="text-2xl font-mono font-semibold">{fmt(seconds)}</span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-2">Recording... tap stop when done</p>
        </div>
      )}

      {/* ═══ PHASE: PROCESSING — Spinner ═══ */}
      {phase === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin text-muted-foreground mb-6" />
          <p className="text-[13px] font-medium">{statusText}</p>
          <p className="text-[11px] text-muted-foreground mt-1">This takes 5-15 seconds...</p>
        </div>
      )}

      {/* ═══ PHASE: DONE — Split view ═══ */}
      {(phase === "done" || (phase === "ready" && soap)) && soap && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Transcript */}
          <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] font-medium">Transcript</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed">{transcript}</pre>
            </div>
          </div>

          {/* SOAP */}
          <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] font-medium">SOAP Notes</span>
              <CheckCircle className="w-3 h-3 text-[var(--color-valid)] ml-auto" />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="rounded-md bg-accent px-3 py-2">
                <span className="text-[10px] text-muted-foreground uppercase">Chief Complaint</span>
                <p className="text-[13px] font-medium">{soap.chiefComplaint}</p>
              </div>

              {(["subjective","objective","assessment","plan"] as const).map(s => (
                <div key={s}>
                  <label className="text-[10px] text-muted-foreground uppercase font-medium">{s.charAt(0).toUpperCase()} — {s}</label>
                  <div className="mt-1 rounded-md ring-1 ring-border bg-background p-2 text-[12px] leading-relaxed">{soap.soap[s] || "—"}</div>
                </div>
              ))}

              {soap.icd10Codes.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-medium">ICD-10 Codes</label>
                  <div className="mt-1 space-y-1">
                    {soap.icd10Codes.map((c,i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md ring-1 ring-border bg-background px-2 py-1">
                        <span className="text-[12px] font-mono font-bold">{c.code}</span>
                        <span className="text-[11px] text-muted-foreground flex-1">{c.description}</span>
                        <span className="text-[10px] font-mono">{c.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {soap.redFlags.length > 0 && soap.redFlags.map((f,i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-rejected)]">
                  <AlertTriangle className="w-3 h-3" /> {f}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-2">
              <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] hover:bg-accent transition">
                <RotateCcw className="w-3.5 h-3.5" /> New
              </button>
              <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] hover:bg-accent transition">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Review &amp; Code <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REVIEW MODAL ═══ */}
      {showReview && soap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowReview(false)}>
          <div className="w-full max-w-2xl max-h-[85vh] rounded-lg ring-1 ring-border bg-card flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Review Before Coding</h2>
                <p className="text-[11px] text-muted-foreground">This document will be sent to VisioCode for clinical coding validation.</p>
              </div>
              <button onClick={() => setShowReview(false)} className="p-1 rounded hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground">{buildDoc(soap)}</pre>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center gap-3">
              <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] hover:bg-accent transition">
                <Download className="w-3.5 h-3.5" /> Download Only
              </button>
              <div className="flex-1" />
              <button
                onClick={sendToVisioCode}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Send to VisioCode <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
