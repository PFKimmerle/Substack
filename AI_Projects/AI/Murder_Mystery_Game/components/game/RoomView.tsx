"use client";

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentRoom,
  getAvailableCluesInRoom,
  getSuspectsInRoom,
  getClue,
  getSuspect,
} from "@/lib/game/reducer";
import { Search, MessageCircle } from "lucide-react";

export function RoomView() {
  const { state, discoverClue, startInterview } = useGame();

  if (!state.caseData) return null;

  const currentRoom = getCurrentRoom(state);
  const availableClues = getAvailableCluesInRoom(state);
  const suspectsInRoom = getSuspectsInRoom(state);
  const discoveredCluesInRoom = currentRoom?.clueIds.filter((id) =>
    state.discoveredClues.includes(id)
  );

  if (!currentRoom) return null;

  return (
    <div className="space-y-3">
      {/* Room Header */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">{currentRoom.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {currentRoom.description}
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Clues Section */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search for Clues
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3 space-y-2">
            {/* Available Clues */}
            {availableClues.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Something catches your eye...
                </p>
                {availableClues.map((clueId) => {
                  const clue = getClue(state, clueId);
                  if (!clue) return null;

                  return (
                    <Button
                      key={clueId}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-auto py-2 text-xs"
                      onClick={() => discoverClue(clueId)}
                    >
                      <Search className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-left">Examine: {clue.name}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Already Discovered Clues */}
            {discoveredCluesInRoom && discoveredCluesInRoom.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Already examined:
                </p>
                {discoveredCluesInRoom.map((clueId) => {
                  const clue = getClue(state, clueId);
                  if (!clue) return null;

                  return (
                    <div
                      key={clueId}
                      className="p-2 bg-secondary rounded text-xs"
                    >
                      <p className="font-medium">{clue.name}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {clue.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {availableClues.length === 0 &&
              (!discoveredCluesInRoom || discoveredCluesInRoom.length === 0) && (
                <p className="text-muted-foreground text-center py-4 text-xs">
                  Nothing of interest here.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Suspects in Room */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              People Here
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3 space-y-2">
            {suspectsInRoom.length > 0 ? (
              suspectsInRoom.map((suspectId) => {
                const suspect = getSuspect(state, suspectId);
                if (!suspect) return null;

                const hasInterviewed = state.interviewedSuspects.includes(suspectId);

                return (
                  <div
                    key={suspectId}
                    className="p-2 border rounded space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{suspect.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {suspect.occupation}
                        </p>
                      </div>
                      {hasInterviewed && (
                        <Badge variant="secondary" className="text-xs">Done</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => startInterview(suspectId)}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Interview
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4 text-xs">
                No one is here right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
