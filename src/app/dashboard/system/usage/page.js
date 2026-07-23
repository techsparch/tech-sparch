"use client";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "/api/system/cloud-uses";
const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.02) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-black text-[11px] font-semibold"
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
    <div className="bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <p className="m-0 font-semibold text-slate-800">{name}</p>
      <p className="mt-1 text-slate-500">{value.toFixed(2)} GB</p>
      <p className="mt-0.5 text-[12px] text-slate-400">{pct}% of total</p>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl py-4 px-5 flex flex-col gap-1">
      <span className="text-[12px] text-slate-400 font-medium uppercase tracking-[0.06em]">
        {label}
      </span>
      <span
        className="text-2xl font-bold leading-[1.2]"
        style={{ color: accent || "#1e293b" }}
      >
        {value}
      </span>
      {sub && <span className="text-[12px] text-slate-400">{sub}</span>}
    </div>
  );
}

function PieCard({ title, sub, data, total }) {
  const enriched = data.map((d) => ({ ...d, total }));
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h3 className="m-0 text-[15px] font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-1 text-[13px] text-slate-400">{sub}</p>
      </div>

      <div className="h-[220px]">
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

      <div className="flex flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                style={{
                  background: entry.fill,
                  border:
                    entry.fill === "#e2e8f0" ? "1px solid #cbd5e1" : "none",
                }}
              />
              <span className="text-[13px] text-slate-500">{entry.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-semibold text-slate-800">
                {entry.amount.toFixed(2)} GB
              </span>
              <span className="text-[12px] text-slate-400 ml-1.5">
                ({((entry.amount / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-lg py-2.5 px-3.5 flex items-center justify-between">
        <span className="text-[12px] text-slate-400">Total limit</span>
        <span className="text-[13px] font-semibold text-slate-600">
          {total} GB
        </span>
      </div>
    </div>
  );
}

function Skeleton({ width = "100%", height = 20, radius = 6 }) {
  return (
    <div
      className="bg-slate-200 animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[22px]">
        ⚠️
      </div>
      <p className="m-0 font-semibold text-slate-800 text-[15px]">
        Failed to load data
      </p>
      <p className="m-0 text-slate-400 text-[13px] max-w-[320px]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-1 py-2 px-5 rounded-lg border border-slate-200 bg-white text-slate-800 text-[13px] font-medium cursor-pointer hover:bg-slate-50 transition-colors"
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
    <div className="min-h-screen bg-light font-sans py-8 px-6">
      <div className="max-w-[820px] mx-auto">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="m-0 text-[22px] font-bold text-dark">Live usage </h1>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-[13px] font-medium transition-colors ${
              loading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-slate-50"
            }`}
          >
            <span className={`inline-block ${loading ? "animate-spin" : ""}`}>
              ↻
            </span>
            Refresh
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-6">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-xl py-4 px-5 flex flex-col gap-2.5"
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

            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
              {loading ? (
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-4"
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
                    sub={`${storageUsed} GB used · ${(
                      storageTotal - storageUsed
                    ).toFixed(2)} GB free`}
                    data={data.storageChartData.map((d) => ({
                      ...d,
                      fill: d.name === "Used" ? "#2a78d6" : "#e2e8f0",
                    }))}
                    total={storageTotal}
                  />
                  <PieCard
                    title="Bandwidth"
                    sub={`${bwUsed} GB used · ${(bwTotal - bwUsed).toFixed(
                      2,
                    )} GB remaining`}
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
