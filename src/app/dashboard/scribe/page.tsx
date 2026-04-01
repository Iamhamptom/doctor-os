"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, MicOff, FileText, Loader2, AlertTriangle, CheckCircle,
  Download, ExternalLink, Save, X, ArrowRight, Volume2, VolumeX,
  UserCircle, Plug, Clock,
} from "lucide-react";

interface SOAPData {
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  icd10Codes: Array<{ code: string; description: string; confidence: number }>;
  redFlags: string[];
  chiefComplaint: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
}

type ScribeStep = "idle" | "recording" | "transcribing" | "analyzing" | "review" | "saving" | "done";

export default function ScribePage() {
  const [step, setStep] = useState<ScribeStep>("idle");
  const [transcript, setTranscript] = useState("");
  const [soapData, setSoapData] = useState<SOAPData | null>(null);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [saveResult, setSaveResult] = useState<{ consultationId?: string; claimId?: string; syncStatus?: Record<string, { ready: boolean; message: string }> } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Demo patients
  const PATIENTS = [
    { id: "pat-001", name: "Sipho Mthembu", condition: "Hypertension, Diabetes" },
    { id: "pat-002", name: "Thandiwe Dlamini", condition: "General" },
    { id: "pat-003", name: "Johannes Pretorius", condition: "Diabetes, Hypertension" },
  ];

  useEffect(() => {
    if (step === "recording") {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (step === "idle") setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Voice feedback via ElevenLabs ──
  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch { /* silent fail */ }
  }, [voiceEnabled]);

  // ── Recording ──
  const startRecording = useCallback(async () => {
    try {
      setError("");
      setSaveResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { setError("Recording too short."); setStep("idle"); return; }
        await processRecording(blob);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setStep("recording");
      speak("Recording started. Speak naturally.");
    } catch { setError("Microphone access denied."); }
  }, [speak]);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); }, []);

  // ── Pipeline: transcribe → analyze → review ──
  const processRecording = async (blob: Blob) => {
    setStep("transcribing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/scribe/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.transcript || data.transcript === "[silence]") {
        setError("No speech detected.");
        setStep("idle");
        return;
      }
      const newTranscript = transcript ? transcript + "\n" + data.transcript : data.transcript;
      setTranscript(newTranscript);
      speak("Transcript ready. Analyzing consultation.");
      await analyzeSOAP(newTranscript);
    } catch { setError("Transcription failed."); setStep("idle"); }
  };

  const analyzeSOAP = async (text: string) => {
    setStep("analyzing");
    try {
      const res = await fetch("/api/scribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.analysis) {
        setSoapData(data.analysis);
        setStep("review");
        setShowReview(true);
        const codes = data.analysis.icd10Codes.map((c: { code: string }) => c.code).join(", ");
        speak(`Analysis complete. ${data.analysis.icd10Codes.length} ICD-10 codes identified: ${codes}. Review before sending.`);
      } else { setError("Analysis failed."); setStep("idle"); }
    } catch { setError("Analysis failed."); setStep("idle"); }
  };

  const manualAnalyze = () => {
    if (transcript.length < 20) { setError("Need at least 20 characters."); return; }
    analyzeSOAP(transcript);
  };

  // ── Save consultation + sync ──
  const saveConsultation = async () => {
    if (!soapData) return;
    setStep("saving");
    try {
      const res = await fetch("/api/scribe/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient || null,
          transcript,
          soap: soapData.soap,
          icd10Codes: soapData.icd10Codes,
          redFlags: soapData.redFlags,
          chiefComplaint: soapData.chiefComplaint,
          medications: soapData.medications,
        }),
      });
      const result = await res.json();
      setSaveResult(result);
      setStep("done");
      speak("Consultation saved. Claim drafted. Ready for coding.");
    } catch { setError("Save failed."); setStep("review"); }
  };

  // ── Document generation ──
  const buildCodingDocument = (data: SOAPData): string => {
    return [
      "CLINICAL CONSULTATION — CODING DOCUMENT",
      "=".repeat(45),
      `Date: ${new Date().toLocaleDateString("en-ZA")}`,
      `Patient: ${PATIENTS.find(p => p.id === selectedPatient)?.name || "Unassigned"}`,
      `Generated by: Doctor OS AI Scribe`,
      "",
      `Chief Complaint: ${data.chiefComplaint}`,
      "",
      "DIAGNOSIS CODES (ICD-10 WHO)",
      "-".repeat(30),
      ...data.icd10Codes.map(c => `  ${c.code}  ${c.description}  [${c.confidence}%]`),
      "", "SUBJECTIVE", "-".repeat(30), data.soap.subjective || "—",
      "", "OBJECTIVE", "-".repeat(30), data.soap.objective || "—",
      "", "ASSESSMENT", "-".repeat(30), data.soap.assessment || "—",
      "", "PLAN", "-".repeat(30), data.soap.plan || "—",
      ...(data.medications.length > 0 ? ["", "MEDICATIONS", "-".repeat(30), ...data.medications.map(m => `  ${m.name} ${m.dosage} — ${m.frequency}`)] : []),
      ...(data.redFlags.length > 0 ? ["", "RED FLAGS", "-".repeat(30), ...data.redFlags.map(f => `  ! ${f}`)] : []),
      "", "=".repeat(45),
    ].join("\n");
  };

  const downloadDocument = () => {
    if (!soapData) return;
    const blob = new Blob([buildCodingDocument(soapData)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `consultation-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  const sendToVisioCode = () => {
    if (!soapData) return;
    downloadDocument();
    const codes = soapData.icd10Codes.map(c => c.code).join(", ");
    const prompt = `Consultation from Doctor OS:\n\nChief Complaint: ${soapData.chiefComplaint}\nICD-10 Codes: ${codes}\n\nAssessment: ${soapData.soap.assessment}\nPlan: ${soapData.soap.plan}\n\nValidate these codes, check scheme compatibility, suggest corrections.`;
    window.open(`https://visiocode.vercel.app/chat?prompt=${encodeURIComponent(prompt)}`, "_blank");
  };

  const resetScribe = () => {
    setStep("idle"); setTranscript(""); setSoapData(null);
    setShowReview(false); setSaveResult(null); setError("");
  };

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">AI Scribe</h1>
          <p className="text-[11px] text-muted-foreground">
            {step === "idle" && "Select patient, then record consultation."}
            {step === "recording" && "Recording... speak naturally. Click stop when done."}
            {step === "transcribing" && "Gemini 2.5 Flash transcribing audio..."}
            {step === "analyzing" && "Generating SOAP notes + ICD-10 codes..."}
            {step === "review" && "Review complete. Save or send for coding."}
            {step === "saving" && "Saving to database + drafting claim..."}
            {step === "done" && "Consultation saved. Claim drafted."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded-md ring-1 ring-border transition ${voiceEnabled ? "text-foreground bg-accent" : "text-muted-foreground"}`}
            title={voiceEnabled ? "Voice feedback ON" : "Voice feedback OFF"}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          {/* Steps */}
          <div className="hidden sm:flex items-center gap-1">
            <Dot label="Record" active={step === "recording"} done={["transcribing","analyzing","review","saving","done"].includes(step)} />
            <div className="w-3 h-px bg-border" />
            <Dot label="Transcribe" active={step === "transcribing"} done={["analyzing","review","saving","done"].includes(step)} />
            <div className="w-3 h-px bg-border" />
            <Dot label="SOAP" active={step === "analyzing"} done={["review","saving","done"].includes(step)} />
            <div className="w-3 h-px bg-border" />
            <Dot label="Save" active={step === "saving"} done={step === "done"} />
            <div className="w-3 h-px bg-border" />
            <Dot label="Code" active={step === "done"} done={false} />
          </div>
        </div>
      </div>

      {/* Patient selector + error */}
      <div className="flex items-center gap-3 mb-3">
        <UserCircle className="w-4 h-4 text-muted-foreground shrink-0" />
        <select
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
          className="flex-1 max-w-xs bg-card ring-1 ring-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select patient (optional)</option>
          {PATIENTS.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.condition}</option>
          ))}
        </select>
        {step === "done" && (
          <button onClick={resetScribe} className="text-[12px] text-muted-foreground hover:text-foreground transition">
            New consultation
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-rejected)]/10 text-[var(--color-rejected)] text-[12px] mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Main panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* LEFT: Transcript */}
        <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] font-medium">Transcript</span>
            </div>
            {step === "recording" && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-rejected)] animate-pulse" />
                <span className="text-[12px] font-mono text-[var(--color-rejected)]">{fmt(recordingTime)}</span>
              </div>
            )}
            {(step === "transcribing" || step === "analyzing") && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{step === "transcribing" ? "Gemini..." : "Claude..."}</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {transcript ? (
              <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed">{transcript}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mic className="w-12 h-12 text-muted-foreground/15 mb-3" />
                <p className="text-[13px] text-muted-foreground">Press record to start consultation.</p>
                <p className="text-[11px] text-muted-foreground mt-1">Or type/paste below for demo.</p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={step === "recording" ? stopRecording : startRecording}
                disabled={["transcribing", "analyzing", "saving"].includes(step)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ring-2 disabled:opacity-30 shrink-0 ${
                  step === "recording"
                    ? "ring-[var(--color-rejected)] bg-[var(--color-rejected)]/10 text-[var(--color-rejected)] animate-pulse"
                    : "ring-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {step === "recording" ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                placeholder="Type transcript here, press Enter..."
                className="flex-1 ring-1 ring-border rounded-md px-3 py-2 text-[13px] bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={["recording", "transcribing", "analyzing", "saving"].includes(step)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    setTranscript(prev => prev + (prev ? "\n" : "") + e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              {transcript && !soapData && !["recording","transcribing","analyzing"].includes(step) && (
                <button onClick={manualAnalyze} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" /> Analyze
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: SOAP + Actions */}
        <div className="rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[13px] font-medium">SOAP Notes</span>
            {soapData && <CheckCircle className="w-3 h-3 text-[var(--color-valid)] ml-auto" />}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {soapData ? (
              <>
                <div className="rounded-md bg-accent px-3 py-2">
                  <span className="text-[10px] text-muted-foreground uppercase">Chief Complaint</span>
                  <p className="text-[13px] font-medium">{soapData.chiefComplaint}</p>
                </div>

                {(["subjective", "objective", "assessment", "plan"] as const).map(s => (
                  <div key={s}>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      {s.charAt(0).toUpperCase()} — {s}
                    </label>
                    <div className="mt-1 rounded-md ring-1 ring-border bg-background p-2.5 text-[12px] leading-relaxed min-h-[28px]">
                      {soapData.soap[s] || "—"}
                    </div>
                  </div>
                ))}

                {soapData.icd10Codes.length > 0 && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">ICD-10 Codes</label>
                    <div className="mt-1 space-y-1">
                      {soapData.icd10Codes.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md ring-1 ring-border bg-background px-2.5 py-1">
                          <span className="text-[12px] font-mono font-bold">{c.code}</span>
                          <span className="text-[11px] text-muted-foreground flex-1">{c.description}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{c.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {soapData.redFlags.length > 0 && (
                  <div>
                    <label className="text-[10px] text-[var(--color-rejected)] uppercase tracking-wider font-medium">Red Flags</label>
                    {soapData.redFlags.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-rejected)] mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                )}

                {soapData.medications.length > 0 && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Medications</label>
                    {soapData.medications.map((m, i) => (
                      <div key={i} className="text-[11px] font-mono mt-0.5">{m.name} {m.dosage} — {m.frequency}</div>
                    ))}
                  </div>
                )}

                {/* Save result / sync status */}
                {saveResult && (
                  <div className="rounded-md ring-1 ring-[var(--color-valid)]/30 bg-[var(--color-valid)]/5 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--color-valid)]" />
                      <span className="text-[12px] font-medium text-[var(--color-valid)]">Saved successfully</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <p className="font-mono">Consultation: {saveResult.consultationId?.slice(0, 12)}...</p>
                      {saveResult.claimId && <p className="font-mono">Claim drafted: {saveResult.claimId.slice(0, 12)}...</p>}
                    </div>
                    {saveResult.syncStatus && (
                      <div className="space-y-1 pt-1 border-t border-border">
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Integration Sync</p>
                        {Object.entries(saveResult.syncStatus).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-[11px]">
                            <Plug className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium capitalize">{key}</span>
                            <span className={`text-[10px] font-mono ${val.ready ? "text-[var(--color-warning)]" : "text-muted-foreground"}`}>
                              {val.ready ? "ready" : "offline"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-border space-y-2">
                  {step !== "done" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={saveConsultation}
                        disabled={step === "saving"}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] font-medium hover:bg-accent transition disabled:opacity-50"
                      >
                        {step === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save + Draft Claim
                      </button>
                      <button
                        onClick={() => setShowReview(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Review &amp; Code
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={sendToVisioCode}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Send to VisioCode for Clinical Coding
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground/15 mb-3" />
                <p className="text-[13px] text-muted-foreground">SOAP notes auto-generate after recording.</p>
                <p className="text-[11px] text-muted-foreground mt-1">Record → Transcribe → SOAP → Save → Code</p>
                <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> ElevenLabs voice</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Gemini 2.5 Flash</span>
                  <span className="flex items-center gap-1"><Plug className="w-3 h-3" /> CareOn ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ REVIEW MODAL ═══ */}
      {showReview && soapData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-lg ring-1 ring-border bg-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Review Coding Document</h2>
                <p className="text-[11px] text-muted-foreground">Verify before sending to VisioCode for clinical coding validation.</p>
              </div>
              <button onClick={() => setShowReview(false)} className="p-1 rounded hover:bg-accent transition"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground">{buildCodingDocument(soapData)}</pre>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center gap-3">
              <button onClick={downloadDocument} className="flex items-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] hover:bg-accent transition">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={() => setShowReview(false)} className="flex items-center gap-1.5 px-3 py-2 rounded-md ring-1 ring-border text-[12px] text-muted-foreground hover:bg-accent transition">
                Edit SOAP
              </button>
              <div className="flex-1" />
              <button
                onClick={() => { setShowReview(false); sendToVisioCode(); }}
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

function Dot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full transition-colors ${done ? "bg-[var(--color-valid)]" : active ? "bg-foreground animate-pulse" : "bg-border"}`} />
      <span className={`text-[10px] ${active ? "text-foreground font-medium" : done ? "text-[var(--color-valid)]" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}
