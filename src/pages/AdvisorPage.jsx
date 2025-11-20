import React, { useEffect, useRef, useState, useMemo } from "react";
import "./AdvisorPage.css";

/* =============== Season Data (เดิมแต่ย่อ) =============== */
const SEASONS = [
  {
    key: "Spring",
    undertone: "Warm • ใส • คอนทราสต์กลาง",
    desc: "โทนอุ่นสดใส สีพีช/คอรัล/แชมเปญช่วยให้ผิวดูเรือง",
    best: ["Peach", "Coral", "Apricot", "Champagne Gold", "Fresh Mint"],
    avoid: ["Cool Blue-Violet", "Icy Blue-Grey"],
    makeup: ["ลิปพีช/คอรัล", "บลัชแอพริคอต", "ชิมเมอร์ทองอ่อน"],
    hair: ["Honey Blonde", "Golden Brown", "Peach Brown"],
    metal: "Gold / Rose Gold",
    palette: ["#FFB3A7", "#FFA07A", "#FFD29D", "#F9E6B3", "#C7E8C8"],
  },
  {
    key: "Summer",
    undertone: "Cool • นุ่ม • คอนทราสต์ต่ำ-กลาง",
    desc: "โทนเย็นนุ่ม สีชมพูโรส/ลาเวนเดอร์/พาสเทลดูละมุนสะอาด",
    best: ["Rose", "Mauve", "Lavender", "Powder Blue", "Soft Grey"],
    avoid: ["Orange-Gold", "Warm Brown"],
    makeup: ["ลิปชมพูโรส", "บลัชชมพูหม่น", "ชิมเมอร์เงิน"],
    hair: ["Ash Brown", "Cool Beige", "Rose Brown"],
    metal: "Silver / White Gold",
    palette: ["#E2B6CF", "#BDA8D0", "#AEC6EB", "#B7C4CF", "#EAEAEA"],
  },
  {
    key: "Autumn",
    undertone: "Warm • ดิน • คอนทราสต์กลาง-ลึก",
    desc: "เอิร์ธโทนหรูหรา สีอิฐ/โอลีฟ/คอปเปอร์ทำให้ผิวมีมิติ",
    best: ["Terracotta", "Olive", "Camel", "Teal", "Copper"],
    avoid: ["Icy Silver Blue", "Magenta Cool"],
    makeup: ["ลิปอิฐ/อิฐน้ำตาล", "บลัชแอพริคอต", "อายแชโดว์คอปเปอร์"],
    hair: ["Chestnut", "Copper", "Caramel"],
    metal: "Gold / Brass",
    palette: ["#C7683B", "#8A9A5B", "#C3A995", "#1E7F82", "#B06C49"],
  },
  {
    key: "Winter",
    undertone: "Cool • จัด • คอนทราสต์สูง",
    desc: "สีจิวเวลโทน/ขาวดำ เด่น คมชัด ทำให้ผิวดูใส",
    best: ["Sapphire", "Emerald", "Fuchsia", "Ink Blue", "Black/White"],
    avoid: ["Warm Earthy Neutrals"],
    makeup: ["ลิปแดงเชอร์รี่/เบอร์กันดี", "ไฮไลต์เงิน", "สโมกกี้โทนเย็น"],
    hair: ["Blue-Black", "Espresso", "Cool Burgundy"],
    metal: "Silver / Platinum",
    palette: ["#173A6A", "#1F6F64", "#C4246A", "#101820", "#FFFFFF"],
  },
];

