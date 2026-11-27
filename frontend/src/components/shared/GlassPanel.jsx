import React from "react";

export default function GlassPanel({ as: Tag = "section", className = "", children, ...rest }) {
  return (
    <Tag className={`glass-panel ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
