import React from "react";
import { useAppStore } from "../store.js";

export default function FloatingInput({ label, value, onChange, type = "text", name, className = "", ...rest }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <label className={`floating-field ${lang === "ur" ? "is-urdu" : ""} ${className}`.trim()}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        dir={lang === "ur" ? "rtl" : "ltr"}
        {...rest}
      />
      <span dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
        {label}
      </span>
    </label>
  );
}