/* =============== Face Shape Knowledge =============== */
const FACE_GUIDE = {
  Round: {
    traits: "หน้ากว้าง≈ยาว โหนกแก้มเด่น คางมน กรอบหน้าโค้ง",
    do: ["ผมยาวเลยคาง", "เลเยอร์ด้านข้างไล่ลง", "เพิ่มวอลลุ่มด้านบนเล็กน้อย"],
    avoid: ["หน้าม้าตรงทึบสั้น", "ลอนใหญ่กระจุกข้างแก้ม"],
  },
  Oval: {
    traits: "สัดส่วนสมดุล คางมนเล็กน้อย หน้าผากกว้างกว่า/เท่านิดเดียว",
    do: ["ได้เกือบทุกทรง", "เลือกเลเยอร์ให้พอดีใบหน้า"],
    avoid: ["ซอยสั้นมากทำให้หน้าลอย"],
  },
  Square: {
    traits: "กรามชัด โครงเหลี่ยม หน้าผากกว้างใกล้เคียงกราม",
    do: ["ลอนโค้ง C/S อ่อน", "เลเยอร์ปัดปิดมุมกราม"],
    avoid: ["ปลายตัดตรงแข็ง", "ผมตรงทิ้งข้างกราม"],
  },
  Heart: {
    traits: "หน้าผาก/โหนกกว้าง คางแหลม",
    do: ["หน้าม้าบาง/ซีทรู", "เลเยอร์ช่วงคาง–กราม"],
    avoid: ["วอลลุ่มด้านบนมากเกิน", "สั้นมากเปิดหน้าผากหมด"],
  },
  Triangle: {
    traits: "ช่วงกรามกว้างกว่าหน้าผาก",
    do: ["เพิ่มวอลลุ่มขมับ–กลางศีรษะ", "เลเยอร์กรอบหน้าไล่ลง"],
    avoid: ["วอลลุ่มทิ้งหนักที่กราม"],
  },
  Diamond: {
    traits: "โหนกแก้มเด่น หน้าผากและคางแคบ",
    do: ["เลเยอร์ข้างแก้ม", "หน้าม้าบาง/ปัดข้าง"],
    avoid: ["วอลลุ่มเฉพาะกลางแก้ม"],
  },
};

