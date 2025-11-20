// src/pages/AccountProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { lsGet, onBus } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

/* ---------- UI helpers ---------- */
const C = { card: "rounded-2xl border border-[#E6DCEB] bg-white/70 p-4 shadow-sm" };
const seasonColor = { Spring:"#FFB4A2", Summer:"#A2D2FF", Autumn:"#CE8D5A", Winter:"#7D79F2" };

/* ---------- map labels ---------- */
const MAP = {
  brows: { softArch: "Soft arch", straight: "Straight", arched: "High arch" },
  eyes:  { natural: "Natural gradient", cat: "Cat-eye lift", dolly: "Dolly eye" },
  nose:  { softContour: "Soft contour", definedContour: "Defined contour", natural: "Natural" },
  lips:  { gradient: "Gradient lip", full: "Full bold", soft: "Soft blur" },
};
const pretty = (val, group) => (MAP[group] || {})[val] || val || "-";

/* ---------- last analysis (back-compat) ---------- */
function readLastAnalysis() {
  const last = lsGet("auramatch:lastAnalysis", null);
  if (last) return last;
  const season    = lsGet("auramatch:lastSeason", null);
  const faceShape = lsGet("auramatch:lastFaceShape", null);
  const preview   = lsGet("auramatch:lastPreview", null);
  if (season || faceShape || preview) return { season, faceShape, preview, face: {} };
  return null;
}

