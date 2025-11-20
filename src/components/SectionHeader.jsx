import React from "react";

export default function SectionHeader({ title, meta }) {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-[#75464A]">{title}</h3>
        <div className="h-[2px] flex-1 ml-2 headerLine" />
      </div>
      {meta && <div>{meta}</div>}
    </div>
  );
}
