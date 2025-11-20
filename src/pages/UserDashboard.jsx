// src/pages/UserDashboard.jsx
import { useMemo } from "react";

export default function UserDashboard() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("auramatch:user") || "{}"); }
    catch { return {}; }
  }, []);

  const season = localStorage.getItem("auramatch:lastSeason") || "—";
  const shape  = localStorage.getItem("auramatch:lastFaceShape") || "—";

  return (
    <main className="min-h-[60vh] bg-[#FFF6F9]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#6B4E57]">
              สวัสดี{user?.name ? `, ${user.name}` : ""} 👋
            </h1>
            <p className="text-sm text-[#8B7C85]">
              สรุปโปรไฟล์ความงาม และคำแนะนำเฉพาะคุณ
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/analysis" className="px-4 py-2 rounded-xl bg-[#F3B7C6] text-white hover:opacity-90">
              วิเคราะห์ใหม่
            </a>
            <a href="/advisor" className="px-4 py-2 rounded-xl bg-white border hover:bg-pink-50">
              ทำแบบทดสอบ
            </a>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card title="Personal Color">
            <Badge>{season}</Badge>
            <p className="text-sm text-[#8B7C85] mt-2">โทนสีที่เหมาะกับคุณจากผลล่าสุด</p>
          </Card>
          <Card title="Face Shape">
            <Badge>{shape}</Badge>
            <p className="text-sm text-[#8B7C85] mt-2">รูปหน้าจากผลวิเคราะห์ล่าสุด</p>
          </Card>
          <Card title="คูปองของฉัน">
            <p className="text-sm text-[#8B7C85]">
              ใช้แถบ “Welcome coupon” ด้านบนเพื่อคัดลอกโค้ดได้ทันที
            </p>
            <a className="inline-block mt-3 text-[#F3B7C6] underline" href="/cosmetics">ดูสินค้า</a>
          </Card>
        </div>

        {/* Quick sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Recommended Looks">
            <EmptyHint link="/looks">ไปที่หน้า Looks</EmptyHint>
          </Card>
          <Card title="Recommended Products">
            <EmptyHint link="/cosmetics">ไปที่หน้า Cosmetics</EmptyHint>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <h3 className="text-[#6B4E57] font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}
function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
          style={{ backgroundColor: "#F3B7C6" }}>
      {children}
    </span>
  );
}
function EmptyHint({ children, link }) {
  return (
    <div className="text-sm text-[#8B7C85]">
      ยังไม่มีรายการที่บันทึกไว้จากคุณ
      {" "}
      <a href={link} className="text-[#F3B7C6] underline">คลิกที่นี่</a> {children && <>เพื่อ {children}</>}
    </div>
  );
}
