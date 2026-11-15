import { describe, it, expect } from "vitest";
import { parseFeedback, parseQuestion, parseSummary } from "../lib/prompts";

describe("parseFeedback", () => {
  it("parses valid JSON", () => {
    const out = parseFeedback('{"score": 7, "strengths": ["a"], "improvements": ["b"]}');
    expect(out?.score).toBe(7);
  });
  it("strips markdown code fences", () => {
    const out = parseFeedback('```json\n{"score": 5, "strengths": [], "improvements": ["x"]}\n```');
    expect(out?.score).toBe(5);
  });
  it("clamps out-of-range scores", () => {
    expect(parseFeedback('{"score": 15, "strengths": [], "improvements": []}')?.score).toBe(10);
    expect(parseFeedback('{"score": -3, "strengths": [], "improvements": []}')?.score).toBe(0);
  });
  it("returns null for invalid input", () => {
    expect(parseFeedback("not json")).toBeNull();
    expect(parseFeedback('{"score": "high"}')).toBeNull();
  });
});

describe("parseQuestion", () => {
  it("returns the question text", () => {
    expect(parseQuestion('{"question": "What is CSS?"}')).toBe("What is CSS?");
  });
  it("returns null when missing", () => {
    expect(parseQuestion("{}")).toBeNull();
  });
});

describe("parseSummary", () => {
  it("keeps at most 3 improvements", () => {
    const out = parseSummary('{"summary": "ok", "topImprovements": ["a","b","c","d"]}');
    expect(out?.topImprovements).toHaveLength(3);
  });
});