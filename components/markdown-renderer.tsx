"use client";

import React from "react";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split lines and process markdown elements
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const renderFormattedText = (text: string): React.ReactNode => {
    // Process bold, inline code, and links
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              background: "#f1f5f9",
              color: "#4f46e5",
              padding: "0.15rem 0.35rem",
              borderRadius: "5px",
              fontFamily: "monospace",
              fontSize: "0.85em"
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("[") && part.includes("](")) {
        const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0284c7", textDecoration: "underline", fontWeight: 600 }}
            >
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  const flushTable = (keyPrefix: number) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

    elements.push(
      <div className="table-wrap" key={`table-${keyPrefix}`} style={{ margin: "0.8rem 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.88rem" }}>
          <thead>
            <tr>
              {headerRow.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    background: "#f1f5f9",
                    color: "#0f172a",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #cbd5e1",
                    fontWeight: 700
                  }}
                >
                  {renderFormattedText(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                {row.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #e2e8f0",
                      color: "#334155"
                    }}
                  >
                    {renderFormattedText(col.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code Block Toggle
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              padding: "0.85rem 1rem",
              borderRadius: "10px",
              overflowX: "auto",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              margin: "0.6rem 0"
            }}
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inTable) flushTable(idx);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Table Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cols = trimmed.slice(1, -1).split("|");
      tableRows.push(cols);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={idx} style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 0.5rem 0" }}>
          {renderFormattedText(trimmed.slice(2))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={idx} style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0.9rem 0 0.4rem 0" }}>
          {renderFormattedText(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={idx} style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", margin: "0.75rem 0 0.35rem 0" }}>
          {renderFormattedText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={idx}
          style={{
            borderLeft: "4px solid #4f46e5",
            paddingLeft: "0.85rem",
            color: "#475569",
            background: "#eef2ff",
            padding: "0.5rem 0.85rem",
            borderRadius: "0 8px 8px 0",
            margin: "0.5rem 0"
          }}
        >
          {renderFormattedText(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Unordered List Items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={idx} style={{ marginLeft: "1.2rem", marginBottom: "0.3rem", color: "#334155" }}>
          {renderFormattedText(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Ordered List Items
    const matchOrdered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (matchOrdered) {
      elements.push(
        <div key={idx} style={{ marginLeft: "0.8rem", marginBottom: "0.3rem", color: "#334155" }}>
          <strong style={{ color: "#4f46e5", marginRight: "0.3rem" }}>{matchOrdered[1]}.</strong>
          {renderFormattedText(matchOrdered[2])}
        </div>
      );
      return;
    }

    // Empty Lines
    if (!trimmed) {
      elements.push(<div key={idx} style={{ height: "0.4rem" }} />);
      return;
    }

    // Normal Paragraph
    elements.push(
      <p key={idx} style={{ margin: "0.3rem 0", color: "#334155", lineHeight: "1.6" }}>
        {renderFormattedText(trimmed)}
      </p>
    );
  });

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className="markdown-body">{elements}</div>;
}
