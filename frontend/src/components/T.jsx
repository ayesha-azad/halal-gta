import React from "react";
import { useAppStore } from "../store.js";
import { tr } from "../i18n.js";

export default function T({ id, as: Tag = "span", className = "", ...rest }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <Tag
      dir={lang === "ur" ? "rtl" : undefined}
      className={`${className} ${lang === "ur" ? "urdu-text" : ""}`.trim()}
      {...rest}
    >
      {tr(lang, id)}
    </Tag>
  );
}

export function Translated({ value, className = "", as: Tag = "span", ...rest }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <Tag
      dir={lang === "ur" ? "rtl" : undefined}
      className={`${className} ${lang === "ur" ? "urdu-text" : ""}`.trim()}
      {...rest}
    >
      {value}
    </Tag>
  );
}
