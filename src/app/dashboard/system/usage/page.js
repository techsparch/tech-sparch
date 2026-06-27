"use client";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "/api/system/cloud-uses";

const RADIAN = Math.PI / 180;

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
}) {
  if (percent < 0.02) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total = payload[0].payload.total;
  const pct = ((value / total) * 100).toFixed(2);
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>{name}</p>
      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
        {value.toFixed(2)} GB
      </p>
      <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 12 }}>
        {pct}% of total
      </p>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #f1f5f9",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: accent || "#1e293b",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      {sub && <span style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</span>}
    </div>
  );
}

function PieCard({ title, sub, data, total, accentColor }) {
  const enriched = data.map((d) => ({ ...d, total }));
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #f1f5f9",
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <h3
          style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}
        >
          {title}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          {sub}
        </p>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="amount"
              paddingAngle={2}
              labelLine={false}
              label={<CustomLabel />}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {enriched.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.55
                  }
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((entry, i) => (
          <div
            key={entry.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: entry.fill,
                  border:
                    entry.fill === "#e2e8f0" ? "1px solid #cbd5e1" : "none",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#64748b" }}>
                {entry.name}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                {entry.amount.toFixed(2)} GB
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 6 }}>
                ({((entry.amount / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#f8fafc",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Total limit</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          {total} GB
        </span>
      </div>
    </div>
  );
}

function Skeleton({ width = "100%", height = 20, radius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        ⚠️
      </div>
      <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: 15 }}>
        Failed to load data
      </p>
      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, maxWidth: 320 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 4,
          padding: "8px 20px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          background: "white",
          color: "#1e293b",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

export default function StorageDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const storageTotal = data
    ? data.storageChartData.reduce((s, d) => s + d.amount, 0)
    : 0;
  const storageUsed = data
    ? data.storageChartData.find((d) => d.name === "Used")?.amount || 0
    : 0;
  const bwTotal = data ? data.bandwidthChartData[0].limit : 0;
  const bwUsed = data ? data.bandwidthChartData[0].used : 0;
  const storageUsedPct = storageTotal
    ? ((storageUsed / storageTotal) * 100).toFixed(2)
    : "0";
  const bwUsedPct = bwTotal ? ((bwUsed / bwTotal) * 100).toFixed(2) : "0";

  const bandwidthChartData = data
    ? [
        { name: "Used", amount: bwUsed, fill: "#1baf7a" },
        {
          name: "Available",
          amount: parseFloat((bwTotal - bwUsed).toFixed(2)),
          fill: "#e2e8f0",
        },
      ]
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 24px",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Storage Dashboard
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#94a3b8" }}>
              Live usage {" "}
              <code
                style={{
                  fontSize: 12,
                  background: "#f1f5f9",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "#475569",
                }}
              >
             
              </code>
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#475569",
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            >
              ↻
            </span>
            Refresh
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      border: "1px solid #f1f5f9",
                      borderRadius: 12,
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="80%" height={24} />
                    <Skeleton width="50%" height={10} />
                  </div>
                ))
              ) : (
                <>
                  <MetricCard
                    label="Storage used"
                    value={`${storageUsed} GB`}
                    sub={`${storageUsedPct}% of ${storageTotal} GB`}
                    accent="#2a78d6"
                  />
                  <MetricCard
                    label="Bandwidth used"
                    value={`${bwUsed} GB`}
                    sub={`${bwUsedPct}% of ${bwTotal} GB`}
                    accent="#1baf7a"
                  />
                  <MetricCard
                    label="Objects"
                    value={data.rawTotals.objects}
                    sub="total stored"
                    accent="#f59e0b"
                  />
                  <MetricCard
                    label="Credits"
                    value={data.rawTotals.storage_credits}
                    sub="storage credits"
                    accent="#8b5cf6"
                  />
                </>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {loading ? (
                [1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      border: "1px solid #f1f5f9",
                      borderRadius: 16,
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="100%" height={220} radius={12} />
                    <Skeleton width="70%" height={12} />
                    <Skeleton width="55%" height={12} />
                  </div>
                ))
              ) : (
                <>
                  <PieCard
                    title="Storage"
                    sub={`${storageUsed} GB used · ${(storageTotal - storageUsed).toFixed(2)} GB free`}
                    data={data.storageChartData.map((d) => ({
                      ...d,
                      fill: d.name === "Used" ? "#2a78d6" : "#e2e8f0",
                    }))}
                    total={storageTotal}
                  />
                  <PieCard
                    title="Bandwidth"
                    sub={`${bwUsed} GB used · ${(bwTotal - bwUsed).toFixed(2)} GB remaining`}
                    data={bandwidthChartData}
                    total={bwTotal}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
