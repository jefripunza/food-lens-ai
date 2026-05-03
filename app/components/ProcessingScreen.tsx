"use client";

import React from "react";
import { ScanIcon, ShieldCheckIcon } from "./Icons";

export default function ProcessingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5">
      {/* Logo */}
      <div className="flex items-center gap-2 text-primary mb-12 animate-fade-in">
        <ShieldCheckIcon size={28} />
        <span className="text-base font-semibold tracking-wide font-[family-name:var(--font-display)]">
          Food Lens AI
        </span>
      </div>

      {/* Scanner Animation */}
      <div className="relative w-48 h-48 mb-10 animate-scale-in">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-3xl border-2 border-primary/20" />

        {/* Scanning area */}
        <div className="absolute inset-3 rounded-2xl bg-primary/5 overflow-hidden">
          {/* Scan line */}
          <div
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line"
            style={{ filter: "blur(0.5px)" }}
          />
          {/* Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-primary" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-primary" />
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-primary" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-primary" />
          </div>
        </div>

        {/* Corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-lg" />

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse-ring p-4 rounded-2xl bg-primary/10">
            <ScanIcon size={32} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center animate-slide-up">
        <h2 className="text-lg font-bold text-white mb-2 font-[family-name:var(--font-display)]">
          Menganalisis Menu
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Mendeteksi alergen berdasarkan data alergimu...
        </p>
        <div className="dot-loading flex items-center justify-center gap-2 mb-4">
          <span />
          <span />
          <span />
        </div>
        {/* <p className="text-xs text-white/30">
          Biasanya &lt; 10 detik
        </p> */}
      </div>
    </div>
  );
}
