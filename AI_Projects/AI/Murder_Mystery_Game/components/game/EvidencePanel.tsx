"use client";

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClue } from "@/lib/game/reducer";
import { X, FileText, Search, MessageSquare } from "lucide-react";

export function EvidencePanel() {
  const { state, closeEvidence } = useGame();

  if (!state.caseData) return null;

  const discoveredClues = state.discoveredClues
    .map((id) => getClue(state, id))
    .filter(Boolean);

  const categorizedClues = {
    physical: discoveredClues.filter((c) => c?.category === "physical"),
    document: discoveredClues.filter((c) => c?.category === "document"),
    testimony: discoveredClues.filter((c) => c?.category === "testimony"),
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "physical":
        return <Search className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "testimony":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "physical":
        return "Physical Evidence";
      case "document":
        return "Documents";
      case "testimony":
        return "Testimony";
      default:
        return "Evidence";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Evidence Collected
              </CardTitle>
              <CardDescription>
                {discoveredClues.length} of {state.caseData.clues.length} clues
                discovered
              </CardDescription>
            </div>
            <Button variant="outline" onClick={closeEvidence}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </CardHeader>
      </Card>

      {discoveredClues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No evidence collected yet. Search the rooms to find clues.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {(["physical", "document", "testimony"] as const).map((category) => {
            const clues = categorizedClues[category];
            if (clues.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {getCategoryLabel(category)}
                    <Badge variant="secondary">{clues.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {clues.map((clue) => {
                      if (!clue) return null;
                      const room = state.caseData?.rooms.find(
                        (r) => r.id === clue.roomId
                      );

                      return (
                        <div
                          key={clue.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{clue.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {room?.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {clue.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Case Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Case Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Victim</p>
            <p className="font-semibold">{state.caseData.victim.name}</p>
            <p className="text-sm">{state.caseData.victim.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Time of Death
            </p>
            <p>{state.caseData.victim.timeOfDeath}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Location Found
            </p>
            <p>
              {
                state.caseData.rooms.find(
                  (r) => r.id === state.caseData?.victim.foundIn
                )?.name
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Suspects Interviewed
            </p>
            <p>
              {state.interviewedSuspects.length} of{" "}
              {state.caseData.suspects.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
