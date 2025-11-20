// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AuraMatch — Admin Dashboard (stable)
 * - ไม่มี lib เสริม (ใช้ Tailwind + SVG)
 * - มี state: loading / error / data
 * - มี Logout: ล้าง localStorage แล้วไป /login
 * - ปลอดภัยระดับฟรอนต์: ถ้าไม่ใช่แอดมิน redirect -> /login
 * - โครงสร้างชัด: Header / KPIs / Charts / Tables / Sidepanels
 * - พร้อมต่อ Firestore/Backend (เปลี่ยน fetchStats() ได้เลย)
 */

const fmt = (n) => new Intl.NumberFormat("en-US").format(n);
const join = (...c) => c.filter(Boolean).join(" ");

export default function AdminDashboard() {
  const nav = useNavigate();

  // ── Gate: only admins ───────────────────────────────────────────────────────
  useEffect(() => {
    const isAdmin = localStorage.getItem("auramatch:isAdmin") === "true";
    if (!isAdmin) nav("/login", { replace: true });
  }, [nav]);

  useEffect(() => {
    document.title = "Admin Dashboard • AuraMatch";
  }, []);

  // ── Data states ─────────────────────────────────────────────────────────────
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");

  // Simulate API: เปลี่ยนเป็น Firestore/Backend จริงได้ทันที
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const stats = await fetchStats(range);
        if (!cancelled) setData(stats);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [range]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const onLogout = () => {
    try {
      localStorage.removeItem("auramatch:isLoggedIn");
      localStorage.removeItem("auramatch:isAdmin");
      localStorage.removeItem("auramatch:user");
    } finally {
      nav("/login", { replace: true });
    }
  };

  if (loading) return <LoadingSkeleton range={range} onRange={setRange} onLogout={onLogout} />;
  if (err) return <ErrorState message={err} onRetry={() => setRange((r) => r)} onLogout={onLogout} />;

  const stats = data;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#FADCDC] via-white to-[#E6DCEB]">
      <div className="px-6 sm:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#75464A] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-[#75464A]/70">AuraMatch • Overview &amp; Management</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-[#d9c4cf] bg-white/70 backdrop-blur px-3 py-2 text-sm shadow-sm focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>

            {/* User chip */}
            <UserChip />

            {/* Logout */}
            <button
              onClick={onLogout}
              className="rounded-xl bg-[#5a3940] text-white px-4 py-2 text-sm shadow hover:opacity-90 active:opacity-80 transition"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.kpis.map((k) => (
            <KpiCard key={k.key} {...k} />
          ))}
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: charts & table */}
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Signups & Logins">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TinyArea title="New Signups" series={stats.signups} accent="#D85E79" />
                <TinyArea title="Logins" series={stats.logins} accent="#75464A" />
              </div>
            </Panel>

            <Panel title={`Top Products (Last ${humanRange(range)})`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#75464A]/70">
                    <th className="py-2">#</th>
                    <th className="py-2">Product</th>
                    <th className="py-2">Clicks</th>
                    <th className="py-2">Add-to-Fav</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p, i) => (
                    <tr key={p.id} className="border-t border-[#ecdde3]">
                      <td className="py-3 pr-2 w-8">{i + 1}</td>
                      <td className="py-3 pr-2">
                        <div className="font-medium text-[#5a3940]">{p.name}</div>
                        <div className="text-xs text-[#75464A]/60">{p.brand}</div>
                      </td>
                      <td className="py-3 pr-2">
                        <Bar value={p.clicks} max={stats.maxClicks} />
                      </td>
                      <td className="py-3 pr-2">
                        <Bar value={p.favs} max={stats.maxFavs} tint="#D85E79" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Right: actions & lists */}
          <div className="space-y-6">
            <Panel title="Quick Actions">
              <div className="grid grid-cols-2 gap-3">
                <Btn onClick={() => nav("/admin/coupons")}>Create Coupon</Btn>
                <Btn onClick={() => nav("/admin/products")}>Manage Products</Btn>
                <Btn onClick={() => nav("/admin/users")}>Manage Users</Btn>
                <Btn onClick={() => exportCSV(stats)}>Export CSV</Btn>
              </div>
            </Panel>

            <Panel title="Login Providers">
              <div className="space-y-3">
                {stats.providers.map((p) => (
                  <div key={p.key} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-[#75464A]/70">{p.label}</span>
                    <div className="flex-1">
                      <Bar value={p.count} max={stats.maxProvider} tint={p.tint} label={`${fmt(p.count)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Recent Users">
              <div className="mb-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search user/email…"
                  className="w-full rounded-xl border border-[#e5d4db] bg-white/70 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <ul className="divide-y divide-[#ecdde3]">
                {stats.recentUsers
                  .filter((u) => (u.email + u.name).toLowerCase().includes(q.toLowerCase()))
                  .slice(0, 8)
                  .map((u) => (
                    <li key={u.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-[#5a3940]">{u.name}</div>
                        <div className="text-xs text-[#75464A]/70">{u.email}</div>
                      </div>
                      <span className="text-xs rounded-full px-2 py-1 bg-white/70 border border-[#e8d9df] text-[#75464A]/80">
                        {u.provider}
                      </span>
                    </li>
                  ))}
              </ul>
            </Panel>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ───────────────────────── UI Components ───────────────────────── */
function Panel({ title, children }) {
  return (
    <section className="bg-white/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(117,70,74,0.08)] border border-[#ead8df]">
      <div className="px-5 pt-4 pb-2 border-b border-[#ecdde3]">
        <h3 className="font-semibold text-[#5a3940]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function KpiCard({ label, value, delta, up }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-[#ead8df] backdrop-blur shadow-sm p-4">
      <div className="text-sm text-[#75464A]/70">{label}</div>
      <div className="flex items-end justify-between mt-2">
        <div className="text-2xl font-bold text-[#5a3940]">{value}</div>
        <div className={join("text-xs px-2 py-1 rounded-full", up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
          {up ? "▲" : "▼"} {delta}
        </div>
      </div>
    </div>
  );
}

function TinyArea({ title, series, accent = "#75464A" }) {
  const max = Math.max(...series, 1);
  const d = toAreaPath(series, 180, 60, 6);
  return (
    <div className="rounded-xl border border-[#ead8df] bg-white/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#75464A]/80">{title}</div>
        <div className="text-xs text-[#75464A]/60">(Last {series.length}d)</div>
      </div>
      <svg viewBox="0 0 180 60" className="w-full h-[60px]">
        <path d={d} fill={accent + "22"} stroke={accent} strokeWidth="2" />
      </svg>
      <div className="text-[11px] text-[#75464A]/60">Max: {fmt(max)}</div>
    </div>
  );
}

function Bar({ value, max, tint = "#75464A", label }) {
  const pct = Math.max(2, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="w-full h-3 bg-[#f4eaee] rounded-full overflow-hidden relative">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: pct + "%", background: tint }}
        aria-valuenow={value}
        aria-valuemax={max}
      />
      {label && (
        <span className="absolute right-2 -top-5 text-[11px] text-[#75464A]/70">{label}</span>
      )}
    </div>
  );
}

function Btn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-[#FADCDC] hover:bg-[#f6c6cf] text-[#5a3940] text-sm px-3 py-2 border border-[#e9d1d8] shadow-sm transition"
    >
      {children}
    </button>
  );
}

function UserChip() {
  const userRaw = localStorage.getItem("auramatch:user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || "Admin";
  const email = user?.email || "";
  const initials = (name || "A").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2 bg-white/70 border border-[#ead8df] rounded-full pl-1 pr-3 py-1">
      <div className="w-7 h-7 rounded-full bg-[#75464A] text-white grid place-items-center text-xs font-semibold">
        {initials}
      </div>
      <div className="leading-tight">
        <div className="text-xs font-medium text-[#5a3940]">{name}</div>
        <div className="text-[10px] text-[#75464A]/70">{email}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── States ───────────────────────── */
function LoadingSkeleton({ range, onRange, onLogout }) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#FADCDC] via-white to-[#E6DCEB] animate-pulse">
      <div className="px-6 sm:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 w-48 bg-white/70 rounded-md mb-2" />
            <div className="h-3 w-56 bg-white/70 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => onRange(e.target.value)}
              className="rounded-xl border border-[#d9c4cf] bg-white/70 backdrop-blur px-3 py-2 text-sm shadow-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
            <div className="h-9 w-28 bg-white/70 rounded-xl" />
            <button onClick={onLogout} className="h-9 w-24 bg-[#5a3940]/80 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-white/70 rounded-2xl" />
            <div className="h-72 bg-white/70 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-white/70 rounded-2xl" />
            <div className="h-48 bg-white/70 rounded-2xl" />
            <div className="h-72 bg-white/70 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry, onLogout }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-br from-[#FADCDC] via-white to-[#E6DCEB]">
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-[#ead8df] p-8 text-center shadow">
        <h2 className="text-xl font-semibold text-[#5a3940] mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-[#75464A]/70 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="rounded-xl bg-[#FADCDC] px-4 py-2 border border-[#e9d1d8]">ลองใหม่</button>
          <button onClick={onLogout} className="rounded-xl bg-[#5a3940] text-white px-4 py-2">Logout</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Helpers & Data ───────────────────────── */
function humanRange(r) {
  return r === "7d" ? "7 days" : r === "30d" ? "30 days" : r === "90d" ? "90 days" : "YTD";
}

function toAreaPath(arr, w, h, pad = 0) {
  if (!arr.length) return "";
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const span = Math.max(max - min, 1);
  const step = (w - pad * 2) / (arr.length - 1);
  const points = arr.map((v, i) => [pad + i * step, h - pad - ((v - min) / span) * (h - pad * 2)]);
  const start = `M ${pad},${h - pad} L ${points[0][0]},${points[0][1]}`;
  const lines = points.slice(1).map(([x, y]) => `L ${x},${y}`).join(" ");
  const close = `L ${w - pad},${h - pad} Z`;
  return [start, lines, close].join(" ");
}

// เปลี่ยนฟังก์ชันนี้ไปเรียก Firestore/Backend จริงได้เลย
async function fetchStats(range) {
  await wait(350); // simulate latency เล็กน้อย
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 30;
  const rnd = (min, max) => Math.round(min + Math.random() * (max - min));

  const signups = Array.from({ length: days }, () => rnd(5, 60));
  const logins = Array.from({ length: days }, () => rnd(30, 180));

  const topProducts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: ["Matte Velvet Lip #0", "Glow Serum 15ml", "UV Shield SPF50+", "Soft Blush 01", "Fiber Mascara", "Hydra Toner"][i],
    brand: ["Aira", "Aurora", "Sunia", "Bloomy", "Lashé", "Hydria"][i],
    clicks: rnd(120, 980),
    favs: rnd(30, 420),
  }));

  const recentUsers = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    name: ["Ploy", "May", "Fern", "Palm", "Nune", "Mild", "Beam", "Sine", "Ice", "Aom", "Fah", "June", "Kate", "Nam"][i],
    email: `user${i + 1}@example.com`,
    provider: ["google", "facebook", "email"][i % 3],
  }));

  const providers = [
    { key: "google", label: "Google", count: rnd(120, 420), tint: "#4285F4" },
    { key: "facebook", label: "Facebook", count: rnd(50, 200), tint: "#1877F2" },
    { key: "email", label: "Email", count: rnd(80, 260), tint: "#75464A" },
  ];

  const kpis = [
    { key: "users", label: "Total Users", value: fmt(4820), delta: "+4.1%", up: true },
    { key: "active", label: "Active (7d)", value: fmt(1212), delta: "+2.3%", up: true },
    { key: "coupons", label: "Coupons Redeemed", value: fmt(238), delta: "-1.2%", up: false },
    { key: "aov", label: "Avg. Click / User", value: fmt(7), delta: "+0.6%", up: true },
  ];

  return {
    kpis,
    signups,
    logins,
    topProducts,
    maxClicks: Math.max(...topProducts.map((p) => p.clicks)),
    maxFavs: Math.max(...topProducts.map((p) => p.favs)),
    providers,
    maxProvider: Math.max(...providers.map((p) => p.count)),
    recentUsers,
  };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function exportCSV(stats) {
  const rows = [
    ["rank", "name", "brand", "clicks", "favs"],
    ...stats.topProducts.map((p, i) => [i + 1, p.name, p.brand, p.clicks, p.favs]),
  ];
  const csv = rows.map((r) => r.map((c) => JSON.stringify(c)).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `auramatch-top-products.csv`; a.click();
  URL.revokeObjectURL(url);
}
