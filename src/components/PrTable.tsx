"use client";

import { useEffect, useMemo, useState } from "react";
import type { PullRow } from "../lib/types";
import Link from "next/link";

type ApiResponse = {
  generatedAt: string;
  rows: PullRow[];
  errors: string[];
};

const formatAge = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const PrTable = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch(`/api/prs?t=${Date.now()}`, { 
      cache: "no-store" 
    });
    const json = (await res.json()) as ApiResponse;
    setData(json);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    const base = data?.rows ?? [];
    const ql = q.trim().toLowerCase();

    let filtered = base;
    if (ql) {
      filtered = base.filter((r) =>
        r.repo.toLowerCase().includes(ql) ||
        r.title.toLowerCase().includes(ql) ||
        r.author.toLowerCase().includes(ql) ||
        String(r.number).includes(ql)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      return -(a.ageSeconds - b.ageSeconds); // oldest first
    });

    return sorted;
  }, [data, q]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ..."
          style={{
            width: 380,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd"
          }}
        />

        <button
          onClick={() => load()}
          style={refreshButtonStyle}
        >
          Refresh
        </button>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {data ? `Updated: ${new Date(data.generatedAt).toLocaleString()}` : "Loading…"}
        </div>
      </div>

      {/* Show errors if any */}
      {data?.errors?.length ? (
        <div style={{ marginBottom: 12, padding: 12, border: "1px solid #f2c", borderRadius: 12 }}>
          <strong>Some repos failed:</strong>
          <ul>
            {data.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
            {data.errors.length > 5 ? <li>…and {data.errors.length - 5} more</li> : null}
          </ul>
        </div>
      ) : null}

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 16, background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>Repo</th>
              <th style={th}>PR</th>
              <th style={th}>Title</th>
              <th style={th}>Author</th>
              <th style={th}>Updated</th>
              <th style={th}>Age</th>
              <th style={th}>Approvals</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={`${r.repo}#${r.number}`} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={tdMono}>
                    <Link href={`https://github.com/${r.repo}`} target="_blank" rel="noreferrer" style={linkStyle}>
                        {r.repo}
                    </Link>
                </td>
                <td style={td}>
                  <Link href={r.url} target="_blank" rel="noreferrer" style={linkStyle}>
                    #{r.number}
                  </Link>
                </td>
                <td 
                  style={{
                    ...tdTitle,
                    color: r.isDraft ? "#9ca3af" : "#111",
                    fontStyle: r.isDraft ? "italic" : "normal"
                  }} 
                  title={r.title}>
                  {r.title}
                </td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.authorAvatarUrl ? (
                    <img
                      src={r.authorAvatarUrl}
                      alt={r.author}
                      width={24}
                      height={24}
                      style={{
                        borderRadius: "50%",
                        border: "1px solid #e5e7eb"
                      }}
                      loading="lazy"
                    />
                  ) : null}
                  <span>{r.author}</span>
                </div>
                </td>
                <td style={tdSmall}>{new Date(r.updatedAt).toLocaleString()}</td>
                <td style={td}>
                  <span style={{
                    ...pill,
                    background: r.slaBreached ? "#fee2e2" : "#e0e7ff",
                    color: r.slaBreached ? "#991b1b" : "#3730a3" 
                  }}>
                    {formatAge(r.ageSeconds)}
                  </span>
                </td>
                <td style={td}>
                  <span
                    style={{
                      ...pill,
                      background: r.reviewerCount < r.minReviews ? "#fee2e2" : "#dbead8",
                      color: r.reviewerCount < r.minReviews ? "#991b1b" : "#317226"
                    }}
                    title={`Reviews: ${r.reviewerCount} / required: ${r.minReviews}`}
                  >
                    {r.reviewerCount}/{r.minReviews}
                  </span>
                </td>
              </tr>
            ))}

            {!rows.length ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#666" }}>
                  No PRs found (or you don't have access).
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrTable;

const th: React.CSSProperties = { textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#444", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: "#111", verticalAlign: "top" };
const tdSmall: React.CSSProperties = { padding: "12px 14px", fontSize: 12, color: "#666", whiteSpace: "nowrap", verticalAlign: "top" };
const tdMono: React.CSSProperties = { ...tdSmall, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" };
const tdTitle: React.CSSProperties = { ...td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const pill: React.CSSProperties = { padding: "4px 8px", borderRadius: 10, background: "#f3f4f6", fontFamily: "ui-monospace, monospace", fontSize: 12 };
const linkStyle: React.CSSProperties = { color: "#111", textDecoration: "underline" };
const refreshButtonStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };