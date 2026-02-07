"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Users, FileText, Clock, Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("easy");

  const handleNewGame = async () => {
    setIsLoading(true);
    router.push(`/game?difficulty=${difficulty}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4 font-serif text-white">
            Murder Mystery
          </h1>
          <p className="text-xl text-slate-400 max-w-prose mx-auto">
            Gather clues, interrogate suspects, solve the case.
          </p>
        </div>

        {/* Start Game Card */}
        <div className="mb-12 bg-slate-900 rounded-lg border border-slate-800 p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-serif text-white">
              Murder at Blackwood Manor
            </h2>
            <p className="text-slate-400 max-w-prose mx-auto">
              Lord Edmund Blackwood has been murdered. The suspects await your
              interrogation.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <span className="inline-flex items-center rounded-full bg-slate-800 text-slate-200 text-sm py-1 px-3">
                <Users className="h-4 w-4 mr-1" />5 Suspects
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-800 text-slate-200 text-sm py-1 px-3">
                <FileText className="h-4 w-4 mr-1" />
                15 Clues
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-800 text-slate-200 text-sm py-1 px-3">
                <Clock className="h-4 w-4 mr-1" />
                ~20 mins
              </span>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDifficulty("easy")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  difficulty === "easy"
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Easy (50 actions)
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  difficulty === "medium"
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Medium (25 actions)
              </button>
            </div>
            <div className="pt-4">
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={handleNewGame}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Start Investigation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          <h2 className="text-2xl font-serif text-white mb-6">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white">Explore the Manor</h4>
                  <p className="text-sm text-slate-400">
                    Search different rooms to uncover clues and locate suspects.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white">Gather Evidence</h4>
                  <p className="text-sm text-slate-400">
                    Inspect objects to reveal vital details about the crime.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white">Interview Suspects</h4>
                  <p className="text-sm text-slate-400">
                    Question suspects on their alibis and confront them with facts.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-white">Make Your Accusation</h4>
                  <p className="text-sm text-slate-400">
                    Identify the killer, weapon, and location to win the game.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <p className="text-sm text-center text-slate-400">
              <strong className="text-white">Tip:</strong> Investigate strategically.
              Every room visit and question costs an action.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-slate-400">
          <p>Suspects respond dynamically via AI</p>
        </footer>
      </div>
    </main>
  );
}
