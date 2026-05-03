/**
 * Icon re-exports from react-icons
 * All icons are wrapped to maintain the same API (size, className, strokeWidth)
 */

import React from "react";
import {
  LuCamera,
  LuUpload,
  LuImage,
  LuTriangleAlert,
  LuCircleCheck,
  LuShield,
  LuShieldCheck,
  LuPencil,
  LuScanLine,
  LuCircleX,
  LuRefreshCw,
  LuSearch,
  LuChevronLeft,
  LuInfo,
  LuSparkles,
} from "react-icons/lu";
import {
  GiPeanut,
  GiMilkCarton,
  GiShrimp,
  GiWheat,
  GiRawEgg,
  GiPlantSeed,
} from "react-icons/gi";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function wrap(
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>,
  defaultSize = 24
) {
  const Wrapped = ({ size = defaultSize, className, strokeWidth }: IconProps) => (
    <Icon size={size} className={className} strokeWidth={strokeWidth} />
  );
  Wrapped.displayName = Icon.displayName || "WrappedIcon";
  return Wrapped;
}

function wrapFilled(
  Icon: React.ComponentType<{ size?: number; className?: string }>,
  defaultSize = 24
) {
  const Wrapped = ({ size = defaultSize, className }: IconProps) => (
    <Icon size={size} className={className} />
  );
  Wrapped.displayName = Icon.displayName || "WrappedFilledIcon";
  return Wrapped;
}

// General UI icons (Lucide-style)
export const CameraIcon = wrap(LuCamera);
export const UploadIcon = wrap(LuUpload);
export const ImageIcon = wrap(LuImage);
export const AlertTriangleIcon = wrap(LuTriangleAlert);
export const CheckCircleIcon = wrap(LuCircleCheck);
export const ShieldIcon = wrap(LuShield);
export const ShieldCheckIcon = wrap(LuShieldCheck);
export const EditIcon = wrap(LuPencil);
export const ScanIcon = wrap(LuScanLine);
export const XCircleIcon = wrap(LuCircleX);
export const RefreshIcon = wrap(LuRefreshCw);
export const SearchIcon = wrap(LuSearch);
export const ChevronLeftIcon = wrap(LuChevronLeft);
export const InfoIcon = wrap(LuInfo);
export const SparklesIcon = wrap(LuSparkles);

// Allergen-specific icons (Game Icons — filled)
export const PeanutIcon = wrapFilled(GiPeanut);
export const MilkIcon = wrapFilled(GiMilkCarton);
export const ShrimpIcon = wrapFilled(GiShrimp);
export const WheatIcon = wrapFilled(GiWheat);
export const EggIcon = wrapFilled(GiRawEgg);
export const SoyIcon = wrapFilled(GiPlantSeed);
