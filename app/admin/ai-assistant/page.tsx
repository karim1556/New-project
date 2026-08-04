"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type ChatMessage = {
  sender: "user" | "groq";
  text: string;
  timestamp: string;
};

export default function AdminAIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "groq",
      text: "👋 **Hello Admin!** I am your **Groq AI Copilot**. I analyze live data across attendance, daily team logs, checkpoint submissions, projects, and 2026 club registrations.\n\nChoose a quick preset below or ask me any question about your club operational status!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [apiKeyOverride, setApiKeyOverride] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (queryText?: string, preset?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend && !preset) return;

    const userMsgText = preset
      ? `[Preset Query: ${preset.toUpperCase().replace("_", " ")}] ${textToSend || ""}`.trim()
      : textToSend;

    const userMsg: ChatMessage = {
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!preset) setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          presetAction: preset,
          apiKey: apiKeyOverride || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Groq API error occurred");
      }

      const groqMsg: ChatMessage = {
        sender: "groq",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, groqMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "groq",
          text: `⚠️ **Error**: ${err.message || "Failed to process query."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Report copied to clipboard!");
  };

  return (
    <div className="content-area" style={{ gap: "1rem" }}>
      {/* Header Panel */}
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="badge" style={{ marginBottom: "0.4rem" }}>⚡ Powered by Groq LLaMA 3.3 70B</span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Admin AI Insights & Copilot</h2>
          <p className="muted" style={{ fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Instant intelligence on attendance, daily log activity, checkpoints, and automated report generation.
          </p>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => setShowKeyInput(!showKeyInput)}
          style={{ fontSize: "0.84rem", padding: "0.45rem 0.85rem" }}
        >
          🔑 {apiKeyOverride ? "Groq Key Set" : "Configure Groq API Key"}
        </button>
      </div>

      {/* API Key Modal / Banner */}
      {showKeyInput && (
        <div className="panel" style={{ background: "#eef2ff", borderColor: "#c7d2fe" }}>
          <h3 style={{ fontSize: "0.95rem", color: "#4f46e5", marginBottom: "0.35rem" }}>
            Groq API Key Override (Optional)
          </h3>
          <p className="muted" style={{ fontSize: "0.84rem", marginBottom: "0.65rem" }}>
            If <code>GROQ_API_KEY</code> is set in <code>.env.local</code>, leave this blank. Otherwise enter your Groq key below:
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="password"
              placeholder="gsk_..."
              value={apiKeyOverride}
              onChange={(e) => setApiKeyOverride(e.target.value)}
              style={{ maxWidth: "420px" }}
            />
            <button
              type="button"
              onClick={() => setShowKeyInput(false)}
              style={{ padding: "0.5rem 1rem" }}
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Preset Toolbar */}
      <div className="panel">
        <p className="muted" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.6rem", fontWeight: 700 }}>
          Quick Action Presets
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
          <button
            type="button"
            className="secondary"
            disabled={isLoading}
            onClick={() => handleQuery("", "attendance")}
            style={{ fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            📊 Attendance Insights
          </button>
          <button
            type="button"
            className="secondary"
            disabled={isLoading}
            onClick={() => handleQuery("", "daily_logs")}
            style={{ fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            📝 Log Activity Check (Who updated / missed)
          </button>
          <button
            type="button"
            className="secondary"
            disabled={isLoading}
            onClick={() => handleQuery("", "checkpoints")}
            style={{ fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            🚩 Checkpoint Status Audit
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuery("", "report")}
            style={{ fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            📄 Generate Executive Progress Report
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="panel" style={{ minHeight: "380px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", maxHeight: "550px" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: msg.sender === "user" ? "80%" : "95%",
                background: msg.sender === "user" ? "linear-gradient(130deg, #4f46e5, #0284c7)" : "#ffffff",
                color: msg.sender === "user" ? "#ffffff" : "#0f172a",
                border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "0.9rem 1.1rem",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", gap: "1rem" }}>
                <strong style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                  {msg.sender === "user" ? "Admin" : "⚡ Groq AI Assistant"}
                </strong>
                <span style={{ fontSize: "0.72rem", opacity: 0.65 }}>{msg.timestamp}</span>
              </div>
              <div style={{ fontSize: "0.93rem", lineHeight: "1.6" }}>
                {msg.sender === "user" ? msg.text : <MarkdownRenderer content={msg.text} />}
              </div>
              {msg.sender === "groq" && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => copyToClipboard(msg.text)}
                    style={{ fontSize: "0.74rem", padding: "0.25rem 0.6rem" }}
                  >
                    📋 Copy Text
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ alignSelf: "flex-start", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.8rem 1.1rem", borderRadius: "14px" }}>
              <span className="muted" style={{ fontSize: "0.88rem" }}>⚡ Groq AI is analyzing live database context...</span>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
          style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}
        >
          <input
            type="text"
            placeholder="Ask anything (e.g., 'Who is absent today?', 'List all Python coders in SE', 'Summary of team logs')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={isLoading || !inputQuery.trim()}>
            {isLoading ? "Thinking..." : "Ask Groq"}
          </button>
        </form>
      </div>
    </div>
  );
}
