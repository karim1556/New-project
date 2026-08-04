"use client";

import { useState, CSSProperties } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

const containerStyle: CSSProperties = {
  position: "fixed",
  bottom: "1.5rem",
  right: "1.5rem",
  zIndex: 9999
};

const modalStyle: CSSProperties = {
  width: "360px",
  maxHeight: "500px",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "20px",
  boxShadow: "0 12px 36px rgba(15, 23, 42, 0.15)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  marginBottom: "0.75rem"
};

const headerStyle: CSSProperties = {
  padding: "0.9rem 1.1rem",
  background: "linear-gradient(130deg, #4f46e5, #0284c7)",
  color: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const bodyStyle: CSSProperties = {
  padding: "1rem",
  flex: 1,
  overflowY: "auto",
  fontSize: "0.88rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const formStyle: CSSProperties = {
  padding: "0.75rem",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  gap: "0.4rem",
  background: "#ffffff"
};

const toggleBtnStyle: CSSProperties = {
  width: "54px",
  height: "54px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.4rem",
  boxShadow: "0 8px 24px rgba(79, 70, 229, 0.35)",
  background: "linear-gradient(135deg, #4f46e5, #0284c7)",
  color: "#ffffff"
};

export function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (preset?: string) => {
    const promptToSend = preset ? "" : query;
    if (!promptToSend && !preset) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/admin/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          presetAction: preset
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");
      setResponse(data.answer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResponse(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {isOpen ? (
        <div style={modalStyle}>
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <span>⚡</span>
              <strong>Groq AI Copilot</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>

          <div style={bodyStyle}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary"
                disabled={isLoading}
                onClick={() => handleAsk("attendance")}
                style={{ fontSize: "0.74rem", padding: "0.3rem 0.6rem" }}
              >
                Attendance
              </button>
              <button
                type="button"
                className="secondary"
                disabled={isLoading}
                onClick={() => handleAsk("daily_logs")}
                style={{ fontSize: "0.74rem", padding: "0.3rem 0.6rem" }}
              >
                Log Activity
              </button>
              <button
                type="button"
                className="secondary"
                disabled={isLoading}
                onClick={() => handleAsk("checkpoints")}
                style={{ fontSize: "0.74rem", padding: "0.3rem 0.6rem" }}
              >
                Checkpoints
              </button>
              <button
                type="button"
                className="secondary"
                disabled={isLoading}
                onClick={() => handleAsk("report")}
                style={{ fontSize: "0.74rem", padding: "0.3rem 0.6rem" }}
              >
                Report
              </button>
            </div>

            {isLoading ? (
              <div style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.85rem" }}>
                Groq is generating answer...
              </div>
            ) : null}

            {response ? (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "0.8rem",
                  maxHeight: "260px",
                  overflowY: "auto",
                  lineHeight: "1.5"
                }}
              >
                <MarkdownRenderer content={response} />
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            style={formStyle}
          >
            <input
              type="text"
              placeholder="Ask Groq..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              style={{ fontSize: "0.84rem", padding: "0.45rem 0.65rem" }}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.8rem" }}
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button type="button" onClick={() => setIsOpen(!isOpen)} style={toggleBtnStyle}>
        ⚡
      </button>
    </div>
  );
}
