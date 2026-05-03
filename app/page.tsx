"use client";

import React, { useState, useEffect, useCallback } from "react";
import AllergyInput from "./components/AllergyInput";
import ScanScreen from "./components/ScanScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultsScreen, {
  type FoodAnalysisResult,
} from "./components/ResultsScreen";

/**
 * App State Machine:
 *
 * ALLERGY_INPUT → User enters allergy data (first-time or edit)
 * SCAN          → Camera/upload screen (core experience)
 * PROCESSING    → AI analysis in progress
 * RESULTS       → Risk visualization + explanation
 *
 * Transitions:
 * - On load: if localStorage has allergies → SCAN, else → ALLERGY_INPUT
 * - ALLERGY_INPUT → SCAN (on save)
 * - SCAN → PROCESSING (on analyze)
 * - PROCESSING → RESULTS (on complete)
 * - RESULTS → SCAN (on re-scan)
 * - SCAN → ALLERGY_INPUT (on edit allergies)
 */

type AppState = "ALLERGY_INPUT" | "SCAN" | "PROCESSING" | "RESULTS";

const STORAGE_KEY = "allergy_list";

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [allergies, setAllergies] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [results, setResults] = useState<FoodAnalysisResult[]>([]);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        setAllergies(saved);
        setAppState("SCAN");
      } else {
        setAppState("ALLERGY_INPUT");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveAllergies = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setAllergies(value);
    setAppState("SCAN");
  }, []);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData || null);
  }, []);

  const handleEditAllergy = useCallback(() => {
    setAppState("ALLERGY_INPUT");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!capturedImage) return;
    setAppState("PROCESSING");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          allergies,
        }),
      });

      if (!response.ok) {
        setErrorStatus(response.status);
        setResults([]);
        setAppState("RESULTS");
        return;
      }

      const data = await response.json();
      setResults(data.results || []);
      setErrorStatus(null);
      setAppState("RESULTS");
    } catch {
      setErrorStatus(500);
      setResults([]);
      setAppState("RESULTS");
    }
  }, [capturedImage, allergies]);

  const handleRescan = useCallback(() => {
    setCapturedImage(null);
    setResults([]);
    setErrorStatus(null);
    setAppState("SCAN");
  }, []);

  // Loading splash — dark branded
  if (appState === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh]">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
            <svg
              width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="black" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
            Food Lens AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deteksi alergen cerdas
          </p>
        </div>
      </div>
    );
  }

  switch (appState) {
    case "ALLERGY_INPUT":
      return (
        <AllergyInput initialValue={allergies} onSave={handleSaveAllergies} />
      );
    case "SCAN":
      return (
        <ScanScreen
          onCapture={handleCapture}
          onEditAllergy={handleEditAllergy}
          capturedImage={capturedImage}
          onAnalyze={handleAnalyze}
        />
      );
    case "PROCESSING":
      return <ProcessingScreen />;
    case "RESULTS":
      return (
        <ResultsScreen
          results={results}
          errorStatus={errorStatus}
          onRescan={handleRescan}
          onRetry={handleAnalyze}
        />
      );
  }
}