/* ---------- image utilities: read, center-crop, resize square ---------- */
async function fileToSquareDataURL(file, size = 256) {
  const blob = file instanceof Blob ? file : new Blob([file]);
  const img = await new Promise((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(blob);
  });

  const s = Math.min(img.width, img.height);
  const sx = Math.floor((img.width  - s) / 2);
  const sy = Math.floor((img.height - s) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  URL.revokeObjectURL(img.src);
  return dataUrl;
}

/* ---------- Edit Avatar Modal ---------- */
function EditAvatarModal({ open, onClose, me, onSaved }) {
  const [preview, setPreview] = useState(me?.avatar || "");
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setPreview(me?.avatar || ""); }, [me?.avatar, open]);

  function onPickFile() {
    fileInputRef.current?.click();
  }
  async function onFiles(files) {
    const f = files?.[0];
    if (!f) return;
    const dataUrl = await fileToSquareDataURL(f, 320); // ให้คมขึ้นหน่อย
    setPreview(dataUrl);
  }
  function onDrop(e) {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  }
  function onDragOver(e){ e.preventDefault(); }

  function onPaste(e){
    const item = [...e.clipboardData.items].find(it => it.type.startsWith("image/"));
    if (item) onFiles([item.getAsFile()]);
  }

  async function onChange(e) { onFiles(e.target.files); }

  function onSave(){
    const current = lsGet("auramatch:user", { name:"User", email:"" });
    const next = { ...current, avatar: preview };
    localStorage.setItem("auramatch:user", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));     // เผื่ออีกแท็บ
    window.dispatchEvent(new CustomEvent("user:updated", { detail: next }));
    onSaved?.(next);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/20 p-4" onPaste={onPaste}>
      <div className="w-full max-w-md rounded-2xl border border-[#E6DCEB] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#E6DCEB] p-4">
          <div className="font-semibold text-[#75464A]">Edit profile photo</div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-[#75464A]/60 hover:bg-[#FADCDC]/40">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* preview */}
          <div className="grid place-items-center">
            {preview ? (
              <img src={preview} alt="preview" className="h-36 w-36 rounded-full border border-[#E6DCEB] object-cover" />
            ) : (
              <div className="h-36 w-36 rounded-full border border-dashed border-[#E6DCEB] grid place-items-center text-[#75464A]/50">No image</div>
            )}
          </div>

          {/* dropzone */}
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="rounded-xl border border-dashed border-[#E6DCEB] bg-[#FFF7F9] p-4 text-center text-sm text-[#75464A]"
          >
            Drag & drop image here, or{" "}
            <button onClick={onPickFile} className="underline">choose a file</button><br/>
            <span className="text-xs text-[#75464A]/60">You can also paste an image from clipboard</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onChange}/>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-xl border border-[#E6DCEB] bg-white px-4 py-2 text-sm">Cancel</button>
            <button onClick={onSave} disabled={!preview} className="rounded-xl bg-[#FFB3C6] px-4 py-2 text-sm text-white disabled:opacity-50">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountProfile() {
  const [last, setLast] = useState(() => readLastAnalysis());
  const [favs, setFavs] = useState([]);
  const [me, setMe] = useState(() => lsGet("auramatch:user", { name: "User", email: "" }));
  const [openEdit, setOpenEdit] = useState(false);

  // listen for internal bus (analysis changes)
  useEffect(() => onBus(() => setLast(readLastAnalysis())), []);
  useEffect(() => {
    const h = () => {
      setLast(readLastAnalysis());
      setMe(lsGet("auramatch:user", { name: "User", email: "" }));
    };
    window.addEventListener("analysis:updated", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("analysis:updated", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  useEffect(() => subscribeLikes(setFavs), []);

  const coupon = lsGet("auramatch:coupon", { code: "WELCOME-I9480U", daysLeft: 7, used: false });

  const seasonDist = useMemo(
    () => ["Spring","Summer","Autumn","Winter"].map(s => ({ name: s, value: s === last?.season ? 40 : 20 })),
    [last?.season]
  );
  const trend = [
    { d:"Mon",count:24 },{ d:"Tue",count:32 },{ d:"Wed",count:40 },
    { d:"Thu",count:37 },{ d:"Fri",count:45 },{ d:"Sat",count:62 },{ d:"Sun",count:58 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FADCDC33,#E6DCEB22)" }}>
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

        {/* coupon bar */}
        <div className="flex items-center justify-between rounded-2xl border border-[#E6DCEB] bg-white/70 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#FFB3C6] px-2 py-0.5 text-xs font-semibold text-white">Welcome coupon</span>
            <code className="rounded-lg border border-[#E6DCEB] bg-white px-3 py-1 text-[#75464A]">{coupon.code}</code>
            <span className="text-sm text-[#75464A]/60">{coupon.daysLeft} days left · 10% off</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(coupon.code)}
            className="rounded-lg bg-[#FFB3C6] px-3 py-1.5 text-sm text-white"
          >
            Copy
          </button>
        </div>

        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[#E6DCEB] bg-[#75464A]/5 grid place-items-center text-[#75464A] font-semibold">
              {me?.avatar ? (
                <img src={me.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                (me?.name?.[0] || me?.email?.[0] || "U").toUpperCase()
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-[#75464A]">{me?.name ?? "User"} 👋</div>
              <div className="text-xs text-[#75464A]/60">Your profile & beauty insights</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpenEdit(true)}
              className="rounded-xl border border-[#E6DCEB] bg-white px-4 py-2 text-sm"
            >
              Edit Profile
            </button>
            <a href="/analysis" className="rounded-xl bg-[#FFB3C6] px-4 py-2 text-sm text-white">Re-Analyze</a>
          </div>
        </div>

        {/* 3 กล่องบน */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Beauty profile */}
          <section className={C.card}>
            <div className="mb-2 text-sm font-semibold text-[#75464A]">My Beauty Profile</div>
            {last ? (
              <div className="space-y-2 text-sm text-[#75464A]">
                <div>Personal Color: <b>{last.season || "-"}</b></div>
                <div>Face Shape: <b>{last.faceShape || "-"}</b></div>
                <ul className="list-disc pl-5 text-[#75464A]/80">
                  <li>Brows: {pretty(last.face?.brows, "brows")}</li>
                  <li>Eyes: {pretty(last.face?.eyes, "eyes")}</li>
                  <li>Nose: {pretty(last.face?.nose, "nose")}</li>
                  <li>Lips: {pretty(last.face?.lips, "lips")}</li>
                </ul>
                {!!last.preview && (
                  <img src={last.preview} alt="preview" className="mt-2 h-28 w-28 rounded-lg border border-[#E6DCEB] object-cover" />
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-[#E6DCEB] bg-white p-3 text-sm text-[#75464A]/60">
                ยังไม่มีผลวิเคราะห์ล่าสุด — ไปที่หน้า <a className="underline" href="/analysis">Analysis</a> เพื่อวิเคราะห์โครงหน้า
              </div>
            )}
          </section>

          {/* Analyses this week */}
          <section className={C.card}>
            <div className="mb-2 text-sm font-semibold text-[#75464A]">Analyses this week</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#C27BA0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Season distribution */}
          <section className={C.card}>
            <div className="mb-2 text-sm font-semibold text-[#75464A]">Season distribution</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={seasonDist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                    {seasonDist.map((s, i) => <Cell key={i} fill={seasonColor[s.name]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Favorites */}
        <section className={C.card}>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#75464A]">Recommended Looks (Favorites)</div>
            <a href="/looks" className="text-sm text-[#75464A] underline">ไปหน้า Looks</a>
          </div>

          {favs.length === 0 ? (
            <div className="rounded-lg border border-[#E6DCEB] bg-white p-3 text-sm text-[#75464A]/60">
              ยังไม่มีลุคที่กดใจ — ไปหน้า <a href="/looks" className="underline">Looks</a> แล้วกดใจ ❤️ เพื่อบันทึก
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {favs.map((f) => (
                <div key={f.id} className="min-w-[240px] overflow-hidden rounded-2xl border border-[#E6DCEB] bg-white">
                  <img src={f.img} alt={f.title} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="line-clamp-1 text-sm font-semibold text-[#75464A]">{f.title}</div>
                      <span className="rounded-full px-2 py-0.5 text-[11px] text-white" style={{ background: seasonColor[f.season] }}>{f.season}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      <EditAvatarModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        me={me}
        onSaved={(next) => setMe(next)}
      />
    </div>
  );
}
