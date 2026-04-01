"use client";

import { AgentChat } from "@/components/agent/AgentChat";

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <h1 className="text-sm font-medium">Doctor OS Agent</h1>
        <span className="text-xs text-white/30">38 tools available</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <AgentChat />
      </div>
    </div>
  );
}
