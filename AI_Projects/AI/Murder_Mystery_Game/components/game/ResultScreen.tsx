"use client";

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Skull, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export function ResultScreen() {
  const { state, resetGame } = useGame();

  if (!state.result) return null;

  const { won, message, narrative } = state.result;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card
        className={`border-2 ${
          won
            ? "border-green-500 bg-green-100 dark:bg-green-950/50"
            : "border-red-500 bg-red-100 dark:bg-red-950/50"
        }`}
      >
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {won ? (
              <Trophy className="h-16 w-16 text-green-600 dark:text-green-400" />
            ) : (
              <Skull className="h-16 w-16 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle
            className={`text-3xl ${won ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {message}
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            {won
              ? "Justice has been served."
              : "The murderer has escaped justice."}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {narrative.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {state.discoveredClues.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clues Found</p>
            </div>
            <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {state.interviewedSuspects.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Suspects Interviewed</p>
            </div>
            <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(state.caseData?.maxActions || 25) - state.actionsRemaining}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Actions Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Main Menu
          </Button>
        </Link>
        <Button onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
