# MockMentor API Guide

All endpoints live under `/api/interview`, accept and return JSON, and require a Firebase ID token:

```
Authorization: Bearer [FIREBASE_ID_TOKEN]
```

Missing or invalid tokens return `401 {"error": "Unauthorized"}`.

## POST /api/interview/start

Creates a session and returns the first question.

Request:
```json
{ "role": "Frontend Developer", "level": "Junior" }
```
Roles: Frontend Developer, Backend Developer, Data Analyst, Product Manager. Levels: Junior, Mid, Senior.

Response `200`:
```json
{ "sessionId": "abc123", "question": "...", "difficulty": "easy", "order": 1, "total": 6 }
```
Errors: `400` invalid role or level, `500` AI or database failure.

## POST /api/interview/answer

Scores the answer and returns the next question.

Request:
```json
{ "sessionId": "abc123", "answer": "My answer text" }
```
Answer must be 1-2,000 characters.

Response `200`:
```json
{
  "feedback": { "score": 8, "strengths": ["..."], "improvements": ["..."] },
  "done": false,
  "nextQuestion": "...",
  "difficulty": "medium",
  "order": 2
}
```
When `done` is `true`, `nextQuestion` is `null` and the client should call `/finish`.

Errors: `400` bad request, empty or too-long answer, or interview already complete; `404` session not found or not owned by the caller; `500` AI or database failure.

## POST /api/interview/finish

Calculates the overall score (the average of all turn scores, computed in code) and a summary. Safe to call again: a completed session returns its stored result.

Request:
```json
{ "sessionId": "abc123" }
```
Response `200`:
```json
{ "overallScore": 7.5, "summary": "...", "topImprovements": ["...", "...", "..."] }
```
Errors: `400` no answers yet, `404` session not found, `500` AI or database failure.

## GET /api/interview/session?id=[SESSION_ID]

Loads a session so the interview page can resume it.

Response `200`: `role`, `level`, `status`, `answeredCount`, `totalQuestions`, `currentQuestion`, `currentDifficulty`, `overallScore`, `summary`, `topImprovements`.

Errors: `400` missing id, `404` not found.

## GET /api/interview/history

Returns the caller's 50 most recent sessions, newest first.

Response `200`:
```json
{ "sessions": [ { "id": "abc123", "role": "...", "level": "...", "status": "completed", "answeredCount": 6, "totalQuestions": 6, "overallScore": 7.5, "startedAt": 1731670000000 } ] }
```

## Limits

- Answer length: 2,000 characters.
- AI request timeout: 60 seconds.
- Free-tier AI quotas may return failures (`500`) under heavy use.