/* =============== Small UI helpers =============== */
const IconChevron = ({ open }) => (
  <svg className={`chev ${open ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Tag = ({ children }) => <span className="tag">{children}</span>;
const Swatch = ({ color }) => <div className="swatch" title={color} style={{ backgroundColor: color }} />;

/* =============== Accordion (Quick Learn) =============== */
function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = i === open;
        return (
          <div key={i} className={`acc-item ${isOpen ? "open" : ""}`}>
            <button className="acc-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <div className="acc-title">{it.title}</div>
              <IconChevron open={isOpen} />
            </button>
            <div className="acc-panel" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="acc-inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =============== Face Shape Quiz =============== */
/** คำถามแบบย่อ + mapping คะแนนเข้ารูปหน้า */
const QUIZ = [
  {
    q: "สัดส่วนความกว้างต่อความยาวของใบหน้าโดยรวม?",
    key: "ratio",
    options: [
      { label: "กว้าง≈ยาว", score: { Round: 2, Square: 1 } },
      { label: "ยาวกว่าเล็กน้อย (สมดุล)", score: { Oval: 2, Diamond: 1 } },
      { label: "ยาวชัดเจน", score: { Heart: 1, Triangle: 1, Oval: 1 } },
    ],
  },
  {
    q: "แนวกรามโดยรวม",
    key: "jaw",
    options: [
      { label: "มน/โค้ง", score: { Round: 2, Oval: 1 } },
      { label: "เหลี่ยม/คม", score: { Square: 2, Triangle: 1 } },
      { label: "แคบลงสู่คาง", score: { Heart: 2, Diamond: 1 } },
    ],
  },
  {
    q: "หน้าผากเมื่อเทียบกับช่วงกราม",
    key: "forehead",
    options: [
      { label: "ใกล้เคียงกัน", score: { Oval: 1, Round: 1, Square: 1 } },
      { label: "หน้าผากกว้างกว่า", score: { Heart: 2, Oval: 1 } },
      { label: "หน้าผากแคบกว่ากราม", score: { Triangle: 2, Diamond: 1 } },
    ],
  },
  {
    q: "โหนกแก้ม",
    key: "cheekbone",
    options: [
      { label: "เด่นมาก (กลางใบหน้ากว้าง)", score: { Diamond: 2, Oval: 1 } },
      { label: "เด่นพอดี", score: { Oval: 1, Heart: 1 } },
      { label: "ไม่เด่น/กลมมน", score: { Round: 1, Square: 1 } },
    ],
  },
  {
    q: "คาง",
    key: "chin",
    options: [
      { label: "มน", score: { Round: 1, Oval: 1 } },
      { label: "แหลม", score: { Heart: 2, Diamond: 1 } },
      { label: "กว้าง/ตรง", score: { Square: 2, Triangle: 1 } },
    ],
  },
  {
    q: "ความรู้สึกโดยรวมจากรูปทรง",
    key: "overall",
    options: [
      { label: "ละมุน/โค้งมน", score: { Round: 1, Oval: 1 } },
      { label: "คม/เหลี่ยมชัด", score: { Square: 2, Diamond: 1 } },
      { label: "บนกว้างลงไปแคบ", score: { Heart: 2, Triangle: 1 } },
    ],
  },
];

function FaceQuiz({ onResult }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const total = QUIZ.length;

  const progress = Math.round(((step) / total) * 100);

  const pick = (k, opt) => {
    setAnswers((m) => ({ ...m, [k]: opt }));
    if (step < total - 1) setStep(step + 1);
  };

  const canFinish = Object.keys(answers).length === total;

  const compute = () => {
    const score = { Round: 0, Oval: 0, Square: 0, Heart: 0, Triangle: 0, Diamond: 0 };
    Object.values(answers).forEach((opt) => {
      Object.entries(opt.score).forEach(([shape, s]) => (score[shape] += s));
    });
    // หาคะแนนสูงสุด (ถ้าเท่ากันเลือกอันที่มี trait ใกล้เคียงจากคำตอบรวม)
    const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    onResult({ shape: winner, score });
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
  };

  const q = QUIZ[step];

  return (
    <div className="quiz">
      <div className="quiz-head">
        <div className="quiz-progress">
          <div className="quiz-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-count">{step + 1} / {total}</div>
      </div>

      <div className="quiz-body">
        <h4 className="quiz-question">{q.q}</h4>
        <div className="quiz-grid">
          {q.options.map((opt, i) => {
            const selected = answers[q.key]?.label === opt.label;
            return (
              <button
                key={i}
                className={`chip ${selected ? "active" : ""}`}
                onClick={() => pick(q.key, opt)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-actions">
        <button className="btn-ghost" onClick={restart} disabled={step === 0 && !answers[q.key]}>
          เริ่มใหม่
        </button>
        {step < total - 1 ? (
          <button
            className="btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!answers[q.key]}
          >
            ถัดไป
          </button>
        ) : (
          <button className="btn-primary" onClick={compute} disabled={!canFinish}>
            ดูผลโครงหน้า
          </button>
        )}
      </div>
    </div>
  );
}

function FaceResult({ result, onReset }) {
  const sKey = result?.shape || "Oval";
  const g = FACE_GUIDE[sKey];
  return (
    <div className="face-result">
      <div className="fr-head">
        <div className="fr-badge">Face Shape Result</div>
        <h4>{sKey}</h4>
        <p className="muted">{g?.traits}</p>
      </div>

      <div className="fr-grid">
        <div className="fr-card">
          <h5>แนะนำ (Do)</h5>
          <ul className="mini-list">{(g?.do || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
        <div className="fr-card">
          <h5>ควรเลี่ยง (Avoid)</h5>
          <ul className="mini-list">{(g?.avoid || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      </div>

      <div className="fr-actions">
        <button className="btn-ghost" onClick={onReset}>ทำแบบทดสอบอีกครั้ง</button>
        <a href="/analysis" className="btn-primary">ต่อไปที่ Analysis</a>
      </div>
    </div>
  );
}

/* =============== Sections Content (Quick Learn) =============== */
const WhatIsPC = () => (
  <div className="content-grid">
    <div className="content-card">
      <h4>Personal Color คืออะไร</h4>
      <p>
        ระบบจับคู่ “สีบนตัวเรา” (ผิว/ตา/ผม) กับ “สีที่สวมใส่” (เสื้อผ้า/เมคอัพ/สีผม/เครื่องประดับ)
        เพื่อให้ผิวดูสว่างใส สุขภาพดี และภาพรวมกลมกลืนหรือคมชัดขึ้น
      </p>
      <div className="pill-row">
        <Tag>Undertone</Tag>
        <Tag>Value</Tag>
        <Tag>Chroma</Tag>
        <Tag>Contrast</Tag>
      </div>
    </div>
    <div className="content-card">
      <h4>แกนหลักที่ใช้พิจารณา</h4>
      <ul className="bullet">
        <li><b>Undertone</b> – อบอุ่น/เย็น/เป็นกลาง/Olive</li>
        <li><b>Value</b> – ความสว่างของสี</li>
        <li><b>Chroma</b> – ความสด/ความหม่นของสี</li>
        <li><b>Contrast</b> – ความตัดกันระหว่างผิว–ตา–ผม</li>
      </ul>
    </div>
  </div>
);

const SelfCheck = () => (
  <div className="content-grid">
    <div className="content-card">
      <h4>เช็ค Undertone ง่าย ๆ</h4>
      <ul className="bullet">
        <li>เส้นเลือด: เขียว → Warm/Olive, น้ำเงินม่วง → Cool, ทั้งคู่ → Neutral</li>
        <li>เครื่องประดับ: ทองเด่น → Warm, เงินเด่น → Cool</li>
        <li>ผ้าขาว vs ครีม: ขาวใสขึ้น → Cool, ครีมกลมกลืนกว่า → Warm</li>
        <li>ลองลิป/บลัช: พีช/คอรัลดูดี → Warm, โรส/เชอร์รี่เด่น → Cool</li>
      </ul>
      <p className="muted">*เจอ Olive undertone ได้บ่อยในเอเชียตะวันออกเฉียงใต้</p>
    </div>
    <div className="content-card">
      <h4>เทสต์ให้แม่น</h4>
      <ul className="bullet">
        <li>แสงธรรมชาติ พื้นหลังกลาง ๆ</li>
        <li>หน้าสด/เมคอัพบาง ๆ ไม่บิด Undertone</li>
        <li>ถ่ายเทียบสองสี A vs B ใกล้หน้า</li>
        <li>โฟกัสว่า “ผิวใส/รอยคล้ำลด” กับสีไหน</li>
      </ul>
    </div>
  </div>
);

/* =============== Season Cards & Table =============== */
function SeasonCard({ s }) {
  return (
    <div className="season-card">
      <div className="season-head">
        <h4>{s.key}</h4>
        <span className="undertone">{s.undertone}</span>
      </div>
      <p className="desc">{s.desc}</p>
      <div className="palette">{s.palette.map((c, i) => <Swatch key={i} color={c} />)}</div>
      <div className="grid-2">
        <div>
          <h5>เหมาะกับ</h5>
          <ul className="mini-list">{s.best.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div>
          <h5>เลี่ยง</h5>
          <ul className="mini-list">{s.avoid.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div>
          <h5>เมคอัพ</h5>
          <ul className="mini-list">{s.makeup.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div>
          <h5>สีผม / เครื่องประดับ</h5>
          <p className="muted">{s.hair.join(" • ")} <br /> {s.metal}</p>
        </div>
      </div>
    </div>
  );
}

function SeasonTable() {
  return (
    <div className="season-table">
      <div className="st-row st-head">
        <div>Season</div>
        <div>Undertone</div>
        <div>Best</div>
        <div>Avoid</div>
        <div>Makeup</div>
        <div>Hair / Metal</div>
      </div>
      {SEASONS.map((s) => (
        <div key={s.key} className="st-row">
          <div><b>{s.key}</b></div>
          <div>{s.undertone}</div>
          <div>{s.best.join(", ")}</div>
          <div>{s.avoid.join(", ")}</div>
          <div>{s.makeup.join(", ")}</div>
          <div>{s.hair.join(" / ")} • {s.metal}</div>
        </div>
      ))}
    </div>
  );
}

/* =============== Scroll FX (เล็กน้อย) =============== */
function useRevealOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    el.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* =============== Main Page =============== */
export default function AdvisorPage() {
  const wrapRef = useRevealOnScroll();

  const accordionItems = [
    { title: "What is Personal Color?", content: <WhatIsPC /> },
    { title: "Self-Check (Undertone & Test)", content: <SelfCheck /> },
  ];

  // Quiz state
  const [quizResult, setQuizResult] = useState(null);

  // Manual short form (เก็บข้อมูลโครงหน้าสั้น ๆ)
  const [miniForm, setMiniForm] = useState({
    forehead: "", cheek: "", jaw: "", chin: "",
  });

  const formShape = useMemo(() => {
    // heuristic ย่อมากๆ
    if (!miniForm.forehead && !miniForm.cheek && !miniForm.jaw && !miniForm.chin) return null;
    if (miniForm.jaw === "square" || miniForm.chin === "wide") return "Square";
    if (miniForm.chin === "pointy" || miniForm.forehead === "wide") return "Heart";
    if (miniForm.forehead === "narrow" && miniForm.jaw === "wide") return "Triangle";
    if (miniForm.cheek === "high" && miniForm.forehead === "narrow" && miniForm.chin === "narrow") return "Diamond";
    if (miniForm.jaw === "soft" && miniForm.cheek === "soft") return "Round";
    return "Oval";
  }, [miniForm]);

  return (
    <div className="pc-wrap" ref={wrapRef}>
      {/* background blobs */}
      <div className="bg-blob a" aria-hidden />
      <div className="bg-blob b" aria-hidden />

      {/* hero */}
      <section className="hero reveal">
        <div className="hero-chip"><span className="dot" /> AI Beauty Advisor</div>
        <h1>Personal Color & Face Shape</h1>
        <p>เลือกสีและทรงผมที่ใช่—เริ่มจากเข้าใจโทนสีและรูปหน้าของคุณ</p>
        <div className="hero-cta">
          <a href="#quiz" className="btn-primary">ทำแบบทดสอบโครงหน้า</a>
          <a href="#seasons" className="btn-ghost">ดู 4 Seasons</a>
        </div>
      </section>

      {/* ----- Face Shape: Quiz & Mini Form ----- */}
      <section id="quiz" className="section reveal">
        <h3 className="sec-title">Face Shape · Quick Quiz</h3>
        <p className="sec-sub">ตอบคำถามสั้น ๆ 6 ข้อ เพื่อเดารูปหน้าของคุณ</p>

        {!quizResult ? (
          <FaceQuiz onResult={setQuizResult} />
        ) : (
          <FaceResult result={quizResult} onReset={() => setQuizResult(null)} />
        )}

        <div className="mini-or">หรือ</div>

        <div className="mini-form">
          <div className="mf-head">
            <h4>กรอกลักษณะเด่นแบบย่อ</h4>
            <p className="muted">ถ้ารู้ลักษณะตัวเองอยู่แล้ว เลือกตัวที่ใกล้เคียง</p>
          </div>
          <div className="mf-grid">
            <div className="mf-field">
              <label>หน้าผาก</label>
              <div className="chips">
                <button className={`chip ${miniForm.forehead==="wide"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,forehead:"wide"}))}>กว้าง</button>
                <button className={`chip ${miniForm.forehead==="narrow"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,forehead:"narrow"}))}>แคบ</button>
                <button className={`chip ${miniForm.forehead==="avg"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,forehead:"avg"}))}>ปกติ</button>
              </div>
            </div>
            <div className="mf-field">
              <label>โหนกแก้ม</label>
              <div className="chips">
                <button className={`chip ${miniForm.cheek==="high"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,cheek:"high"}))}>เด่น</button>
                <button className={`chip ${miniForm.cheek==="soft"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,cheek:"soft"}))}>นุ่ม/มน</button>
              </div>
            </div>
            <div className="mf-field">
              <label>แนวกราม</label>
              <div className="chips">
                <button className={`chip ${miniForm.jaw==="square"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,jaw:"square"}))}>เหลี่ยม</button>
                <button className={`chip ${miniForm.jaw==="wide"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,jaw:"wide"}))}>กว้าง</button>
                <button className={`chip ${miniForm.jaw==="soft"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,jaw:"soft"}))}>โค้งมน</button>
              </div>
            </div>
            <div className="mf-field">
              <label>คาง</label>
              <div className="chips">
                <button className={`chip ${miniForm.chin==="pointy"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,chin:"pointy"}))}>แหลม</button>
                <button className={`chip ${miniForm.chin==="narrow"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,chin:"narrow"}))}>แคบ</button>
                <button className={`chip ${miniForm.chin==="wide"?"active":""}`} onClick={()=>setMiniForm(m=>({...m,chin:"wide"}))}>กว้าง/ตรง</button>
              </div>
            </div>
          </div>

          {formShape && (
            <div className="mf-result">
              <div className="pill">คาดว่า: <b>{formShape}</b></div>
              <p className="muted">{FACE_GUIDE[formShape]?.traits}</p>
              <div className="mf-tip">
                <div>
                  <h5>แนะนำ</h5>
                  <ul className="mini-list">{FACE_GUIDE[formShape]?.do?.map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
                <div>
                  <h5>เลี่ยง</h5>
                  <ul className="mini-list">{FACE_GUIDE[formShape]?.avoid?.map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ----- Quick Learn (Personal Color) ----- */}
      <section id="start" className="section reveal">
        <h3 className="sec-title">Personal Color · Quick Learn</h3>
        <p className="sec-sub">ทำความเข้าใจ Personal Color แบบรวดเร็ว</p>
        <Accordion
          items={[
            { title: "What is Personal Color?", content: <WhatIsPC /> },
            { title: "Self-Check (Undertone & Test)", content: <SelfCheck /> },
          ]}
        />
      </section>

      {/* ----- Seasons ----- */}
      <section id="seasons" className="section reveal">
        <h3 className="sec-title">4 Seasons · สรุปเข้าใจง่าย</h3>
        <p className="sec-sub">ดูพาเลต ตัวอย่างสี และคำแนะนำหลัก</p>
        <div className="season-grid">{SEASONS.map((s) => <SeasonCard s={s} key={s.key} />)}</div>
      </section>

      {/* ----- Snapshot Table ----- */}
      <section className="section reveal">
        <h3 className="sec-title">Season Snapshot</h3>
        <p className="sec-sub">เทียบสั้น ๆ ในมุมมองรวม</p>
        <SeasonTable />
      </section>

      {/* ----- CTA ----- */}
      <section className="cta section reveal">
        <div className="cta-box">
          <h3>อยากรู้แบบละเอียดมากขึ้น?</h3>
          <p>ถ่ายรูปหน้าสดในแสงธรรมชาติ แล้วไปต่อที่หน้า Analysis เพื่อให้ระบบช่วยวิเคราะห์เชิงลึก</p>
          <div className="cta-actions">
            <a href="/analysis" className="btn-primary">ไปที่ Analysis</a>
            <a href="/advisor" className="btn-ghost">อ่านต่อ</a>
          </div>
        </div>
      </section>
    </div>
  );
}
