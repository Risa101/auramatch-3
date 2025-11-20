import React from "react";

const BRAND = {
  bgFrom: "#faf2f6",
  bgTo:   "#f0ebf7",
  primary:"#75464A",
  accent: "#E6DCEB",
  hover:  "#D85E79",
};

const VALUES = [
  { title: "Human-first AI", desc: "เราออกแบบด้วยหัวใจ เน้นประสบการณ์ผู้ใช้เหนือสิ่งอื่นใด" },
  { title: "Beauty for All", desc: "ความงามเข้าถึงได้สำหรับทุกโทนสีผิวและสไตล์" },
  { title: "Transparency", desc: "อธิบายได้ ไม่ซ่อนสูตรลับ ให้ผู้ใช้ตัดสินใจอย่างมั่นใจ" },
];

const TIMELINE = [
  { year: "2023", text: "เริ่มต้นไอเดีย AuraMatch เพื่อแก้ปัญหาเลือกสี/ลุคไม่มั่นใจ" },
  { year: "2024", text: "ทดลองต้นแบบ AI วิเคราะห์โครงหน้า + Personal Color สำเร็จ" },
  { year: "2025", text: "เปิดรุ่นสำหรับโปรเจกต์จบ เพิ่มหน้า Advisor / Cosmetics / Analysis" },
];

const TEAM = [
  {
    name: "Sarid B.",
    role: "Product & AI",
    img: "/about/team1.jpg",
    bio: "ดูแลภาพรวมโปรดักต์และโมเดลวิเคราะห์ความงาม",
  },
  {
    name: "Mint T.",
    role: "UI/UX Designer",
    img: "/about/team2.jpg",
    bio: "ออกแบบประสบการณ์ใช้งานให้เรียบหรู ใช้ง่าย",
  },
  {
    name: "Jo P.",
    role: "Frontend Engineer",
    img: "/about/team3.jpg",
    bio: "พัฒนาเว็บด้วย React + Tailwind ดูแลคุณภาพโค้ด",
  },
];

/** ---------- Small shared UI ---------- */
const Card = ({ className = "", children }) => (
  <div
    className={`rounded-3xl border bg-white/70 shadow-sm backdrop-blur-md ${className}`}
    style={{ borderColor: BRAND.accent }}
  >
    {children}
  </div>
);

const Pill = ({ children, tone = "default" }) => {
  const map = {
    default: "bg-white text-[#75464A] ring-1 ring-[#E6DCEB]",
    dark: "bg-[#75464A] text-white",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
};

const SectionTitle = ({ children, sub }) => (
  <div className="text-center">
    <h2 className="text-2xl md:text-3xl font-bold text-[#75464A]">{children}</h2>
    {sub && <p className="mt-2 text-gray-600">{sub}</p>}
  </div>
);

const Check = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-500"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
);

