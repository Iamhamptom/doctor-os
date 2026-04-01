"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader2, Bot, User, Wrench } from "lucide-react";

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function AgentChat() {
  const { messages, sendMessage, status } = useChat({ transport });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#3DA9D1]/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#3DA9D1]" />
            </div>
            <h2 className="text-lg font-medium mb-1">Doctor OS Agent</h2>
            <p className="text-sm text-white/40 max-w-md">
              I can help with your entire clinical workflow. Try:
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Good morning — give me my briefing",
                "Check drug interactions for amlodipine and simvastatin",
                "Write a prescription for Panado 500mg",
                "Look up ICD-10 code for type 2 diabetes",
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-[#3DA9D1]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-[#3DA9D1]" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              message.role === "user"
                ? "bg-[#3DA9D1] text-white"
                : "bg-white/[0.04] border border-white/5"
            }`}>
              {message.parts?.map((part, i) => {
                if (part.type === "text") {
                  return <MessageText key={i} text={part.text} />;
                }
                if (part.type.startsWith("tool-")) {
                  const toolPart = part as { type: string; toolName?: string; state?: string };
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/30 py-1">
                      <Wrench className="w-3 h-3" />
                      <span>{toolPart.toolName || part.type.replace("tool-", "")}</span>
                      {toolPart.state === "result" && <span className="text-[#10B981]">done</span>}
                    </div>
                  );
                }
                return null;
              }) ?? <MessageText text="" />}
            </div>
            {message.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white/60" />
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#3DA9D1]/15 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[#3DA9D1] animate-spin" />
            </div>
            <div className="bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 px-4 py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-white/40 hover:text-white/60"
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything — prescribe, code, check interactions, export..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/50"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="w-10 h-10 rounded-lg bg-[#3DA9D1] flex items-center justify-center hover:bg-[#3DA9D1]/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageText({ text }: { text: string }) {
  if (!text) return null;

  // Simple markdown-like rendering: **bold**, newlines, and severity badges
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}
