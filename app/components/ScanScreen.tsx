"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CameraIcon,
  ImageIcon,
  UploadIcon,
  EditIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "./Icons";

type Tab = "camera" | "upload";
type CameraPermission = "prompt" | "granted" | "denied" | "loading";

interface ScanScreenProps {
  onCapture: (imageData: string) => void;
  onEditAllergy: () => void;
  capturedImage: string | null;
  onAnalyze: () => void;
}

export default function ScanScreen({
  onCapture,
  onEditAllergy,
  capturedImage,
  onAnalyze,
}: ScanScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermission>("loading");
  const [showFlash, setShowFlash] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Only show loading spinner on first attempt — don't reset to loading
    // if already granted, to avoid unmounting the video element
    setCameraPermission((prev) => (prev === "granted" ? "granted" : "loading"));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      // Try to connect immediately (may work if video is already mounted)
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraPermission("granted");
    } catch {
      setCameraPermission("denied");
    }
  }, []);

  // Connect stream to video element when BOTH are available.
  // Handles the case where video mounts AFTER the stream is ready.
  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current && !node.srcObject) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (activeTab === "camera" && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, capturedImage, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    if (navigator.vibrate) navigator.vibrate(50);
    stopCamera();
    onCapture(dataUrl);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleTabSwitch = (tab: Tab) => {
    if (tab === activeTab) return;
    if (tab === "upload") stopCamera();
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 animate-fade-in">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheckIcon size={24} />
          <h1 className="text-lg font-bold text-white font-[family-name:var(--font-display)]">
            Pindai Menu
          </h1>
        </div>
        <button
          type="button"
          onClick={onEditAllergy}
          className="btn-glass flex items-center gap-1.5 px-3 py-2 text-sm"
          id="edit-allergy-btn"
        >
          <EditIcon size={16} />
          Edit Alergi
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => handleTabSwitch("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "camera"
                ? "bg-primary text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                : "text-white/50 hover:text-white/80"
            }`}
            role="tab"
            aria-selected={activeTab === "camera"}
            id="tab-camera"
          >
            <CameraIcon size={18} />
            Kamera
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "upload"
                ? "bg-primary text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                : "text-white/50 hover:text-white/80"
            }`}
            role="tab"
            aria-selected={activeTab === "upload"}
            id="tab-upload"
          >
            <ImageIcon size={18} />
            Unggah
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        className="flex-1 px-5 pb-32 animate-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        {activeTab === "camera" ? (
          <div className="flex flex-col items-center">
            {capturedImage ? (
              /* Captured Preview */
              <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-4 animate-scale-in border border-white/10">
                <img
                  src={capturedImage}
                  alt="Foto menu yang diambil"
                  className="w-full object-contain max-h-[70dvh]"
                />
                <button
                  type="button"
                  onClick={() => onCapture("")}
                  className="absolute top-3 right-3 btn-glass flex items-center gap-1.5 px-3 py-2 text-xs"
                  id="retake-btn"
                >
                  <CameraIcon size={14} />
                  Ambil Ulang
                </button>
              </div>
            ) : cameraPermission === "granted" ? (
              /* Live Camera */
              <div className="relative w-full">
                <div className="camera-viewfinder rounded-2xl overflow-hidden bg-black border border-white/10">
                  <video
                    ref={videoRefCallback}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-[70dvh] object-cover"
                  />
                  {showFlash && (
                    <div className="absolute inset-0 bg-white animate-flash z-10" />
                  )}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3 mb-4">
                  Arahkan ke menu dengan jelas
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="w-[72px] h-[72px] rounded-full bg-primary flex items-center justify-center animate-pulse-ring cursor-pointer active:scale-[0.97]"
                    style={{ boxShadow: "0 0 30px rgba(74, 222, 128, 0.4)" }}
                    aria-label="Ambil foto"
                    id="capture-btn"
                  >
                    <div className="w-[58px] h-[58px] rounded-full border-[3px] border-black flex items-center justify-center">
                      <CameraIcon size={24} className="text-black" />
                    </div>
                  </button>
                </div>
              </div>
            ) : cameraPermission === "denied" ? (
              /* Permission Denied */
              <div className="glass-card-static w-full p-6 text-center animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-caution/15 flex items-center justify-center mx-auto mb-4">
                  <CameraIcon size={28} className="text-caution" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Akses Kamera Dibutuhkan
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Kami butuh akses kamera untuk scan menu restoranmu.
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn-premium w-full py-3.5 text-sm"
                    style={{ minHeight: "48px" }}
                    id="allow-camera-btn"
                  >
                    Izinkan Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("upload")}
                    className="btn-glass w-full py-3.5 text-sm"
                    style={{ minHeight: "48px" }}
                    id="fallback-upload-btn"
                  >
                    Gunakan Upload
                  </button>
                </div>
              </div>
            ) : (
              /* Loading Camera */
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden animate-shimmer border border-white/10">
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Memuat kamera...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Upload Tab */
          <div className="animate-fade-in">
            {capturedImage ? (
              <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-4 animate-scale-in border border-white/10">
                <img
                  src={capturedImage}
                  alt="Foto menu yang diupload"
                  className="w-full object-contain max-h-[70dvh]"
                />
                <button
                  type="button"
                  onClick={() => onCapture("")}
                  className="absolute top-3 right-3 btn-glass flex items-center gap-1.5 px-3 py-2 text-xs"
                  id="remove-upload-btn"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <div
                className={`drop-zone flex flex-col items-center justify-center py-16 px-6 ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                id="upload-zone"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UploadIcon size={28} className="text-primary" />
                </div>
                <p className="text-base font-semibold text-white mb-1">
                  Unggah foto menu
                </p>
                <p className="text-sm text-muted-foreground">
                  Ketuk untuk memilih atau seret & lepas
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  id="file-input"
                  aria-label="Pilih foto menu"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!capturedImage}
          className={`w-full py-4 text-base font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            capturedImage
              ? "btn-premium"
              : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
          }`}
          style={{ minHeight: "52px" }}
          id="analyze-btn"
        >
          <SparklesIcon
            size={20}
            className={capturedImage ? "" : "opacity-40"}
          />
          Analisis Menu
        </button>
      </div>
    </div>
  );
}
