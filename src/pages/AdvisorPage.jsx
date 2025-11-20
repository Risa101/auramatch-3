import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./AdvisorPage.css";
import advisor from "../locales/advisor.json";
/* ==========================================================
   =============== 1) Seasons (i18n version) ================
   ========================================================== */

const SEASONS = (t) => [
  {
    key: "Spring",
    name: t("advisor.season.Spring.name"),
    undertone: t("advisor.season.Spring.undertone"),
    desc: t("advisor.season.Spring.desc"),
    best: t("advisor.season.Spring.best", { returnObjects: true }),
    avoid: t("advisor.season.Spring.avoid", { returnObjects: true }),
    makeup: t("advisor.season.Spring.makeup", { returnObjects: true }),
    hair: t("advisor.season.Spring.hair", { returnObjects: true }),
    metal: t("advisor.season.Spring.metal"),
    palette: t("advisor.season.Spring.palette", { returnObjects: true }),
  },

  {
    key: "Summer",
    name: t("advisor.season.Summer.name"),
    undertone: t("advisor.season.Summer.undertone"),
    desc: t("advisor.season.Summer.desc"),
    best: t("advisor.season.Summer.best", { returnObjects: true }),
    avoid: t("advisor.season.Summer.avoid", { returnObjects: true }),
    makeup: t("advisor.season.Summer.makeup", { returnObjects: true }),
    hair: t("advisor.season.Summer.hair", { returnObjects: true }),
    metal: t("advisor.season.Summer.metal"),
    palette: t("advisor.season.Summer.palette", { returnObjects: true }),
  },

  {
    key: "Autumn",
    name: t("advisor.season.Autumn.name"),
    undertone: t("advisor.season.Autumn.undertone"),
    desc: t("advisor.season.Autumn.desc"),
    best: t("advisor.season.Autumn.best", { returnObjects: true }),
    avoid: t("advisor.season.Autumn.avoid", { returnObjects: true }),
    makeup: t("advisor.season.Autumn.makeup", { returnObjects: true }),
    hair: t("advisor.season.Autumn.hair", { returnObjects: true }),
    metal: t("advisor.season.Autumn.metal"),
    palette: t("advisor.season.Autumn.palette", { returnObjects: true }),
  },

  {
    key: "Winter",
    name: t("advisor.season.Winter.name"),
    undertone: t("advisor.season.Winter.undertone"),
    desc: t("advisor.season.Winter.desc"),
    best: t("advisor.season.Winter.best", { returnObjects: true }),
    avoid: t("advisor.season.Winter.avoid", { returnObjects: true }),
    makeup: t("advisor.season.Winter.makeup", { returnObjects: true }),
    hair: t("advisor.season.Winter.hair", { returnObjects: true }),
    metal: t("advisor.season.Winter.metal"),
    palette: t("advisor.season.Winter.palette", { returnObjects: true }),
  },
];

/* ==========================================================
   =============== 2) FACE GUIDE (i18n version) =============
   ========================================================== */

const FACE_GUIDE = (t) => ({
  Round: {
    traits: t("advisor.shape.Round.traits"),
    do: t("advisor.shape.Round.do", { returnObjects: true }),
    avoid: t("advisor.shape.Round.avoid", { returnObjects: true }),
  },
  Oval: {
    traits: t("advisor.shape.Oval.traits"),
    do: t("advisor.shape.Oval.do", { returnObjects: true }),
    avoid: t("advisor.shape.Oval.avoid", { returnObjects: true }),
  },
  Square: {
    traits: t("advisor.shape.Square.traits"),
    do: t("advisor.shape.Square.do", { returnObjects: true }),
    avoid: t("advisor.shape.Square.avoid", { returnObjects: true }),
  },
  Heart: {
    traits: t("advisor.shape.Heart.traits"),
    do: t("advisor.shape.Heart.do", { returnObjects: true }),
    avoid: t("advisor.shape.Heart.avoid", { returnObjects: true }),
  },
  Triangle: {
    traits: t("advisor.shape.Triangle.traits"),
    do: t("advisor.shape.Triangle.do", { returnObjects: true }),
    avoid: t("advisor.shape.Triangle.avoid", { returnObjects: true }),
  },
  Diamond: {
    traits: t("advisor.shape.Diamond.traits"),
    do: t("advisor.shape.Diamond.do", { returnObjects: true }),
    avoid: t("advisor.shape.Diamond.avoid", { returnObjects: true }),
  },
});

/* ==========================================================
   Helpers
   ========================================================== */
