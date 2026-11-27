import React from "react";
import T from "./T.jsx";

export default function SectionHeading({ eyebrow, title, sub, action, className = "" }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`.trim()}>
      <div>
        {eyebrow && (
          <span className="eyebrow">
            <T id={eyebrow} />
          </span>
        )}
        {title && (
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <T id={title} />
          </h2>
        )}
        {sub && (
          <T id={sub} as="p" className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400" />
        )}
      </div>
      {action}
    </div>
  );
}
