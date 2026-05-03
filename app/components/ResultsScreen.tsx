"use client";

import React from "react";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  RefreshIcon,
  ShieldCheckIcon,
  CameraIcon,
  PeanutIcon,
  MilkIcon,
  ShrimpIcon,
  WheatIcon,
  EggIcon,
  SoyIcon,
} from "./Icons";

export type RiskLevel = "high" | "medium" | "low";

export interface AllergenInfo {
  name: string;
  icon: string;
  isUserAllergen: boolean;
}

export interface FoodAnalysisResult {
  name: string;
  description: string;
  risk: RiskLevel;
  allergens: AllergenInfo[];
  explanation: string;
  confidence: number;
}

interface ResultsScreenProps {
  results: FoodAnalysisResult[];
  errorStatus?: number | null;
  onRescan: () => void;
  onRetry?: () => void;
}

const RISK_CONFIG = {
  high: {
    label: "Risiko Tinggi",
    badgeClass: "risk-badge risk-badge--high",
    boxBg: "rgba(255, 77, 79, 0.1)",
    boxBorder: "rgba(255, 77, 79, 0.25)",
    boxText: "#FF7875",
    Icon: AlertTriangleIcon,
  },
  medium: {
    label: "Perlu Hati-hati",
    badgeClass: "risk-badge risk-badge--medium",
    boxBg: "rgba(255, 197, 61, 0.1)",
    boxBorder: "rgba(255, 197, 61, 0.25)",
    boxText: "#FFD666",
    Icon: InfoIcon,
  },
  low: {
    label: "Aman",
    badgeClass: "risk-badge risk-badge--low",
    boxBg: "rgba(82, 196, 26, 0.1)",
    boxBorder: "rgba(82, 196, 26, 0.25)",
    boxText: "#73D13D",
    Icon: CheckCircleIcon,
  },
};

const ALLERGEN_ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  kacang: PeanutIcon,
  susu: MilkIcon,
  seafood: ShrimpIcon,
  udang: ShrimpIcon,
  ikan: ShrimpIcon,
  gluten: WheatIcon,
  gandum: WheatIcon,
  telur: EggIcon,
  kedelai: SoyIcon,
};

function getAllergenIcon(iconName: string) {
  return ALLERGEN_ICON_MAP[iconName.toLowerCase()] || InfoIcon;
}

function FoodCard({ item, index }: { item: FoodAnalysisResult; index: number }) {
  const config = RISK_CONFIG[item.risk];
  const RiskIcon = config.Icon;

  return (
    <div
      className={`glass-card-static overflow-hidden animate-slide-up opacity-0 stagger-${Math.min(index + 1, 8)}`}
      style={{ animationFillMode: "forwards" }}
    >
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-snug">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {item.description}
            </p>
          </div>
          <div className={config.badgeClass}>
            <RiskIcon size={14} />
            {config.label}
          </div>
        </div>

        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[...item.allergens]
              .sort((a, b) => (b.isUserAllergen ? 1 : 0) - (a.isUserAllergen ? 1 : 0))
              .map((allergen) => {
              const AllergenIconComponent = getAllergenIcon(allergen.icon);
              return (
                <div
                  key={allergen.name}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                    allergen.isUserAllergen
                      ? "bg-danger/15 text-[#FF7875] border-danger/30"
                      : "bg-white/5 text-white/80 border-white/5"
                  }`}
                >
                  <AllergenIconComponent size={14} className={allergen.isUserAllergen ? "text-[#FF7875]" : "text-muted-foreground"} />
                  {allergen.name}
                  {allergen.isUserAllergen && (
                    <span className="text-[10px] ml-0.5 opacity-80">⚠</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div
        className="mx-4 mb-4 px-3.5 py-3 rounded-xl flex items-start gap-2.5"
        style={{ background: config.boxBg, border: `1px solid ${config.boxBorder}` }}
      >
        <RiskIcon size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="text-[13px] leading-relaxed font-medium" style={{ color: config.boxText }}>
          {item.explanation}
        </p>
      </div>

      {/* Confidence */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${item.confidence}%`,
              background:
                item.confidence >= 80
                  ? "var(--color-safe)"
                  : item.confidence >= 60
                    ? "var(--color-caution)"
                    : "var(--color-danger)",
            }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Keyakinan AI: {item.confidence}%
        </span>
      </div>
    </div>
  );
}

export default function ResultsScreen({
  results,
  errorStatus,
  onRescan,
  onRetry,
}: ResultsScreenProps) {
  const sortedResults = [...results].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  const highCount = results.filter((r) => r.risk === "high").length;
  const mediumCount = results.filter((r) => r.risk === "medium").length;
  const safeCount = results.filter((r) => r.risk === "low").length;

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 animate-fade-in">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheckIcon size={24} />
          <h1 className="text-lg font-bold text-white font-[family-name:var(--font-display)]">
            Hasil Analisis
          </h1>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="flex gap-2">
          {highCount > 0 && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-danger/10 border border-danger/25 rounded-xl">
              <AlertTriangleIcon size={14} className="text-[#FF7875]" />
              <span className="text-xs font-bold text-[#FF7875]">{highCount} Bahaya</span>
            </div>
          )}
          {mediumCount > 0 && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-caution/10 border border-caution/25 rounded-xl">
              <InfoIcon size={14} className="text-[#FFD666]" />
              <span className="text-xs font-bold text-[#FFD666]">{mediumCount} Hati-hati</span>
            </div>
          )}
          {safeCount > 0 && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-safe/10 border border-safe/25 rounded-xl">
              <CheckCircleIcon size={14} className="text-[#73D13D]" />
              <span className="text-xs font-bold text-[#73D13D]">{safeCount} Aman</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 px-5 pb-32 space-y-3">
        {sortedResults.map((item, index) => (
          <FoodCard key={`${item.name}-${index}`} item={item} index={index} />
        ))}

        {results.length === 0 && !errorStatus && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <InfoIcon size={48} className="text-white/20 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Menu Tidak Terbaca
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Kami tidak dapat mendeteksi item menu. Coba foto lebih jelas atau
              dengan pencahayaan lebih baik.
            </p>
          </div>
        )}

        {errorStatus === 502 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <RefreshIcon size={48} className="text-white/20 mb-4 animate-spin-slow" />
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Timeout
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Layanan AI sedang sibuk atau butuh waktu lebih lama. Silakan coba lagi sebentar lagi.
            </p>
          </div>
        )}

        {errorStatus && errorStatus !== 502 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <AlertTriangleIcon size={48} className="text-danger/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Gagal memproses menu (Error {errorStatus}). Silakan coba lagi.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent pb-[calc(20px+env(safe-area-inset-bottom,0px))] flex flex-col gap-3">
        {errorStatus ? (
          <>
            <button
              type="button"
              onClick={onRetry}
              className="btn-premium w-full py-4 text-base flex items-center justify-center gap-2"
              style={{ minHeight: "52px" }}
              id="retry-btn"
            >
              <RefreshIcon size={20} />
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={onRescan}
              className="w-full py-3 text-sm text-white/40 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
              id="rescan-secondary-btn"
            >
              <CameraIcon size={16} />
              Ambil Foto Ulang
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRescan}
            className="btn-premium w-full py-4 text-base flex items-center justify-center gap-2"
            style={{ minHeight: "52px" }}
            id="rescan-btn"
          >
            <RefreshIcon size={20} />
            Pindai Ulang
          </button>
        )}
      </div>
    </div>
  );
}
