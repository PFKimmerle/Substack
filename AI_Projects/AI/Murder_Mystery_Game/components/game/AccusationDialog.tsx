"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { hasMinimumEvidence } from "@/lib/game/evaluator";
import { Scale, AlertTriangle, X } from "lucide-react";

export function AccusationDialog() {
  const { state, makeAccusation, closeAccusation } = useGame();
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  if (!state.caseData) return null;

  const { suspects, weapons, rooms } = state.caseData;
  const hasEnoughEvidence = hasMinimumEvidence(state);

  const canAccuse =
    selectedSuspect && selectedWeapon && selectedLocation;

  const handleAccuse = () => {
    if (canAccuse) {
      makeAccusation(selectedSuspect, selectedWeapon, selectedLocation);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Scale className="h-6 w-6" />
                Make Your Accusation
              </CardTitle>
              <CardDescription>
                This is your final decision. Choose carefully.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={closeAccusation}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasEnoughEvidence && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Warning</p>
                <p className="text-sm text-muted-foreground">
                  You may not have enough evidence to make an informed
                  accusation. Consider gathering more clues before proceeding.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Suspect Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Who committed the murder?</label>
              <Select
                value={selectedSuspect}
                onValueChange={setSelectedSuspect}
              >
                <option value="">Select a suspect...</option>
                {suspects.map((suspect) => (
                  <option key={suspect.id} value={suspect.id}>
                    {suspect.name} - {suspect.occupation}
                  </option>
                ))}
              </Select>
            </div>

            {/* Weapon Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What weapon was used?</label>
              <Select value={selectedWeapon} onValueChange={setSelectedWeapon}>
                <option value="">Select a weapon...</option>
                {weapons.map((weapon) => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Where did it happen?</label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <option value="">Select a location...</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm font-medium mb-2">Your Evidence:</p>
            <div className="flex flex-wrap gap-2">
              {state.discoveredClues.length > 0 ? (
                state.discoveredClues.map((clueId) => {
                  const clue = state.caseData?.clues.find(
                    (c) => c.id === clueId
                  );
                  return (
                    <Badge key={clueId} variant="outline">
                      {clue?.name}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No evidence collected
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeAccusation}>
            Continue Investigating
          </Button>
          <Button
            variant="destructive"
            onClick={handleAccuse}
            disabled={!canAccuse}
          >
            <Scale className="h-4 w-4 mr-2" />
            Make Accusation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
