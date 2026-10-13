"use client";

import React from "react";

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Deep dark gradient canvas */}
      <div className="absolute inset-0 bg-[#06090f]" />

      {/* Subtle top ambient radial mask */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99, 102, 241, 0.25), rgba(15, 23, 42, 0) 80%)",
        }}
      />

      {/* Subtle secondary amber/rose glow in bottom right for depth */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-15"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, rgba(244, 63, 94, 0.2), transparent 70%)",
        }}
      />

      {/* Clean micro-dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
