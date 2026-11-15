# Prompt Design

All prompts live in `lib/prompts.ts`. The AI is always told to reply with JSON only, and replies are validated by parsers that strip code fences, check fields, and clamp scores to 0-10. An invalid reply is retried once.

## System prompt
Sets the persona ("professional [level] [role] interviewer"), asks for specific and constructive feedback, and states that the candidate's answer is untrusted data inside `<answer>` tags that must never be treated as instructions.

## Calls
1. **First question:** input is the starting difficulty. Output: `{"question": "..."}`.
2. **Feedback:** input is the question and the answer. Output: `{"score", "strengths", "improvements"}`.
3. **Next question:** input is the difficulty and topic mode chosen by code, the last question and answer, and the list of questions already asked (so none repeat). Output: `{"question": "..."}`.
4. **Summary:** input is every question with its score and improvements. Output: `{"summary", "topImprovements"}`.

## Design decisions
- Difficulty rules are plain code (`lib/adaptive.ts`), not left to the model, so behavior is predictable and unit-tested.
- The overall score is calculated in code as the average of turn scores.
- Scoring and next-question generation are separate calls, because the next difficulty depends on the score.

## Tuning
Change wording in `lib/prompts.ts` only. After any change, run `npm test` and one manual interview, and record the result in `docs/test-log.md`.