import React from "react";

export default function MagneticButton({ children, className = "", style, ...props }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const strength = 18;
    const handle = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    };
    const reset = () => (el.style.transform = "translate(0,0)");
    el.addEventListener("mousemove", handle);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <button
      ref={ref}
      {...props}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
      style={{
        background: "#FFB3C6",
        color: "#75464A",
        border: "1px solid #E6DCEB",
        boxShadow: "0 8px 18px rgba(255,179,198,.45)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
