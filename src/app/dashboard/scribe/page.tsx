"use client";

import { Mic, MicOff, FileText } from "lucide-react";
import { useState } from "react";

export default function ScribePage() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      <h1 className="text-xl font-semibold mb-6">AI Scribe</h1>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Transcript */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#3DA9D1]" />
            <span className="text-sm font-medium">Transcript</span>
          </div>
          <div className="flex-1 p-4">
            <p className="text-white/20 text-sm">Press the microphone to start recording the consultation.</p>
          </div>
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-center">
            <button
              onClick={() => setRecording(!recording)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                recording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-[#3DA9D1] hover:bg-[#3DA9D1]/80"
              }`}
            >
              {recording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Right: SOAP Notes */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-sm font-medium">SOAP Notes</span>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {["Subjective", "Objective", "Assessment", "Plan"].map(section => (
              <div key={section}>
                <label className="text-xs text-white/40 uppercase tracking-wider">{section}</label>
                <div className="mt-1 rounded-lg bg-white/5 border border-white/5 p-3 min-h-[60px] text-sm text-white/30">
                  Generated after recording...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
