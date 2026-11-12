# MockMentor: Requirements

## Scope
MockMentor is a web app where a candidate picks a job role and level,
answers 6 adaptive interview questions, and receives AI feedback after
each answer plus a final summary.

### In scope
- Email/Google login
- Role and level selection
- Adaptive question flow (6 questions)
- Per-answer score and feedback
- Final summary and overall score
- Session history

### Out of scope (future work)
- Voice or video answers
- Leaderboards or social features
- Payments
- Custom question banks

## User Stories
| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| US-1 | As a candidate, I can sign up and log in so my sessions are saved. | Login works; logged-out users are redirected. |
| US-2 | As a candidate, I can choose a role and level. | Both are required before starting. |
| US-3 | As a candidate, I can read a question and type my answer. | Submit is disabled when the answer is empty. |
| US-4 | As a candidate, I get a follow-up based on my last answer. | Difficulty changes per the adaptive rules. |
| US-5 | As a candidate, I see score, strengths, and improvements per answer. | Feedback appears within about 8 seconds. |
| US-6 | As a candidate, I get a final summary. | Includes overall score and top 3 improvement areas. |
| US-7 | As a candidate, I can review past sessions. | History page lists sessions; each opens in detail. |

## Definition of Done
- [ ] Full interview runs from login to summary without errors
- [ ] Feedback returns in under about 8 seconds
- [ ] Sessions persist after a page refresh
- [ ] No API key appears in browser code or network responses
- [ ] Users can only read their own sessions
- [ ] Tested with at least 5 mock interviews