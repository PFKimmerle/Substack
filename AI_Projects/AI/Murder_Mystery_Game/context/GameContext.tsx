"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import {
  GameState,
  GameAction,
  CaseTemplate,
  Message,
  QuestionType,
  GameResult,
} from "@/types/game";
import { gameReducer, initialState, getSuspect, getClue } from "@/lib/game/reducer";
import { evaluateAccusation, evaluateOutOfActions } from "@/lib/game/evaluator";

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: (caseData: CaseTemplate) => void;
  enterRoom: (roomId: string) => void;
  discoverClue: (clueId: string) => void;
  startInterview: (suspectId: string) => void;
  endInterview: () => void;
  askQuestion: (questionType: QuestionType, clueId?: string) => Promise<void>;
  openEvidence: () => void;
  closeEvidence: () => void;
  openAccusation: () => void;
  closeAccusation: () => void;
  makeAccusation: (suspectId: string, weaponId: string, locationId: string) => void;
  resetGame: () => void;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(false);
  const outOfActionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (outOfActionsTimeoutRef.current) {
        clearTimeout(outOfActionsTimeoutRef.current);
      }
    };
  }, []);

  const startGame = useCallback((caseData: CaseTemplate) => {
    dispatch({ type: "START_GAME", payload: caseData });
  }, []);

  const enterRoom = useCallback((roomId: string) => {
    dispatch({ type: "ENTER_ROOM", payload: roomId });
  }, []);

  const discoverClue = useCallback((clueId: string) => {
    dispatch({ type: "DISCOVER_CLUE", payload: clueId });
  }, []);

  const startInterview = useCallback((suspectId: string) => {
    dispatch({ type: "START_INTERVIEW", payload: suspectId });
  }, []);

  const endInterview = useCallback(() => {
    dispatch({ type: "END_INTERVIEW" });
  }, []);

  const askQuestion = useCallback(
    async (questionType: QuestionType, clueId?: string) => {
      if (!state.currentSuspectId || !state.caseData) return;
      if (state.actionsRemaining <= 0) {
        dispatch({
          type: "SET_RESULT",
          payload: evaluateOutOfActions(state),
        });
        return;
      }

      const suspect = getSuspect(state, state.currentSuspectId);
      const clue = clueId ? getClue(state, clueId) : undefined;

      if (!suspect) return;

      // Add player message
      const playerMessage: Message = {
        role: "player",
        content: questionType,
        questionType,
      };

      dispatch({
        type: "ADD_MESSAGE",
        payload: { suspectId: state.currentSuspectId, message: playerMessage },
      });

      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suspectId: state.currentSuspectId,
            questionType,
            clueId,
            caseData: state.caseData,
            conversationHistory: state.conversations[state.currentSuspectId] || [],
            discoveredClues: state.discoveredClues,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        const suspectMessage: Message = {
          role: "suspect",
          content: data.message,
        };

        dispatch({
          type: "ADD_MESSAGE",
          payload: { suspectId: state.currentSuspectId, message: suspectMessage },
        });
      } catch (error) {
        // Fallback response
        const fallbackMessage: Message = {
          role: "suspect",
          content: `${suspect.name} seems evasive and doesn't give a clear answer.`,
        };

        dispatch({
          type: "ADD_MESSAGE",
          payload: { suspectId: state.currentSuspectId, message: fallbackMessage },
        });
      } finally {
        setIsLoading(false);
      }

      // Check if out of actions after this question
      if (state.actionsRemaining <= 1) {
        // Clear any existing timeout before setting a new one
        if (outOfActionsTimeoutRef.current) {
          clearTimeout(outOfActionsTimeoutRef.current);
        }
        outOfActionsTimeoutRef.current = setTimeout(() => {
          dispatch({
            type: "SET_RESULT",
            payload: evaluateOutOfActions(state),
          });
        }, 1500);
      }
    },
    [state]
  );

  const openEvidence = useCallback(() => {
    dispatch({ type: "OPEN_EVIDENCE" });
  }, []);

  const closeEvidence = useCallback(() => {
    dispatch({ type: "CLOSE_EVIDENCE" });
  }, []);

  const openAccusation = useCallback(() => {
    dispatch({ type: "OPEN_ACCUSATION" });
  }, []);

  const closeAccusation = useCallback(() => {
    dispatch({ type: "CLOSE_ACCUSATION" });
  }, []);

  const makeAccusation = useCallback(
    (suspectId: string, weaponId: string, locationId: string) => {
      const result = evaluateAccusation(state, {
        suspectId,
        weaponId,
        locationId,
      });

      dispatch({ type: "MAKE_ACCUSATION", payload: { suspectId, weaponId, locationId } });
      dispatch({ type: "SET_RESULT", payload: result });
    },
    [state]
  );

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startGame,
        enterRoom,
        discoverClue,
        startInterview,
        endInterview,
        askQuestion,
        openEvidence,
        closeEvidence,
        openAccusation,
        closeAccusation,
        makeAccusation,
        resetGame,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
