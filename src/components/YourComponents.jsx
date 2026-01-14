// src/components/YourComponents.jsx
import React from "react";

// MagneticButton component
export function MagneticButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md"
      style={{
        background: "#FFB3C6",
        color: "#75464A",
        border: `1px solid #E6DCEB`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ShimmerCard component
export function ShimmerCard({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl p-5 shadow-sm bg-white ${className}`}
      style={{
        background: "linear-gradient(90deg, #FADCDC, #E6DCEB, #ffd2e1, #d4c6ff)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
