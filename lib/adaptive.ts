export type Difficulty = "easy" | "medium" | "hard";
export type Level = "Junior" | "Mid" | "Senior";

export const TOTAL_QUESTIONS = 6;

const ORDER: Difficulty[] = ["easy", "medium", "hard"];

export function startingDifficulty(level: Level): Difficulty {
  if (level === "Junior") return "easy";
  if (level === "Mid") return "medium";
  return "hard";
}

export type NextStep = {
  difficulty: Difficulty;
  topicMode: "new_topic" | "same_topic_simpler" | "deeper_follow_up";
};

export function getNextStep(score: number, current: Difficulty): NextStep {
  const i = ORDER.indexOf(current);

  if (score >= 7) {
    return {
      difficulty: ORDER[Math.min(i + 1, ORDER.length - 1)],
      topicMode: "deeper_follow_up",
    };
  }
  if (score >= 4) {
    return { difficulty: current, topicMode: "new_topic" };
  }
  return {
    difficulty: ORDER[Math.max(i - 1, 0)],
    topicMode: "same_topic_simpler",
  };
}

export function isInterviewComplete(answeredCount: number): boolean {
  return answeredCount >= TOTAL_QUESTIONS;
}