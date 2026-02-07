// Game phases
export type GamePhase =
  | "menu"
  | "room_view"
  | "interview"
  | "evidence"
  | "accusation"
  | "result";

// Victim information
export interface Victim {
  name: string;
  description: string;
  foundIn: string;
  timeOfDeath: string;
}

// Suspect definition
export interface Suspect {
  id: string;
  name: string;
  occupation: string;
  description: string;
  personality: string;
  relationship: string;
  alibi: string;
  secrets: string[];
  currentRoom: string;
}

// Room definition
export interface Room {
  id: string;
  name: string;
  description: string;
  clueIds: string[];
  connectedRooms: string[];
}

// Clue definition
export interface Clue {
  id: string;
  name: string;
  description: string;
  roomId: string;
  pointsTo: string; // suspect ID this clue implicates
  requiredClueId?: string; // another clue that must be found first
  category: "physical" | "testimony" | "document";
}

// Weapon definition
export interface Weapon {
  id: string;
  name: string;
  description: string;
}

// Solution (the truth)
export interface Solution {
  killerId: string;
  weaponId: string;
  locationId: string;
  motive: string;
  confession: string;
}

// Case template (JSON file structure)
export interface CaseTemplate {
  id: string;
  title: string;
  introduction: string;
  victim: Victim;
  suspects: Suspect[];
  rooms: Room[];
  clues: Clue[];
  weapons: Weapon[];
  solution: Solution;
  maxActions: number;
}

// Message in a conversation
export interface Message {
  role: "player" | "suspect";
  content: string;
  questionType?: QuestionType;
}

// Predefined question types
export type QuestionType =
  | "whereabouts"
  | "relationship"
  | "evidence"
  | "accusation";

// Game result
export interface GameResult {
  won: boolean;
  message: string;
  narrative: string;
}

// Runtime game state
export interface GameState {
  caseId: string;
  caseData: CaseTemplate | null;
  phase: GamePhase;
  actionsRemaining: number;
  currentRoomId: string;
  currentSuspectId: string | null;
  discoveredClues: string[];
  interviewedSuspects: string[];
  conversations: Record<string, Message[]>;
  result: GameResult | null;
}

// Game action types
export type GameAction =
  | { type: "START_GAME"; payload: CaseTemplate }
  | { type: "ENTER_ROOM"; payload: string }
  | { type: "DISCOVER_CLUE"; payload: string }
  | { type: "START_INTERVIEW"; payload: string }
  | { type: "END_INTERVIEW" }
  | { type: "ADD_MESSAGE"; payload: { suspectId: string; message: Message } }
  | { type: "OPEN_EVIDENCE" }
  | { type: "CLOSE_EVIDENCE" }
  | { type: "OPEN_ACCUSATION" }
  | { type: "CLOSE_ACCUSATION" }
  | {
      type: "MAKE_ACCUSATION";
      payload: { suspectId: string; weaponId: string; locationId: string };
    }
  | { type: "SET_RESULT"; payload: GameResult }
  | { type: "RESET_GAME" };

// API request/response types
export interface ChatRequest {
  suspectId: string;
  questionType: QuestionType;
  clueId?: string;
  caseData: CaseTemplate;
  conversationHistory: Message[];
  discoveredClues: string[];
}

export interface ChatResponse {
  message: string;
}

export interface NewGameResponse {
  caseData: CaseTemplate;
}
