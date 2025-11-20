// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, FunnelChart, Funnel, LabelList
} from "recharts";
import { subscribeLikes } from "../utils/likes";

/* ----------------------- utils & mock data ----------------------- */

const seasonColors = {
  Spring: "#FFB4A2",
  Summer: "#A2D2FF",
  Autumn: "#CE8D5A",
  Winter: "#7D79F2",
};

const products = [
  { id: 1, name: "Peach Blossom Blush", price: 420, season: "Spring", rating: 4.6, img: "https://images.unsplash.com/photo-1589965633633-6c6a9f7b4cd3?auto=format&fit=crop&w=600&q=60", ext: "https://shopee.co.th" },
  { id: 2, name: "Soft Mauve Lip Cream", price: 520, season: "Summer", rating: 4.7, img: "https://images.unsplash.com/photo-1580617971302-1b1e7b2f2e7a?auto=format&fit=crop&w=600&q=60", ext: "https://www.tiktok.com" },
  { id: 3, name: "Terracotta Sculpt Blush", price: 460, season: "Autumn", rating: 4.7, img: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&w=600&q=60", ext: "https://lazada.co.th" },
  { id: 4, name: "Plum Cream Blush", price: 490, season: "Winter", rating: 4.8, img: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=600&q=60", ext: "https://shopee.co.th" },
];

const analysisTrend = [
  { d: "Mon", count: 24 }, { d: "Tue", count: 32 }, { d: "Wed", count: 40 },
  { d: "Thu", count: 37 }, { d: "Fri", count: 45 }, { d: "Sat", count: 62 }, { d: "Sun", count: 58 },
];

const seasonDist = [
  { name: "Spring", value: 24 }, { name: "Summer", value: 26 },
  { name: "Autumn", value: 20 }, { name: "Winter", value: 30 },
];

const faceShapeDist = [
  { shape: "Oval", val: 34 }, { shape: "Round", val: 18 },
  { shape: "Heart", val: 22 }, { shape: "Square", val: 14 }, { shape: "Triangle", val: 12 }
];

const funnelData = [
  { value: 100, name: "Visit Home" },
  { value: 76, name: "Upload Image" },
  { value: 68, name: "AI Result" },
  { value: 33, name: "External Click" },
];

/* ----------------------- shared UI ----------------------- */

function Section({ title, action, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function CouponStrip({ code = "WELCOME-APTIF4", daysLeft = 7, used = false }) {
  return (
    <div className="card p-4 flex items-center justify-between bg-aurapinkSoft border-pink-200">
      <div className="flex items-center gap-3">
        <span className="badge bg-aurapink text-white">Welcome coupon</span>
        <code className="px-3 py-1 rounded-lg bg-white border text-aurabrown">{code}</code>
        {!used ? (
          <span className="text-sm text-gray-500">{daysLeft} days left · 10% off</span>
        ) : <span className="text-sm text-gray-500">Used</span>}
      </div>
      <button
        className="px-3 py-1.5 rounded-lg bg-aurapink text-white hover:opacity-90"
        onClick={() => navigator.clipboard.writeText(code)}
      >
        Copy
      </button>
    </div>
  );
}

function SeasonBadge({ season }) {
  return (
    <span
      className="badge text-white"
      style={{ backgroundColor: seasonColors[season] || "#ddd" }}
    >
      {season}
    </span>
  );
}

/* ----------------------- Member Dashboard ----------------------- */

export function MemberDashboard() {
  const mySeason = "Winter";
  const myShape = "Oval";
  const [liked, setLiked] = useState([]); // [{id,title,season,img,tags,ext}]

  useEffect(() => {
    const unsub = subscribeLikes(setLiked);
    return () => unsub && unsub();
  }, []);

  return (
    <div className="min-h-screen bg-aurapinkSoft">
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-aurabrown">Hi, Aura! ✨</h1>
            <p className="text-sm text-gray-500">Welcome back to AuraMatch</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white border hover:bg-pink-50">Edit Profile</button>
            <button className="px-4 py-2 rounded-xl bg-aurapink text-white hover:opacity-90">Re-Analyze</button>
          </div>
        </header>

        <CouponStrip />

        {/* Beauty profile + quick stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Section title="My Beauty Profile" action={<SeasonBadge season={mySeason} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Personal Color</span>
                <SeasonBadge season={mySeason} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Face Shape</span>
                <span className="badge bg-gray-100 text-aurabrown">{myShape}</span>
              </div>
              <ul className="text-sm list-disc pl-5 text-gray-600">
                <li>Brows: Soft arch, natural shade</li>
                <li>Lips: Plum / Berry tones</li>
                <li>Hair: Ash brown, cool beige highlights</li>
              </ul>
              <a href="/analysis" className="inline-block mt-2 text-aurapink underline">ดูรายงานเต็ม</a>
            </div>
          </Section>

          <Section title="Analyses this week">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#C27BA0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Season distribution">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={seasonDist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                    {seasonDist.map((s, i) => (
                      <Cell key={i} fill={seasonColors[s.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Favorites from Looks (Realtime) */}
        <Section title="Recommended Looks (Favorites)" action={<a href="/looks" className="text-aurapink underline">ไปหน้า Looks</a>}>
          {liked.length === 0 ? (
            <div className="text-sm text-gray-600">
              ยังไม่มีลุคที่คุณกดถูกใจ — ไปที่ <a className="underline text-aurapink" href="/looks">หน้า Looks</a> แล้วกด ❤️ ที่การ์ดลุคที่ชอบ
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-2">
              {liked.map((l) => (
                <div key={l.id} className="min-w-[260px] card overflow-hidden">
                  <img src={l.img} alt={l.title} className="h-40 w-full object-cover" />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-aurabrown line-clamp-1">{l.title}</h4>
                      <SeasonBadge season={l.season} />
                    </div>
                    {!!(l.tags?.length) && (
                      <div className="flex gap-2 flex-wrap">
                        {l.tags.slice(0, 3).map((t, i) => (
                          <span key={i} className="badge bg-gray-100 text-aurabrown">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="pt-1">
                      <a href={l.ext || "#"} target="_blank" rel="noreferrer" className="text-aurapink underline">
                        Quick view
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Products */}
        <Section title="Recommended Products">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <div key={p.id} className="card overflow-hidden">
                <img src={p.img} alt={p.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-aurabrown line-clamp-1">{p.name}</h4>
                    <SeasonBadge season={p.season} />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">⭐ {p.rating.toFixed(1)}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-aurabrown">{p.price} THB</span>
                    <a href={p.ext} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-aurapink text-white text-sm hover:opacity-90">
                      เปิดลิงก์
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Tutorials */}
        <Section title="Tutorials for you">
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div className="relative card overflow-hidden" key={i}>
                <img
                  src={`https://images.unsplash.com/photo-1556228453-efd1e3f1df2b?auto=format&fit=crop&w=900&q=60`}
                  alt="yt"
                  className="h-44 w-full object-cover"
                />
                <a className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 text-white rounded-lg text-sm" href="https://www.youtube.com/results?search_query=personal%20color%20makeup" target="_blank" rel="noreferrer">Watch on YouTube</a>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ----------------------- Admin Dashboard ----------------------- */

export function AdminDashboard() {
  const KPI = [
    { label: "New Signups (7d)", value: "1,204" },
    { label: "Analyses (7d)", value: "3,612" },
    { label: "External CTR", value: "48%" },
    { label: "Avg Time to Result", value: "2.4s" },
    { label: "Coupon Usage", value: "17%" },
    { label: "Top Season", value: "Winter" },
  ];

  return (
    <div className="min-h-screen bg-aurapinkSoft">
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-aurabrown">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white border hover:bg-pink-50">Export CSV</button>
            <button className="px-4 py-2 rounded-xl bg-aurapink text-white hover:opacity-90">Create Coupon</button>
          </div>
        </header>

        {/* KPI */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {KPI.map((k,i) => (
            <div key={i} className="card p-5">
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="mt-2 text-2xl font-bold text-aurabrown">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="Analyses per day">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#C27BA0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Season Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={seasonDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {seasonDist.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={seasonColors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Face Shape Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faceShapeDist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shape" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="val" fill="#7D79F2" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Conversion Funnel">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#6B4E57" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="Top Outbound Products (7d)">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Product</th>
                    <th>Season</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p,i)=>(
                    <tr key={i} className="border-t">
                      <td className="py-2">{p.name}</td>
                      <td><SeasonBadge season={p.season}/></td>
                      <td>{(120 - i*11)}</td>
                      <td>{(12 - i*1.5).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Broken Links Monitor">
            <div className="text-sm text-gray-600">
              ✓ No broken links detected last 24h
            </div>
          </Section>
        </div>

        {/* Quick actions */}
        <Section title="Quick Actions">
          <div className="flex flex-wrap gap-3">
            {["Manage Looks","Manage Products","Manage Tutorials","Manage Coupons","Analytics Export"].map((t,i)=>(
              <button key={i} className="px-4 py-2 rounded-xl bg-white border hover:bg-pink-50">{t}</button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// สำหรับ route /dashboard ให้ export ตัวสมาชิกเป็น default
export default MemberDashboard;