/** ---------- Decorative orbs ---------- */
const Orb = ({ className = "", from = "#fadcdc", to = "#e6dceb" }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute blur-3xl opacity-60 ${className}`}
    style={{
      background: `radial-gradient(400px 200px at 50% 50%, ${from}aa 0%, transparent 70%), radial-gradient(300px 160px at 60% 40%, ${to}aa 0%, transparent 70%)`,
    }}
  />
);

export default function AboutUs() {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: `linear-gradient(180deg, ${BRAND.bgFrom} 0%, ${BRAND.bgTo} 100%)` }}
    >
      {/* animated gradient blobs */}
      <Orb className="top-[-180px] left-[-80px] h-[420px] w-[720px] animate-float-slow" />
      <Orb className="top-[120px] right-[-120px] h-[360px] w-[560px] animate-float" from="#fce0ea" to="#dcd3f4" />

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-10">
        <Card className="p-8 md:p-10 text-center relative overflow-hidden">
          {/* sheen */}
          <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rotate-12 bg-white/40 blur-2xl" />
          <Pill tone="default">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: BRAND.hover }} />
            About AuraMatch
          </Pill>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#75464A] animate-rise">
            สร้างความมั่นใจด้วย AI ความงาม
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            เราเชื่อว่าความงามเริ่มจาก “ตัวตนที่ใช่” — AuraMatch พัฒนา
            <strong> ผู้ช่วยเลือกโทนสีและลุคด้วย AI</strong> เพื่อให้คุณตัดสินใจได้ง่ายขึ้นและสนุกขึ้น
          </p>

          <div className="mt-6 inline-flex items-center gap-2">
            <Pill tone="dark">✨ Face Analysis & Personal Color</Pill>
            <Pill>Explainable • Human-first</Pill>
          </div>

          {/* floating tiny dots */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-10 top-8 h-2 w-2 animate-ping rounded-full bg-pink-300" />
            <div className="absolute right-12 bottom-10 h-2 w-2 animate-ping rounded-full bg-purple-300" />
          </div>
        </Card>
      </section>

      {/* MISSION + WHAT WE BUILD (interactive) */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-8 group overflow-hidden">
            <SectionTitle>Our Mission</SectionTitle>
            <p className="mt-3 text-gray-600">
              ทำให้ “การเลือกเครื่องสำอาง” ง่ายและมั่นใจ ด้วยการจับคู่สีและสไตล์ที่แมตช์กับโครงหน้า โทนผิว และบุคลิกของคุณ
              ลดการลองผิดลองถูก ประหยัดทั้งเวลาและงบประมาณ
            </p>
            <ul className="mt-5 space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><Check /> <span>แนะนำเฉดสีที่ใช่ตั้งแต่ครั้งแรก</span></li>
              <li className="flex items-start gap-2"><Check /> <span>ลุคที่สอดคล้องบุคลิก/ไลฟ์สไตล์</span></li>
              <li className="flex items-start gap-2"><Check /> <span>เชื่อมต่อกับหน้า Cosmetics เพื่อช้อปต่อ</span></li>
            </ul>
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 opacity-60 blur-2xl transition group-hover:scale-110" />
          </Card>

          <Card className="p-8">
            <SectionTitle>What We Build</SectionTitle>
            <div className="mt-4 grid gap-3 text-sm text-gray-700">
              <div className="group rounded-2xl border bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: BRAND.accent }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50">📷</span>
                  <div><div className="font-semibold text-[#75464A]">Analysis</div><div className="text-gray-600">อัปโหลดรูปเพื่อวิเคราะห์โครงหน้า + โทนสี</div></div>
                </div>
              </div>
              <div className="group rounded-2xl border bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: BRAND.accent }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50">🧭</span>
                  <div><div className="font-semibold text-[#75464A]">Advisor</div><div className="text-gray-600">อธิบายโครงหน้า 7 แบบ + Personal Color</div></div>
                </div>
              </div>
              <div className="group rounded-2xl border bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: BRAND.accent }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50">🛍</span>
                  <div><div className="font-semibold text-[#75464A]">Cosmetics</div><div className="text-gray-600">ช้อปไอเท็ม/เฉดที่แมตช์กับผลวิเคราะห์</div></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* VALUES (hover accents) */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <Card className="p-8">
          <SectionTitle>Our Values</SectionTitle>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: BRAND.accent }}
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 animate-gradient-x" />
                <h3 className="text-lg font-semibold text-[#75464A]">{v.title}</h3>
                <p className="mt-2 text-gray-600">{v.desc}</p>
                <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-pink-100 opacity-0 blur-2xl transition group-hover:opacity-60" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* TIMELINE (animated line) */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <Card className="p-8">
          <SectionTitle>Our Journey</SectionTitle>
          <div className="relative mx-auto mt-6 max-w-3xl">
            {/* animated vertical line */}
            <div className="absolute left-5 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-pink-200 via-purple-200 to-pink-200 animate-gradient-y" />
            <ul className="space-y-6">
              {TIMELINE.map((t, i) => (
                <li key={i} className="relative pl-12">
                  <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white ring-2 ring-[#E6DCEB]">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BRAND.primary }} />
                  </span>
                  <div className="rounded-2xl border bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5"
                       style={{ borderColor: BRAND.accent }}>
                    <div className="text-sm font-semibold text-[#75464A]">{t.year}</div>
                    <div className="text-gray-600">{t.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      {/* TEAM (tilt & overlays) */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SectionTitle>Meet the Team</SectionTitle>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {TEAM.map((m, i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: BRAND.accent }}
            >
              <div className="relative">
                <img src={m.img} alt={m.name} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-70" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#75464A] shadow">
                  {m.role}
                </span>
              </div>
              <div className="p-5">
                <div className="text-[15px] font-semibold text-gray-800">{m.name}</div>
                <p className="mt-2 text-sm text-gray-600">{m.bio}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: BRAND.hover }} />
                  Available for collab
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Card className="p-8 text-center relative overflow-hidden">
          <h3 className="text-xl md:text-2xl font-extrabold text-[#75464A]">
            มาร่วมสร้างนิยามความงามแบบ “คุณ”
          </h3>
          <p className="mt-2 text-gray-600">เริ่มต้นด้วยการวิเคราะห์ใบหน้าและโทนสีผิวในไม่กี่วินาที</p>
          <a
            href="/analysis"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2"
            style={{ backgroundColor: BRAND.primary }}
          >
            เริ่มวิเคราะห์ตอนนี้ <span aria-hidden>↗</span>
          </a>

          {/* glow accents */}
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-200 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-200 blur-2xl" />
        </Card>
      </section>

      {/* Floating help bubble */}
      <a
        href="/contact"
        className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#75464A] text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        title="Contact us"
      >
        💬
      </a>

      {/* custom keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-10px) }
          100% { transform: translateY(0px) }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) translateX(0) }
          50% { transform: translateY(-8px) translateX(6px) }
          100% { transform: translateY(0px) translateX(0) }
        }
        @keyframes rise {
          0% { opacity: 0; transform: translateY(6px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes gradient-y {
          0% { background-position: 50% 0% }
          50% { background-position: 50% 100% }
          100% { background-position: 50% 0% }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-rise { animation: rise .6s ease-out both; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        .animate-gradient-y {
          background-size: 200% 200%;
          animation: gradient-y 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
