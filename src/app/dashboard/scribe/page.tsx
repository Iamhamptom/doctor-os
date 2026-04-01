"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, FileText, Loader2, AlertTriangle, CheckCircle, Send } from "lucide-react";

interface SOAPData {
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  icd10Codes: Array<{ code: string; description: string; confidence: number }>;
  redFlags: string[];
  chiefComplaint: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
}

export default function ScribePage() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [soapData, setSoapData] = useState<SOAPData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          setError("Recording too short. Please speak for at least a few seconds.");
          return;
        }
        await transcribeAudio(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setRecording(true);
      setError("");
    } catch {
      setError("Microphone access denied. Please allow microphone in browser settings.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const transcribeAudio = async (blob: Blob) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/scribe/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (data.transcript) {
        setTranscript(prev => prev + (prev ? "\n" : "") + data.transcript);
      }
    } catch {
      setError("Transcription failed. Check GEMINI_API_KEY.");
    }
    setAnalyzing(false);
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim() || transcript.length < 20) {
      setError("Need at least 20 characters of transcript to analyze.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/scribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (data.analysis) setSoapData(data.analysis);
      else setError("Analysis failed — check API keys.");
    } catch {
      setError("Analysis failed.");
    }
    setAnalyzing(false);
  };

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">AI Scribe</h1>
          <p className="text-[11px] text-muted-foreground">Record consultation, generate SOAP notes with ICD-10 codes.</p>
        </div>
        {transcript && !analyzing && (
          <button
            onClick={analyzeTranscript}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition"
          >
            <Send className="w-3.5 h-3.5" /> Analyze SOAP
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-rejected)]/10 text-[var(--color-rejected)] text-[12px] mb-4">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Transcript Panel */}
        <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] font-medium">Transcript</span>
            </div>
            {analyzing && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {transcript ? (
              <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed">{transcript}</pre>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                Press the microphone button to start recording. Or paste/type a transcript below.
              </p>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ring-1 ${
                  recording
                    ? "bg-[var(--color-rejected)]/20 ring-[var(--color-rejected)] text-[var(--color-rejected)] animate-pulse"
                    : "bg-accent ring-border text-foreground hover:bg-accent/80"
                }`}
              >
                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                placeholder="Or type/paste transcript here..."
                className="flex-1 bg-transparent ring-1 ring-border rounded-md px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    setTranscript(prev => prev + (prev ? "\n" : "") + e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* SOAP Panel */}
        <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[13px] font-medium">SOAP Notes</span>
            {soapData && <CheckCircle className="w-3 h-3 text-[var(--color-valid)] ml-auto" />}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {soapData ? (
              <>
                {/* Chief Complaint */}
                <div className="rounded-md bg-accent px-3 py-2">
                  <span className="text-[11px] text-muted-foreground uppercase">Chief Complaint</span>
                  <p className="text-[13px] font-medium">{soapData.chiefComplaint}</p>
                </div>

                {/* SOAP Sections */}
                {(["subjective", "objective", "assessment", "plan"] as const).map(section => (
                  <div key={section}>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      {section.charAt(0).toUpperCase()} &mdash; {section}
                    </label>
                    <div className="mt-1 rounded-md ring-1 ring-border bg-background p-3 text-[13px] leading-relaxed min-h-[40px]">
                      {soapData.soap[section] || "—"}
                    </div>
                  </div>
                ))}

                {/* ICD-10 Codes */}
                {soapData.icd10Codes.length > 0 && (
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">ICD-10 Codes</label>
                    <div className="mt-1 space-y-1">
                      {soapData.icd10Codes.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md ring-1 ring-border bg-background px-3 py-1.5">
                          <span className="text-[13px] font-mono font-bold">{c.code}</span>
                          <span className="text-[12px] text-muted-foreground flex-1">{c.description}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{c.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {soapData.redFlags.length > 0 && (
                  <div>
                    <label className="text-[11px] text-[var(--color-rejected)] uppercase tracking-wider font-medium">Red Flags</label>
                    <div className="mt-1 space-y-1">
                      {soapData.redFlags.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px] text-[var(--color-rejected)]">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {soapData.medications.length > 0 && (
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Medications Mentioned</label>
                    <div className="mt-1 space-y-1">
                      {soapData.medications.map((m, i) => (
                        <div key={i} className="text-[12px] font-mono">
                          {m.name} {m.dosage} — {m.frequency}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-[13px] text-muted-foreground">SOAP notes will appear here after analysis.</p>
                <p className="text-[11px] text-muted-foreground mt-1">Record or type a transcript, then click &quot;Analyze SOAP&quot;.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
