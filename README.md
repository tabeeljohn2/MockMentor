# MockMentor

An AI-driven mock interview platform. Candidates choose a role and level, answer six adaptive interview questions, and receive a score with specific feedback after every answer, plus a final summary.

## Features

- Email/password sign-up and login (Firebase Authentication)
- Role and level selection (4 roles, 3 levels)
- Six adaptive questions: difficulty rises, holds, or drops based on your last score
- Per-answer score (0-10), strengths, and improvements
- Final summary with overall score and top 3 areas to improve
- Interview history, with the ability to resume unfinished sessions
- Prompt-injection guard and 2,000-character answer limit

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, TypeScript), Tailwind CSS |
| AI | Google Gemini, called through the OpenAI SDK's OpenAI-compatible endpoint |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (accessed server-side only via the Firebase Admin SDK) |
| Tests | Vitest |

## How it works

1. The browser signs the user in with Firebase Auth and sends the user's ID token with every API request.
2. API routes verify the token, then read and write Firestore with the Admin SDK.
3. `POST /api/interview/start` creates a session and asks the AI for the first question.
4. `POST /api/interview/answer` scores the answer (AI call 1), decides the next difficulty with plain code in `lib/adaptive.ts`, then generates the next question (AI call 2).
5. `POST /api/interview/finish` averages the scores in code and asks the AI for a short summary.

## Adaptive rules

| Last score | Next question |
|-----------|---------------|
| 7-10 | One level harder (maximum hard), deeper follow-up |
| 4-6 | Same difficulty, new topic |
| 0-3 | One level easier (minimum easy), same topic |

Starting difficulty: Junior = easy, Mid = medium, Senior = hard.

## Project structure

```
app/
  login/                      login and sign-up page
  interview/new/              role and level selector
  interview/[sessionId]/      interview screen
  history/                    past sessions
  api/interview/              start, answer, finish, session, history routes
components/                   QuestionCard, FeedbackPanel, ProgressBar
lib/
  adaptive.ts                 difficulty rules (pure, tested)
  prompts.ts                  prompt templates and JSON parsers
  openai.ts                   AI client (server only)
  firebase.ts                 client-side Firebase
  firebaseAdmin.ts            server-side Firebase Admin
  apiAuth.ts                  verifies the user's ID token
__tests__/                    unit tests
docs/                         requirements, data model, API guide, user guide
firestore.rules               deny-all rules (all access goes through the server)
```

## Getting started

### Prerequisites

- Node.js LTS and npm
- A Firebase project with **Authentication (Email/Password)** and **Firestore** enabled
- A Google AI Studio API key

### 1. Install

```bash
git clone https://github.com/tabeeljohn2/MockMentor.git
cd MockMentor
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and replace every placeholder:

```
GEMINI_API_KEY=[GEMINI_API_KEY]
AI_MODEL=[GEMINI_MODEL_NAME]
NEXT_PUBLIC_FIREBASE_API_KEY=[FIREBASE_API_KEY]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[FIREBASE_PROJECT_ID].firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[FIREBASE_PROJECT_ID]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[FIREBASE_PROJECT_ID].firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[FIREBASE_SENDER_ID]
NEXT_PUBLIC_FIREBASE_APP_ID=[FIREBASE_APP_ID]
FIREBASE_ADMIN_SERVICE_ACCOUNT='[SERVICE_ACCOUNT_JSON_ON_ONE_LINE]'
```

- `GEMINI_API_KEY` and `FIREBASE_ADMIN_SERVICE_ACCOUNT` are secrets. Never commit them and never prefix them with `NEXT_PUBLIC_`.
- `AI_MODEL`: use a current model name from Google AI Studio. Model names change, so this is a variable and not hard-coded.
- The service account JSON comes from Firebase Console → Project settings → Service accounts → Generate new private key. Store the file outside the repository and paste its contents as one line.

### 3. Firestore rules

Publish the contents of `firestore.rules` (Firebase Console → Firestore → Rules). They deny all direct client access, because the app reads and writes only through the server.

### 4. Run

```bash
npm run dev      # development at http://localhost:3000
npm test         # unit tests
npm run build    # production build
npm start        # run the production build
```

## Security notes

- API keys are read only in server code. No secret has the `NEXT_PUBLIC_` prefix.
- Every API route verifies the Firebase ID token and checks that the session belongs to the caller.
- Candidate answers are wrapped in `<answer>` tags and the model is told to treat them as data, which reduces prompt-injection risk.
- Firestore rules deny all direct browser access.

## Testing

`npm test` runs 15 unit tests covering the adaptive logic and the JSON parsers. Manual test results are in `docs/test-log.md`.

## Known limitations

- Free-tier AI quotas can cause slow or failed requests under heavy use.
- Each answer makes two AI calls, so feedback takes roughly 5-20 seconds.
- Fixed 6 questions and 4 roles.
- No per-user rate limiting yet.
- Not deployed. The app runs locally. A hosting guide is not included.

## Future work

Voice answers, custom question banks, more roles, per-user rate limits, hosted deployment.

## Documentation

- `docs/requirements.md`: scope, user stories, definition of done
- `docs/data-model.md`: Firestore structure
- `docs/adaptive-rules.md`: difficulty rules
- `docs/api.md`: API reference
- `docs/user-guide.md`: how to use the app
- `docs/prompts.md`: prompt design
- `docs/test-log.md`: manual test results