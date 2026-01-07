# Prove Tool - Claude Code Context

## What This Project Is

**Finding Good Prove Tool** - A weekly reflection app that helps users understand HOW their successes happened so they can repeat them.

Part of the Finding Good ecosystem (alongside Predict Tool and Priority Builder).

## Core Philosophy

> "Proof is owning the actions that created your outcomes—so you can repeat them."

> "I don't care how you did it, as long as it's done" destroys proof. If you can't articulate how you got there, you can't repeat it.

The tool forces process articulation and builds evidence users can draw on when facing new challenges.

## Key Features

### Three Modes
1. **Self Mode** - Reflect on your own success ("How did I do that?")
2. **Request Mode** - Ask someone for their perspective on YOUR success
3. **Send to Others Mode** - Help someone else surface THEIR proof

### Core Flow (Self Mode)
1. Enter goal/challenge that mattered
2. Set context (timeframe, intensity)
3. Answer FIRES-based questions
4. AI analyzes responses and extracts:
   - Validation Signal (emerging/developing/grounded)
   - Pattern (whatWorked, whyItWorked, howToRepeat)
   - FIRES elements present in responses
   - Proof Line (shareable summary)
5. Weekly Pulse check
6. Prediction for next time

### FIRES Framework
AI extracts these from user responses (users don't select them):
- **F**eelings - Emotional signals and states
- **I**nfluence - Agency and control exercised
- **R**esilience - How difficulty was handled
- **E**thics - Values and purpose alignment
- **S**trengths - Natural abilities applied

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v3.4.x (⚠️ NOT v4 - breaking changes)
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** Claude API via Supabase Edge Functions
- **Deployment:** Vercel

## Brand Colors

```
Primary (Deep Teal):     #1B5666  - Headers, buttons
Secondary (Medium Teal): #678C95  - Secondary text
Accent (Yellow-Green):   #CBC13D  - Highlights
Light Background:        #EDF2F2  - Page backgrounds
Dark Text:               #333333  - Body text

FIRES Colors:
- Feelings:   #E57373 (Red)
- Influence:  #64B5F6 (Blue)
- Resilience: #81C784 (Green)
- Ethics:     #FFD54F (Yellow)
- Strengths:  #BA68C8 (Purple)

Signal Colors:
- Emerging:   #9E9E9E (Gray)
- Developing: #2196F3 (Blue)
- Grounded:   #4CAF50 (Green)
```

## Database (Supabase)

**Project URL:** https://mdsgkddrnqhhtncfeqxw.supabase.co

### Tables
- `clients` - User identity (email-based)
- `validations` - Proof entries
- `validation_invitations` - Send to Others flow
- `proof_requests` - Request Mode flow
- `weekly_pulse_responses` - Pulse check data
- `predictions` - Prediction tracking

### Key Fields in validations
- `goal_challenge` - What they accomplished
- `fires_extracted` - AI-extracted FIRES analysis (JSONB)
- `proof_line` - Shareable one-sentence summary
- `validation_signal` - emerging/developing/grounded
- `pattern` - whatWorked, whyItWorked, howToRepeat

## Authentication

Simple email-based (no passwords):
- User enters email
- Create client record if new
- Store email in localStorage
- All queries filter by client_email

## File Structure

```
src/
├── components/ui/     # Reusable UI components
├── contexts/          # React contexts (Auth, App state)
├── lib/               # Utilities (Supabase, API, questions)
├── pages/             # Route components
├── types/             # TypeScript interfaces
├── App.tsx            # Router setup
└── index.css          # Tailwind + custom styles
```

## Coding Patterns

### API Calls
Always use try/catch and return `ApiResponse<T>`:
```typescript
async function example(): Promise<ApiResponse<Data>> {
  try {
    const { data, error } = await supabase.from('table').select()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

### Components
Use compound components in `src/components/ui/index.tsx`.
Follow existing patterns for consistency.

### State Management
- Auth state in AuthContext
- Session state in AppContext (useReducer)
- Local component state for UI-only concerns

## Important Rules

1. **Tailwind v3** - Do NOT use v4 syntax or features
2. **Never commit .env** - Keep secrets out of git
3. **Test after changes** - Run `npm run build` frequently
4. **Commit often** - Small, focused commits
5. **Match existing patterns** - Look at similar code first

## Current Progress

Check `PROVE_TOOL_BUILD_GUIDE.md` for:
- Current build phase
- Completed checkpoints
- Next tasks

## Getting Help

If stuck, the human can provide:
- Specific error messages
- Screenshots of issues
- Clarification on requirements

Always ask for clarification rather than guessing on product decisions.
