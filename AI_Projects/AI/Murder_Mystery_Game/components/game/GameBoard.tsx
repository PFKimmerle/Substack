"use client";

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClue } from "@/lib/game/reducer";
import { MapPin, Users, FileText, Scale, Clock, LogOut } from "lucide-react";

export function GameBoard() {
  const { state, enterRoom, openEvidence, openAccusation, resetGame } = useGame();

  if (!state.caseData) return null;

  const { rooms, suspects } = state.caseData;

  const discoveredClues = state.discoveredClues
    .map((id) => getClue(state, id))
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Status */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Actions:</span>
              <Badge
                variant={state.actionsRemaining <= 5 ? "destructive" : "default"}
                className="text-sm"
              >
                {state.actionsRemaining}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Badge variant="secondary" className="text-sm">
                {state.discoveredClues.length}/{state.caseData.clues.length}
              </Badge>
            </div>
          </div>
          {state.actionsRemaining <= 5 && state.actionsRemaining > 0 && (
            <p className="text-xs text-red-400 font-medium">Make your accusation soon!</p>
          )}
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={openEvidence} className="flex-1">
              <FileText className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button size="sm" variant="destructive" onClick={openAccusation} className="flex-1">
              <Scale className="h-4 w-4 mr-1" />
              Accuse
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="w-full mt-1" onClick={() => { if (confirm("Exit game?")) { resetGame(); window.location.href = "/"; } }}>
            <LogOut className="h-4 w-4 mr-1" />
            Exit
          </Button>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <div className="grid grid-cols-2 gap-1">
            {rooms.map((room) => {
              const isCurrentRoom = room.id === state.currentRoomId;
              const hasUndiscoveredClues = room.clueIds.some(
                (id) => !state.discoveredClues.includes(id)
              );

              return (
                <Button
                  key={room.id}
                  variant={isCurrentRoom ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-1.5 px-2 text-xs justify-start"
                  onClick={() => enterRoom(room.id)}
                  disabled={isCurrentRoom}
                >
                  <span className="truncate">{room.name}</span>
                  {hasUndiscoveredClues && !isCurrentRoom && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Suspects */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suspects
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <div className="space-y-1">
            {suspects.map((suspect) => {
              const hasInterviewed = state.interviewedSuspects.includes(suspect.id);
              const location = rooms.find((r) => r.id === suspect.currentRoom);

              return (
                <div
                  key={suspect.id}
                  className="flex items-center justify-between p-1.5 rounded border text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{suspect.name}</p>
                    <p className="text-muted-foreground truncate">{location?.name}</p>
                  </div>
                  {hasInterviewed && (
                    <Badge variant="secondary" className="text-xs ml-1 flex-shrink-0">Done</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Evidence (Always Visible) */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Evidence ({discoveredClues.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3">
          {discoveredClues.length === 0 ? (
            <p className="text-xs text-muted-foreground">No evidence yet. Search the rooms.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {discoveredClues.map((clue) => {
                if (!clue) return null;
                return (
                  <div
                    key={clue.id}
                    className="p-1.5 rounded border text-xs"
                    title={clue.description}
                  >
                    <p className="font-medium">{clue.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
