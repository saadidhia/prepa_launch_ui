import React from "react";

export const Image = ({ name, price, description, subjects, fields, levels, largeImage, link }) => {
  return (
    <div style={{
      position: "relative",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      margin: "12px",
      background: "#1a1a2e",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
      }}
    >
      {/* Image */}
      <img
        src={link}
        alt={name}
        style={{
          width: "100%",
          minHeight: "clamp(200px, 40vw, 520px)",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(10,10,30,0.97) 0%, rgba(10,10,30,0.7) 60%, transparent 100%)",
        padding: "24px 18px 18px",
        direction: "rtl",
        textAlign: "right",
      }}>
        {/* Price badge */}
        <div style={{
          position: "absolute",
          top: "-18px",
          left: "16px",
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          color: "white",
          fontWeight: "bold",
          fontSize: "clamp(11px, 2vw, 15px)",
          padding: "5px 14px",
          borderRadius: "20px",
          boxShadow: "0 2px 8px rgba(249,115,22,0.5)",
        }}>
          Dt {price}
        </div>

        {/* Book name */}
        <h3 style={{
          color: "#ffffff",
          fontSize: "clamp(14px, 2.5vw, 20px)",
          margin: "0 0 8px 0",
          fontWeight: "700",
          lineHeight: 1.3,
        }}>
          {name}
        </h3>

        {/* Tags row */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", alignItems: "flex-end" }}>

          {/* Levels */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ color: "#a0aec0", fontSize: "clamp(9px, 1.5vw, 12px)", fontWeight: "600" }}>المستوى:</span>
            {(Array.isArray(levels) ? levels : [levels]).filter(Boolean).map((l, i) => (
              <span key={i} style={{
                background: "rgba(99,102,241,0.85)",
                color: "#e0e7ff",
                fontSize: "clamp(9px, 1.5vw, 13px)",
                padding: "3px 10px",
                borderRadius: "10px",
                fontWeight: "600",
              }}>{l}</span>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ color: "#a0aec0", fontSize: "clamp(9px, 1.5vw, 12px)", fontWeight: "600" }}>الشعب:</span>
            {(Array.isArray(fields) ? fields : [fields]).filter(Boolean).map((f, i) => (
              <span key={i} style={{
                background: "rgba(16,185,129,0.8)",
                color: "#d1fae5",
                fontSize: "clamp(9px, 1.5vw, 13px)",
                padding: "3px 10px",
                borderRadius: "10px",
                fontWeight: "600",
              }}>{f}</span>
            ))}
          </div>

          {/* Subjects */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ color: "#a0aec0", fontSize: "clamp(9px, 1.5vw, 12px)", fontWeight: "600" }}>المواد:</span>
            {(Array.isArray(subjects) ? subjects : [subjects]).filter(Boolean).map((s, i) => (
              <span key={i} style={{
                background: "rgba(245,158,11,0.8)",
                color: "#fef3c7",
                fontSize: "clamp(9px, 1.5vw, 13px)",
                padding: "3px 10px",
                borderRadius: "10px",
                fontWeight: "600",
              }}>{s}</span>
            ))}
          </div>

        </div>

        {/* Description */}
        {description && (
          <p style={{
            color: "#94a3b8",
            fontSize: "clamp(10px, 1.8vw, 14px)",
            margin: 0,
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};