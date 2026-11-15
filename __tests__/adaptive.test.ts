import { describe, it, expect } from "vitest";
import {
  getNextStep,
  startingDifficulty,
  isInterviewComplete,
  TOTAL_QUESTIONS,
} from "../lib/adaptive";

describe("getNextStep", () => {
  it("raises difficulty for high scores", () => {
    expect(getNextStep(8, "easy")).toEqual({ difficulty: "medium", topicMode: "deeper_follow_up" });
  });
  it("caps difficulty at hard", () => {
    expect(getNextStep(9, "hard").difficulty).toBe("hard");
  });
  it("keeps difficulty for mid scores and changes topic", () => {
    expect(getNextStep(5, "medium")).toEqual({ difficulty: "medium", topicMode: "new_topic" });
  });
  it("lowers difficulty for low scores", () => {
    expect(getNextStep(2, "medium")).toEqual({ difficulty: "easy", topicMode: "same_topic_simpler" });
  });
  it("never goes below easy", () => {
    expect(getNextStep(0, "easy").difficulty).toBe("easy");
  });
  it("handles the boundaries 3, 4, and 7", () => {
    expect(getNextStep(3, "medium").difficulty).toBe("easy");
    expect(getNextStep(4, "medium").difficulty).toBe("medium");
    expect(getNextStep(7, "medium").difficulty).toBe("hard");
  });
});

describe("startingDifficulty", () => {
  it("maps levels to difficulties", () => {
    expect(startingDifficulty("Junior")).toBe("easy");
    expect(startingDifficulty("Mid")).toBe("medium");
    expect(startingDifficulty("Senior")).toBe("hard");
  });
});

describe("isInterviewComplete", () => {
  it("completes after the last question", () => {
    expect(isInterviewComplete(TOTAL_QUESTIONS - 1)).toBe(false);
    expect(isInterviewComplete(TOTAL_QUESTIONS)).toBe(true);
  });
});