export interface TheorySection {
  title?: string;
  description: string;
  formation: { affirmative: string; negative: string; question: string };
  contrast_examples: SpeakingContrastExample[];
  key_points: string[];
}

export interface ExerciseSet {
  total?: number;
  passing_score?: number;
  items: Exercise[];
}

export interface ApplySection {
  writing_mini: WritingMiniTask;
  speaking_drill: SpeakingDrill;
  [key: string]: unknown;
}

export interface GrammarUnit {
  id: string;
  chapter: number;
  title: string;
  subtitle: string;
  band_min: number;
  band_target: number;
  theory: TheorySection;
  exercises: ExerciseSet;
  apply: ApplySection;
  completion: CompletionMeta;
}

export interface SpeakingContrastExample {
  wrong: string; // 'I go gym everyday'
  correct: string; // 'I usually go to the gym every day'
  tip_vi: string;
  band_impact: string;
}

export interface Exercise {
  id: string;
  type: "multiple_choice" | "find_error" | "reorder";
  question: string;
  options?: string[];
  correct_answer: string | string[];
  feedback_correct: string;
  feedback_wrong: string;
  ielts_tip: string;
  skill: "speaking" | "writing" | "both";
}

export interface WritingMiniTask {
  prompt: string;
  placeholder: string;
  grammar_must_use: string[];
  word_limit: 30;
  model_answer: string;
  model_band: number;
}

export interface SpeakingDrill {
  prompt: string;
  time_limit: 30;
  grammar_targets: string[];
  model_answer: string;
  model_band: number;
}

export interface CompletionMeta {
  xp_reward: 50;
  badge?: { id: string; name: string; icon: string; description_vi: string };
  next_unit_id: string | null;
  next_unit_title: string;
  next_unit_connection: string;
}
