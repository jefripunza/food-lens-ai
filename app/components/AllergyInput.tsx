"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheckIcon, SparklesIcon } from "./Icons";

interface AllergyInputProps {
  initialValue: string;
  onSave: (allergies: string) => void;
}

const EXAMPLE_CHIPS = [
  "Kacang tanah",
  "Susu sapi",
  "Udang",
  "Gluten",
  "Telur",
  "Kedelai",
  "Keong",
  "Wijen",
  "Kepiting",
  "Kerang",
  "Kacang mete",
  "Kacang almond",
  "Mustard",
  "Lobster",
  "Cumi-cumi",
  "Susu kedelai",
];

export default function AllergyInput({
  initialValue,
  onSave,
}: AllergyInputProps) {
  const [value, setValue] = useState(initialValue);
  const [showWarning, setShowWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = initialValue.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleChipClick = (chip: string) => {
    const current = value.trim();
    if (
      current
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .includes(chip.toLowerCase())
    ) {
      return;
    }
    const newValue = current ? `${current}, ${chip}` : chip;
    setValue(newValue);
    setShowWarning(false);
    textareaRef.current?.focus();
  };

  const handleSave = () => {
    if (!value.trim()) {
      setShowWarning(true);
      return;
    }
    onSave(value.trim());
  };

  const activeChips = value
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-center px-5 pt-14 pb-2 animate-fade-in">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheckIcon size={28} />
          <span className="text-base font-semibold tracking-wide font-[family-name:var(--font-display)]">
            Food Lens AI
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-32 animate-slide-up">
        {/* Hero Text */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white leading-tight mb-2 font-[family-name:var(--font-display)]">
            {isEditing
              ? "Edit data alergimu"
              : "Apa saja yang membuat kamu alergi?"}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Tulis bebas, kami akan menyesuaikan analisis AI untuk keamananmu
          </p>
        </div>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.trim()) setShowWarning(false);
            }}
            placeholder="Contoh: kacang tanah, susu, udang, gluten..."
            className={`textarea-grow w-full px-4 py-3.5 text-base text-white bg-white/5 border-2 rounded-2xl outline-none transition-all duration-200 placeholder:text-white/30 backdrop-blur-sm ${
              showWarning
                ? "border-danger animate-shake"
                : "border-white/10 focus:border-primary/50"
            }`}
            aria-label="Daftar alergi"
            id="allergy-input"
          />
          {showWarning && (
            <p
              className="mt-2 text-sm text-danger animate-fade-in flex items-center gap-1.5"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Masukkan minimal satu alergi untuk melanjutkan
            </p>
          )}
        </div>

        {/* Example Chips */}
        <div className="mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
            Contoh Alergen Umum
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((chip) => {
              const isActive = activeChips.includes(chip.toLowerCase());
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? "bg-primary text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                      : "bg-white/5 text-white/80 border border-white/10 hover:border-primary/30 hover:text-primary"
                  }`}
                  aria-pressed={isActive}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={handleSave}
          className="btn-premium w-full py-4 text-base flex items-center justify-center gap-2"
          style={{ minHeight: "52px" }}
          id="save-allergy-btn"
        >
          <SparklesIcon size={20} />
          {isEditing ? "Simpan & Kembali ke Scan" : "Simpan & Lanjut Scan"}
        </button>
      </div>
    </div>
  );
}
