"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GameProvider, useGame } from "@/context/GameContext";
import { GameBoard } from "@/components/game/GameBoard";
import { RoomView } from "@/components/game/RoomView";
import { InterviewPanel } from "@/components/game/InterviewPanel";
import { EvidencePanel } from "@/components/game/EvidencePanel";
import { AccusationDialog } from "@/components/game/AccusationDialog";
import { ResultScreen } from "@/components/game/ResultScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function GameContent() {
  const { state, startGame } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch("/api/game/new");
        if (!response.ok) {
          throw new Error("Failed to load game");
        }
        const data = await response.json();

        // Adjust actions based on difficulty
        const difficulty = searchParams.get("difficulty") || "easy";
        const maxActions = difficulty === "medium" ? 25 : 50;
        data.caseData.maxActions = maxActions;

        startGame(data.caseData);
      } catch (err) {
        setError("Failed to load the game. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (state.phase === "menu") {
      loadGame();
    } else {
      setIsLoading(false);
    }
  }, [state.phase, startGame, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 dark:bg-slate-950">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading case files...</p>
            <p className="text-sm text-slate-400 mt-2">
              Preparing Murder at Blackwood Manor
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 dark:bg-slate-950">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full-screen views (no sidebar)
  if (state.phase === "evidence") {
    return (
      <main className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <EvidencePanel />
        </div>
      </main>
    );
  }

  if (state.phase === "accusation") {
    return (
      <main className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <AccusationDialog />
        </div>
      </main>
    );
  }

  if (state.phase === "result") {
    return (
      <main className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <ResultScreen />
        </div>
      </main>
    );
  }

  // Main game view - 2 column layout
  return (
    <main className="min-h-screen bg-slate-950 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-xl font-bold font-serif text-white">{state.caseData?.title}</h1>
          <p className="text-slate-400 text-sm">
            {state.caseData?.introduction}
          </p>
        </header>

        {/* 2-Column Layout */}
        <div className="flex gap-4">
          {/* Left Sidebar - Navigation & Evidence */}
          <aside className="w-80 flex-shrink-0 space-y-4">
            <GameBoard />
          </aside>

          {/* Right Main - Room View or Interview */}
          <div className="flex-1 min-w-0">
            {state.phase === "interview" ? <InterviewPanel /> : <RoomView />}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GamePage() {
  return (
    <GameProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-400">Loading...</p>
        </div>
      }>
        <GameContent />
      </Suspense>
    </GameProvider>
  );
}