const IconChevron = ({ open }) => (
  <svg className={`chev ${open ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Tag = ({ children }) => <span className="tag">{children}</span>;
const Swatch = ({ color }) => <div className="swatch" style={{ background: color }} title={color} />;

/* ==========================================================
   =============== 3) QUIZ (i18n version) ====================
   ========================================================== */

const QUIZ = (t) => [
  {
    key: "ratio",
    q: t("advisor.quiz.ratio.q"),
    options: [
      { label: t("advisor.quiz.ratio.opt1"), score: { Round: 2, Square: 1 } },
      { label: t("advisor.quiz.ratio.opt2"), score: { Oval: 2, Diamond: 1 } },
      { label: t("advisor.quiz.ratio.opt3"), score: { Heart: 1, Triangle: 1, Oval: 1 } },
    ],
  },

  {
    key: "jaw",
    q: t("advisor.quiz.jaw.q"),
    options: [
      { label: t("advisor.quiz.jaw.opt1"), score: { Round: 2, Oval: 1 } },
      { label: t("advisor.quiz.jaw.opt2"), score: { Square: 2, Triangle: 1 } },
      { label: t("advisor.quiz.jaw.opt3"), score: { Heart: 2, Diamond: 1 } },
    ],
  },

  {
    key: "forehead",
    q: t("advisor.quiz.forehead.q"),
    options: [
      { label: t("advisor.quiz.forehead.opt1"), score: { Oval: 1, Round: 1, Square: 1 } },
      { label: t("advisor.quiz.forehead.opt2"), score: { Heart: 2, Oval: 1 } },
      { label: t("advisor.quiz.forehead.opt3"), score: { Triangle: 2, Diamond: 1 } },
    ],
  },

  {
    key: "cheekbone",
    q: t("advisor.quiz.cheekbone.q"),
    options: [
      { label: t("advisor.quiz.cheekbone.opt1"), score: { Diamond: 2, Oval: 1 } },
      { label: t("advisor.quiz.cheekbone.opt2"), score: { Oval: 1, Heart: 1 } },
      { label: t("advisor.quiz.cheekbone.opt3"), score: { Round: 1, Square: 1 } },
    ],
  },

  {
    key: "chin",
    q: t("advisor.quiz.chin.q"),
    options: [
      { label: t("advisor.quiz.chin.opt1"), score: { Round: 1, Oval: 1 } },
      { label: t("advisor.quiz.chin.opt2"), score: { Heart: 2, Diamond: 1 } },
      { label: t("advisor.quiz.chin.opt3"), score: { Square: 2, Triangle: 1 } },
    ],
  },

  {
    key: "overall",
    q: t("advisor.quiz.overall.q"),
    options: [
      { label: t("advisor.quiz.overall.opt1"), score: { Round: 1, Oval: 1 } },
      { label: t("advisor.quiz.overall.opt2"), score: { Square: 2, Diamond: 1 } },
      { label: t("advisor.quiz.overall.opt3"), score: { Heart: 2, Triangle: 1 } },
    ],
  },
];

/* ==========================================================
   =============== 4) Face Quiz Component ====================
   ========================================================== */

function FaceQuiz({ onResult }) {
  const { t } = useTranslation("advisor");

  const QUIZ_DATA = QUIZ(t);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const total = QUIZ_DATA.length;

  const q = QUIZ_DATA[step];
  const progress = Math.round((step / total) * 100);

  const pick = (k, opt) => {
    setAnswers((m) => ({ ...m, [k]: opt }));
    if (step < total - 1) setStep(step + 1);
  };

  const canFinish = Object.keys(answers).length === total;

  const compute = () => {
    const score = {
      Round: 0,
      Oval: 0,
      Square: 0,
      Heart: 0,
      Triangle: 0,
      Diamond: 0,
    };

    Object.values(answers).forEach((opt) => {
      Object.entries(opt.score).forEach(([shape, s]) => (score[shape] += s));
    });

    const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    onResult({ shape: winner, score });
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <div className="quiz">
      <div className="quiz-head">
        <div className="quiz-progress">
          <div className="quiz-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-count">
          {step + 1} / {total}
        </div>
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
          {t("advisor.quiz.restart")}
        </button>

        {step < total - 1 ? (
          <button
            className="btn-primary"
            onClick={() => step < total && setStep(step + 1)}
            disabled={!answers[q.key]}
          >
            {t("advisor.quiz.next")}
          </button>
        ) : (
          <button className="btn-primary" onClick={compute} disabled={!canFinish}>
            {t("advisor.quiz.finish")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   =============== 5) Face Result ============================
   ========================================================== */

function FaceResult({ result, onReset }) {
  const { t } = useTranslation("advisor");

  const shape = result?.shape || "Oval";
  const g = FACE_GUIDE(t)[shape];

  return (
    <div className="face-result">
      <div className="fr-head">
        <div className="fr-badge">{t("advisor.faceResult.badge")}</div>

        <h4>{t(`advisor.shape.${shape}.name`)}</h4>

        <p className="muted">{g?.traits}</p>
      </div>

      <div className="fr-grid">
        <div className="fr-card">
          <h5>{t("advisor.shape.do")}</h5>
          <ul className="mini-list">{g?.do?.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>

        <div className="fr-card">
          <h5>{t("advisor.shape.avoid")}</h5>
          <ul className="mini-list">{g?.avoid?.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      </div>

      <div className="fr-actions">
        <button className="btn-ghost" onClick={onReset}>
          {t("advisor.faceResult.retry")}
        </button>

        <a href="/analysis" className="btn-primary">
          {t("advisor.faceResult.toAnalysis")}
        </a>
      </div>
    </div>
  );
}
/* ==========================================================
   =============== 6) QUICK LEARN (i18n) =====================
   ========================================================== */

function WhatIsPC() {
  const { t } = useTranslation("advisor");

  return (
    <div className="content-grid">
      <div className="content-card">
        <h4>{t("advisor.learn.whatis.title")}</h4>
        <p>{t("advisor.learn.whatis.desc")}</p>

        <div className="pill-row">
          <Tag>{t("advisor.learn.whatis.tag.undertone")}</Tag>
          <Tag>{t("advisor.learn.whatis.tag.value")}</Tag>
          <Tag>{t("advisor.learn.whatis.tag.chroma")}</Tag>
          <Tag>{t("advisor.learn.whatis.tag.contrast")}</Tag>
        </div>
      </div>

      <div className="content-card">
        <h4>{t("advisor.learn.axis.title")}</h4>

        <ul className="bullet">
          <li><b>Undertone</b> — {t("advisor.learn.axis.undertone")}</li>
          <li><b>Value</b> — {t("advisor.learn.axis.value")}</li>
          <li><b>Chroma</b> — {t("advisor.learn.axis.chroma")}</li>
          <li><b>Contrast</b> — {t("advisor.learn.axis.contrast")}</li>
        </ul>
      </div>
    </div>
  );
}

function SelfCheck() {
  const { t } = useTranslation("advisor");

  return (
    <div className="content-grid">
      <div className="content-card">
        <h4>{t("advisor.learn.selfcheck.title1")}</h4>

        <ul className="bullet">
          <li>{t("advisor.learn.selfcheck.item1")}</li>
          <li>{t("advisor.learn.selfcheck.item2")}</li>
          <li>{t("advisor.learn.selfcheck.item3")}</li>
          <li>{t("advisor.learn.selfcheck.item4")}</li>
        </ul>

        <p className="muted">{t("advisor.learn.selfcheck.note")}</p>
      </div>

      <div className="content-card">
        <h4>{t("advisor.learn.selfcheck.title2")}</h4>

        <ul className="bullet">
          <li>{t("advisor.learn.selfcheck.test1")}</li>
          <li>{t("advisor.learn.selfcheck.test2")}</li>
          <li>{t("advisor.learn.selfcheck.test3")}</li>
          <li>{t("advisor.learn.selfcheck.test4")}</li>
        </ul>
      </div>
    </div>
  );
}

/* ==========================================================
   =============== 7) Accordion (i18n) =======================
   ========================================================== */

function Accordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = i === open;
        return (
          <div key={i} className={`acc-item ${isOpen ? "open" : ""}`}>
            <button
              className="acc-head"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <div className="acc-title">{it.title}</div>
              <IconChevron open={isOpen} />
            </button>

            <div
              className="acc-panel"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="acc-inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
/* ==========================================================
   =============== 8) Season Card (i18n) =====================
   ========================================================== */

function SeasonCard({ s }) {
  return (
    <div className="season-card">
      <div className="season-head">
        <h4>{s.name}</h4>
        <span className="undertone">{s.undertone}</span>
      </div>

      <p className="desc">{s.desc}</p>

      {/* Palette */}
      <div className="palette">
        {s.palette.map((c, i) => (
          <Swatch key={i} color={c} />
        ))}
      </div>

      <div className="grid-2">
        <div>
          <h5>Best</h5>
          <ul className="mini-list">
            {s.best.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5>Avoid</h5>
          <ul className="mini-list">
            {s.avoid.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5>Makeup</h5>
          <ul className="mini-list">
            {s.makeup.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5>Hair / Metal</h5>
          <p className="muted">{s.hair.join(" • ")} <br /> {s.metal}</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   =============== 9) Season Table (i18n) ====================
   ========================================================== */

function SeasonTable({ list }) {
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

      {list.map((s) => (
        <div key={s.key} className="st-row">
          <div><b>{s.name}</b></div>
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
