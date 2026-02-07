"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSuspect, getClue } from "@/lib/game/reducer";
import { getQuestionLabel } from "@/lib/game/prompts";
import { QuestionType } from "@/types/game";
import {
  ArrowLeft,
  MapPin,
  Users,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";

export function InterviewPanel() {
  const { state, askQuestion, endInterview, isLoading } = useGame();
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);

  if (!state.currentSuspectId || !state.caseData) return null;

  const suspect = getSuspect(state, state.currentSuspectId);
  if (!suspect) return null;

  const conversation = state.conversations[state.currentSuspectId] || [];

  const handleAskQuestion = async (type: QuestionType) => {
    if (type === "evidence" && selectedClueId) {
      await askQuestion(type, selectedClueId);
      setSelectedClueId(null);
    } else if (type !== "evidence") {
      await askQuestion(type);
    }
  };

  const questionButtons: { type: QuestionType; icon: React.ReactNode; label: string }[] = [
    { type: "whereabouts", icon: <MapPin className="h-4 w-4" />, label: "Where were you?" },
    { type: "relationship", icon: <Users className="h-4 w-4" />, label: "About the victim" },
    { type: "accusation", icon: <HelpCircle className="h-4 w-4" />, label: "Did you do it?" },
  ];

  return (
    <div className="space-y-3">
      {/* Suspect Header */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{suspect.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{suspect.occupation}</p>
            </div>
            <Button variant="outline" size="sm" onClick={endInterview}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interview Area - side by side on larger screens */}
      <div className="grid lg:grid-cols-3 gap-3 items-stretch">
        {/* Conversation - takes 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-3">
                {conversation.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 text-sm">
                    Ask {suspect.name.split(" ")[0]} a question to begin.
                  </p>
                ) : (
                  conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2.5 rounded-lg text-sm ${
                        message.role === "player"
                          ? "bg-primary text-primary-foreground ml-8"
                          : "bg-secondary mr-8"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.role === "player" ? "Detective" : suspect.name}
                      </p>
                      <p>
                        {message.role === "player"
                          ? getQuestionLabel(message.questionType || "whereabouts")
                          : message.content}
                      </p>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {suspect.name.split(" ")[0]} is thinking...
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Questions - 1 col */}
        <Card className="flex flex-col">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3 space-y-2 flex-1">
            {questionButtons.map(({ type, icon, label }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handleAskQuestion(type)}
                disabled={isLoading || state.actionsRemaining <= 0}
              >
                {icon}
                <span className="ml-2">{label}</span>
              </Button>
            ))}

            {/* Evidence Questions */}
            {state.discoveredClues.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Confront with evidence:
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {state.discoveredClues.map((clueId) => {
                    const clue = getClue(state, clueId);
                    if (!clue) return null;

                    return (
                      <Button
                        key={clueId}
                        variant={selectedClueId === clueId ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start text-left h-auto py-1.5 text-xs"
                        onClick={() => {
                          if (selectedClueId === clueId) {
                            handleAskQuestion("evidence");
                          } else {
                            setSelectedClueId(clueId);
                          }
                        }}
                        disabled={isLoading || state.actionsRemaining <= 0}
                      >
                        <span className="truncate">{clue.name}</span>
                      </Button>
                    );
                  })}
                </div>
                {selectedClueId && (
                  <Button
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => handleAskQuestion("evidence")}
                    disabled={isLoading || state.actionsRemaining <= 0}
                  >
                    Ask about this
                  </Button>
                )}
              </div>
            )}

            {state.actionsRemaining <= 0 && (
              <Badge variant="destructive" className="w-full justify-center text-xs">
                Out of actions!
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
