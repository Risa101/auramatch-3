import React from "react";

export function Card({ children, className }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
