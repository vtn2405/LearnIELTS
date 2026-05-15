// ═══ Exercise Types ═══

export type ExerciseType = "FILL" | "BUILD" | "TRANSFORM" | "SPEAK" | "MASTER";
export type ExerciseLevel = "starter" | "build_up" | "challenge" | "master";

export interface IeltsUse {
  skill: string;
  part: string;
  context: string;
}

export interface Scaffolding {
  hintLevel1: string | null;
  hintLevel2: string | null;
  hintLevel3: string | null;
}

export interface Feedback {
  correct: string;
  ieltsUsage: string;
  bandTip: string;
  commonMistake: string;
}

export interface FuzzyCheck {
  checkGrammar: boolean;
  checkMeaning: boolean;
  checkFormality: boolean;
  checkConciseness: boolean;
}

// ── FILL ──

export interface FillExerciseData {
  id: string;
  type: "FILL";
  level: ExerciseLevel;
  difficultyOrder: number;
  topic: string;
  ieltsUse: IeltsUse;
  prompt: {
    instruction: string;
    frame: string; // contains [________]
  };
  answer: {
    acceptedTokens: string[];
    requiredTokens: string[];
    blockedTokens: string[];
  };
  grammarCheck: {
    fixedGrammar: string;
    pattern: string;
    mustContainComma: boolean;
  };
  scaffolding: Scaffolding;
  feedback: Feedback;
  reusablePattern: string;
}

// ── BUILD ──

export interface BuildExerciseData {
  id: string;
  type: "BUILD";
  level: ExerciseLevel;
  difficultyOrder: number;
  topic: string;
  ieltsUse: IeltsUse;
  prompt: {
    instruction: string;
    baseSentence: string; // contains [________]
  };
  chips: string[];
  answer: {
    correctOrder: string[];
    distractors: string[];
  };
  grammarCheck: {
    fixedGrammar: string;
    pattern: string;
  };
  scaffolding: Scaffolding;
  feedback: Feedback;
  reusablePattern: string;
}

// ── TRANSFORM ──

export interface TransformExerciseData {
  id: string;
  type: "TRANSFORM";
  level: ExerciseLevel;
  difficultyOrder: number;
  topic: string;
  ieltsUse: IeltsUse;
  prompt: {
    instruction: string;
    sourceSentences: string[];
    constraints: string[];
  };
  answer: {
    sampleAnswer: string;
    requiredIdeas: string[];
    requiredTokens: string[];
    blockedTokens: string[];
  };
  grammarCheck: {
    fixedGrammar: string;
    pattern: string;
    mustContainComma: boolean;
  };
  scaffolding: Scaffolding;
  fuzzyCheck: FuzzyCheck;
  feedback: Feedback;
  reusablePattern: string;
}

// ── SPEAK ──

export interface SpeakExerciseData {
  id: string;
  type: "SPEAK";
  level: ExerciseLevel;
  difficultyOrder: number;
  topic: string;
  ieltsUse: IeltsUse;
  prompt: {
    instruction: string;
    cue: string;
  };
  speakingConfig: {
    durationSeconds: number;
    allowSkip: boolean;
    allowTypeInstead: boolean;
  };
  answer: {
    sampleAnswer: string;
    requiredTokens: string[];
    tokenMatchMode: "any" | "all";
    requiredIdeas: string[];
  };
  grammarCheck: {
    fixedGrammar: string;
    requiredStructure: string;
  };
  scaffolding: Scaffolding;
  feedback: Feedback;
  reusablePattern: string;
}

// ── MASTER ──

export interface MasterExerciseData {
  id: string;
  type: "MASTER";
  level: ExerciseLevel;
  difficultyOrder: number;
  topic: string;
  ieltsUse: IeltsUse;
  prompt: {
    instruction: string;
    cue: string;
    constraints: string[];
  };
  answer: {
    sampleAnswer: string;
    requiredTokens: string[];
    tokenMatchMode: "any" | "all";
    requiredIdeas: string[];
  };
  grammarCheck: {
    fixedGrammar: string;
    pattern: string;
  };
  scaffolding: Scaffolding;
  fuzzyCheck: FuzzyCheck;
  feedback: Feedback;
  reusablePattern: string;
}

// ── Union type ──

export type ExerciseData =
  | FillExerciseData
  | BuildExerciseData
  | TransformExerciseData
  | SpeakExerciseData
  | MasterExerciseData;

// ── Session state ──

export interface SessionAnswer {
  userAnswer: string;
  isCorrect: boolean;
  timeUsed?: number;
}

export interface SessionState {
  exercises: ExerciseData[];
  currentIndex: number;
  answers: Record<string, SessionAnswer>;
  completed: boolean;
}
