# Prove Tool Build Guide

## Claude Code Implementation Document

**Project:** Finding Good - Prove Tool  
**Started:** [DATE]  
**Last Updated:** [DATE]  
**Current Phase:** [UPDATE AS YOU GO]

---

## How to Use This Document

### For Claude Code
Place this file in your project root. When starting a Claude Code session, say:
> "Read PROVE_TOOL_BUILD_GUIDE.md to understand the project context and current phase."

### For Claude Chat
When asking for help, share relevant sections or say:
> "I'm working on Phase X, Step Y of the Prove Tool build. Here's what happened: [issue]"

### Rules to Follow
1. **One phase at a time** - Don't skip ahead
2. **Validate before proceeding** - Each step has a checkpoint
3. **Commit after each phase** - Never lose working code
4. **Start fresh conversations** - When indicated in the guide
5. **Update this document** - Mark items complete, add notes

---

## Project Decisions (Locked In)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| FIRES handling | AI extracts from responses | Cleaner UX |
| Database tables | Keep existing names | Faster, already working |
| Send to Others mode | Basic implementation (Option B) | Core value without complexity |
| Edge Function | Update existing `validation-interpret` | Less deployment work |
| Authentication | Simple email entry | No friction, already working |

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v3.4.x (NOT v4)
- **Backend:** Supabase (existing project)
- **AI:** Claude API via Supabase Edge Functions
- **Deployment:** Vercel
- **Repository:** GitHub

---

## Project Structure

```
finding-good-prove-tool/
├── PROVE_TOOL_BUILD_GUIDE.md    # This file
├── CLAUDE.md                     # Context file for Claude Code
├── .env                          # Local environment variables (DO NOT COMMIT)
├── .env.example                  # Template for env vars
├── src/
│   ├── components/
│   │   └── ui/                   # Reusable UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Email-based auth state
│   │   └── AppContext.tsx        # Session state management
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── api.ts                # Database operations
│   │   └── questions.ts          # Question library
│   ├── pages/
│   │   ├── Landing.tsx           # Mode selection
│   │   ├── SelfMode.tsx          # Self reflection flow
│   │   ├── RequestMode.tsx       # Request external perspective
│   │   ├── OtherMode.tsx         # Send to others flow
│   │   ├── RecipientView.tsx     # View for invited recipients
│   │   ├── SenderView.tsx        # View responses to invitations
│   │   └── History.tsx           # Proof library
│   ├── types/
│   │   └── validation.ts         # TypeScript interfaces
│   ├── App.tsx                   # Router setup
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + custom styles
├── supabase/
│   └── functions/
│       └── validation-interpret/ # Edge Function for AI
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Supabase Configuration

**Project URL:** `https://mdsgkddrnqhhtncfeqxw.supabase.co`

### Existing Tables (Keep As-Is)
- `clients` - User identity
- `coaches` - Coach accounts  
- `events` - Event codes
- `validations` - Proof entries (was validation entries)
- `validation_invitations` - Invitation flow
- `weekly_pulse_responses` - Pulse check data
- `predictions` - Prediction tracking

### Tables to Add
- `proof_requests` - Request mode data (Phase 6)

---

# PHASE 0: ENVIRONMENT SETUP

**Time estimate:** 30-60 minutes  
**Who does this:** YOU (not Claude Code)

## Step 0.1: Install Prerequisites

### Check if Node.js is installed
```bash
node --version
```
Should show v18 or higher. If not installed:
- **Mac:** `brew install node` or download from https://nodejs.org
- **Windows:** Download from https://nodejs.org

### Check if Git is installed
```bash
git --version
```
If not installed:
- **Mac:** `brew install git` or `xcode-select --install`
- **Windows:** Download from https://git-scm.com

**✓ Checkpoint:** Both commands return version numbers

## Step 0.2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
claude --version
```

**✓ Checkpoint:** Claude Code version displays

## Step 0.3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `finding-good-prove-tool`
3. Description: "Prove Tool - Finding Good ecosystem"
4. Private repository (recommended)
5. Do NOT initialize with README (we'll add our own)
6. Click "Create repository"
7. Copy the repository URL (you'll need it later)

**✓ Checkpoint:** Empty repository exists at github.com/[your-username]/finding-good-prove-tool

## Step 0.4: Create Project Folder

```bash
# Navigate to where you want the project
cd ~/Projects  # or wherever you keep code

# Create and enter project folder
mkdir finding-good-prove-tool
cd finding-good-prove-tool
```

## Step 0.5: Extract Existing Code (If Using Zip)

If you have the zip from previous build:

```bash
# Assuming zip is in Downloads
unzip ~/Downloads/finding-good-prove-tool.zip -d .
mv finding-good-validation/* .
rm -rf finding-good-validation
```

OR if starting fresh, skip this step.

## Step 0.6: Set Up Git

```bash
git init
git remote add origin https://github.com/[your-username]/finding-good-prove-tool.git
```

## Step 0.7: Create Environment File

Create `.env` file with your Supabase credentials:

```bash
# Create from example
cp .env.example .env

# Then edit .env and add your actual keys:
# VITE_SUPABASE_URL=https://mdsgkddrnqhhtncfeqxw.supabase.co
# VITE_SUPABASE_ANON_KEY=[your-anon-key-from-supabase-dashboard]
```

To find your anon key:
1. Go to Supabase dashboard
2. Project Settings → API
3. Copy "anon public" key

**✓ Checkpoint:** `.env` file exists with real values

## Step 0.8: Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

**✓ Checkpoint:** Vercel account connected to GitHub

---

# PHASE 1: PROJECT FOUNDATION

**Time estimate:** 1-2 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 1.1: Create CLAUDE.md Context File

Before starting Claude Code, create this file manually:

**File: `CLAUDE.md`**
```markdown
# Prove Tool - Claude Code Context

## What This Is
Finding Good Prove Tool - a weekly reflection app that helps users understand HOW their successes happened so they can repeat them.

## Key Principles
1. "Proof is owning the actions that created your outcomes"
2. AI extracts FIRES elements from user responses (not user-selected)
3. Simple email-based auth (no passwords)
4. Warm, celebratory tone

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v3.4.x (NOT v4 - it has breaking changes)
- Supabase for backend
- Claude API via Edge Functions

## Brand Colors
- Primary (Deep Teal): #1B5666
- Secondary (Medium Teal): #678C95
- Accent (Yellow-Green): #CBC13D
- Light Background: #EDF2F2
- Dark Text: #333333

## FIRES Elements
- Feelings (Red #E57373)
- Influence (Blue #64B5F6)
- Resilience (Green #81C784)
- Ethics (Yellow #FFD54F)
- Strengths (Purple #BA68C8)

## Current Build Phase
Check PROVE_TOOL_BUILD_GUIDE.md for current phase and tasks.

## Important Rules
1. Use Tailwind v3 patterns (NOT v4)
2. Keep components in src/components/ui/
3. Use existing Supabase tables when possible
4. Never commit .env file
5. Test after every change
```

**✓ Checkpoint:** CLAUDE.md exists in project root

## Step 1.2: Start Claude Code

```bash
cd ~/Projects/finding-good-prove-tool
claude
```

## Step 1.3: Initialize or Validate Project

### If starting from existing code:

**Prompt for Claude Code:**
```
Read CLAUDE.md for project context.

I have existing code from a previous build. Please:

1. Check package.json and ensure we have:
   - React 19
   - TypeScript
   - Vite
   - Tailwind CSS v3.4.x (NOT v4)
   - @supabase/supabase-js
   - react-router-dom
   - lucide-react

2. If Tailwind is v4, downgrade to v3.4.x

3. Verify the folder structure matches what's in CLAUDE.md

4. Run `npm install` to ensure dependencies are installed

5. Run `npm run build` to verify everything compiles

Tell me what you find and any issues to fix.
```

### If starting fresh:

**Prompt for Claude Code:**
```
Read CLAUDE.md for project context.

Initialize a new React + TypeScript + Vite project with:

1. Create package.json with these dependencies:
   - react: ^19.0.0
   - react-dom: ^19.0.0
   - react-router-dom: ^7.0.0
   - @supabase/supabase-js: ^2.89.0
   - lucide-react: ^0.460.0

2. Dev dependencies:
   - typescript: ~5.6.0
   - @vitejs/plugin-react: ^4.3.0
   - vite: ^6.0.0
   - tailwindcss: ^3.4.0 (NOT v4)
   - postcss: ^8.4.0
   - autoprefixer: ^10.4.0

3. Configure Tailwind with the brand colors from CLAUDE.md

4. Create the folder structure from CLAUDE.md

5. Create basic index.html, main.tsx, App.tsx

6. Run npm install and npm run build to verify

Show me the commands you're running.
```

**✓ Checkpoint:** `npm run build` succeeds with no errors

## Step 1.4: Verify Dev Server

**Prompt for Claude Code:**
```
Start the development server with `npm run dev` and tell me the URL.
```

Open the URL in your browser. You should see a basic page.

**✓ Checkpoint:** Browser shows the app running locally

## Step 1.5: Initial Git Commit

**Prompt for Claude Code:**
```
Create a .gitignore file that excludes:
- node_modules
- dist
- .env
- .DS_Store

Then stage all files and create initial commit with message "Initial project setup - Phase 1 complete"

Show me the git status before committing.
```

Review the files being committed. Make sure `.env` is NOT in the list.

**Prompt for Claude Code:**
```
Push to GitHub origin main branch.
```

**✓ Checkpoint:** Code visible on GitHub

---

## ⏸️ PHASE 1 COMPLETE

**Before continuing:**
- [ ] `npm run build` succeeds
- [ ] `npm run dev` shows app in browser
- [ ] Code is on GitHub
- [ ] `.env` is NOT committed

**Update this document:** Change "Current Phase" at top to "Phase 2"

---

# PHASE 2: CORE INFRASTRUCTURE

**Time estimate:** 1-2 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 2.1: Start Fresh Session

```bash
cd ~/Projects/finding-good-prove-tool
claude
```

**Initial prompt:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm starting Phase 2: Core Infrastructure.

First, confirm you can see the project structure and that npm run build still works.
```

## Step 2.2: Supabase Client Setup

**Prompt for Claude Code:**
```
Create src/lib/supabase.ts with:

1. Initialize Supabase client using environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. Export the client

3. Export a helper function getEdgeFunctionUrl(functionName: string) that returns the full URL for Edge Functions

Use this Supabase URL: https://mdsgkddrnqhhtncfeqxw.supabase.co
```

**✓ Checkpoint:** File created, no TypeScript errors

## Step 2.3: Type Definitions

**Prompt for Claude Code:**
```
Create src/types/validation.ts with TypeScript interfaces for:

1. FIRESElement - union type: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'

2. Timeframe - union type: 'day' | 'week' | 'month' | 'year'

3. Intensity - union type: 'light' | 'balanced' | 'deeper'

4. ValidationSignal - union type: 'emerging' | 'developing' | 'grounded'

5. Question interface with: id, element, intensity, text

6. QuestionResponse interface with: questionId, questionText, element, answer

7. ValidationScores interface with: replication (1-5), clarity (1-5), ownership (1-5)

8. ValidationPattern interface with: whatWorked, whyItWorked, howToRepeat

9. Validation interface (database record) with:
   - id, client_email, mode, timeframe, intensity
   - fires_focus (FIRESElement[])
   - goal_challenge (string) - NEW FIELD
   - responses (QuestionResponse[])
   - validation_signal, validation_insight
   - scores, pattern
   - fires_extracted (JSONB for AI-extracted FIRES) - NEW FIELD
   - event_code (optional), created_at

10. ProofRequest interface for Request mode with:
    - id, share_id
    - requester_email, requester_name
    - recipient_name, recipient_email (optional)
    - responder_email (optional)
    - goal_challenge, what_you_did (optional)
    - status: 'pending' | 'viewed' | 'completed' | 'expired'
    - responses (JSONB), created_at, completed_at

11. Prediction interface for prediction tracking

12. AppState interface for session state

13. ApiResponse<T> generic wrapper with success, data?, error?

Make sure all exports are properly typed.
```

**✓ Checkpoint:** File created, `npm run build` succeeds

## Step 2.4: Auth Context

**Prompt for Claude Code:**
```
Create src/contexts/AuthContext.tsx with:

1. AuthContext providing:
   - email: string | null
   - isAuthenticated: boolean
   - isLoading: boolean
   - login(email: string): Promise<boolean>
   - logout(): void

2. The login function should:
   - Validate email format
   - Call getOrCreateClient API (we'll create this)
   - Store email in localStorage
   - Return success/failure

3. On mount, check localStorage for existing email

4. Export useAuth hook

Keep it simple - just email-based, no passwords or magic links.
```

**✓ Checkpoint:** File created, no TypeScript errors

## Step 2.5: App Context

**Prompt for Claude Code:**
```
Create src/contexts/AppContext.tsx with:

1. AppContext managing session state:
   - mode: 'self' | 'other' | 'request' | null
   - goalChallenge: string | null (the thing that mattered)
   - timeframe: Timeframe | null
   - intensity: Intensity | null
   - firesFocus: FIRESElement[] (for optional user hints, AI still extracts)
   - selectedQuestions: Question[]
   - currentQuestionIndex: number
   - responses: QuestionResponse[]
   - interpretation: ValidationInterpretation | null

2. Actions:
   - setMode, setGoalChallenge, setTimeframe, setIntensity
   - toggleFiresFocus
   - setSelectedQuestions
   - addResponse, updateResponse
   - setInterpretation
   - resetSession

3. Export useApp hook

Use useReducer for clean state management.
```

**✓ Checkpoint:** File created, no TypeScript errors

## Step 2.6: API Layer Foundation

**Prompt for Claude Code:**
```
Create src/lib/api.ts with these functions (they can return mock data for now, we'll wire to Supabase next):

1. getOrCreateClient(email: string) - returns { email }

2. saveValidation(validation) - saves a validation entry

3. getValidations(email, limit) - gets user's validations

4. createProofRequest(request) - creates request mode entry

5. getProofRequestByShareId(shareId) - gets request by share ID

Use the ApiResponse<T> wrapper type for all returns.

Include TODO comments where Supabase calls will go.
```

**✓ Checkpoint:** File created, no TypeScript errors

## Step 2.7: Wire Up Supabase Calls

**Prompt for Claude Code:**
```
Update src/lib/api.ts to make real Supabase calls:

1. getOrCreateClient should:
   - Check if client exists in 'clients' table by email
   - If not, insert new record
   - Return the client data

2. saveValidation should:
   - Insert into 'validations' table
   - Return the created record

3. getValidations should:
   - Select from 'validations' where client_email matches
   - Order by created_at DESC
   - Limit results

4. createProofRequest should:
   - Generate a random 8-character share_id
   - Insert into 'proof_requests' table (we'll create this table later)
   - For now, return mock data with TODO comment

5. getProofRequestByShareId should:
   - Select from 'proof_requests' where share_id matches
   - For now, return mock data with TODO comment

Wrap all database calls in try/catch and return ApiResponse format.
```

**✓ Checkpoint:** `npm run build` succeeds

## Step 2.8: Base UI Components

**Prompt for Claude Code:**
```
Create src/components/ui/index.tsx with these components using Tailwind and our brand colors from CLAUDE.md:

1. Button - variants: primary, secondary, outline, ghost
   - Props: variant, size (sm/md/lg), fullWidth, loading, disabled, children

2. Card - variants: default, elevated, outlined
   - Props: variant, padding (sm/md/lg/none), className, children

3. Input - standard text input
   - Props: label, error, helperText, plus standard input props

4. Textarea - multiline input
   - Props: label, error, helperText, maxLength, showCount

5. Container - centered content wrapper
   - Props: size (sm/md/lg), className, children

6. Header - page header with title
   - Props: title, subtitle, showLogo

7. LoadingSpinner - animated spinner
   - Props: size (sm/md/lg)

8. Badge - small label/tag
   - Props: variant, children

9. ErrorMessage - error display
   - Props: message, onRetry

Use consistent styling:
- Rounded corners (rounded-lg)
- Smooth transitions
- Focus rings for accessibility
- Brand colors for primary actions
```

**✓ Checkpoint:** File created, no TypeScript errors

## Step 2.9: App Router Setup

**Prompt for Claude Code:**
```
Update src/App.tsx with:

1. BrowserRouter wrapping everything

2. AuthProvider wrapping AppProvider wrapping Routes

3. Routes:
   - / → Landing
   - /self → SelfMode
   - /other → OtherMode
   - /request → RequestMode
   - /v/:shareId → RecipientView
   - /r/:shareId → SenderView
   - /p/:shareId → ProofRequestView (for request mode responses)
   - /history → History
   - * → Landing (404 fallback)

4. Import placeholder pages (we'll create these next)

Note: Create empty placeholder components for any pages that don't exist yet.
```

**✓ Checkpoint:** `npm run build` succeeds

## Step 2.10: Create Placeholder Pages

**Prompt for Claude Code:**
```
Create placeholder components for all pages in src/pages/:

For each page, create a simple component that shows:
- The page name
- A "Coming soon" message or basic structure
- A back button to home

Pages needed:
- Landing.tsx (mode selection)
- SelfMode.tsx
- OtherMode.tsx
- RequestMode.tsx
- RecipientView.tsx
- SenderView.tsx
- ProofRequestView.tsx
- History.tsx

Use our Container, Header, Card, and Button components.
```

**✓ Checkpoint:** All pages exist, app renders without errors

## Step 2.11: Test Auth Flow

**Prompt for Claude Code:**
```
Update Landing.tsx to test the auth flow:

1. Show a simple email input
2. On submit, call login from useAuth
3. If authenticated, show the mode selection buttons
4. If not authenticated, show the email form

This is just for testing - we'll refine the UI later.
```

**✓ Checkpoint:** Can enter email, page updates to show authenticated state

## Step 2.12: Phase 2 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Then create a git commit with message "Core infrastructure complete - Phase 2"

Push to GitHub.
```

**✓ Checkpoint:** Code pushed to GitHub

---

## ⏸️ PHASE 2 COMPLETE

**Before continuing:**
- [ ] All files created without errors
- [ ] Auth flow works (enter email → shows authenticated)
- [ ] All routes render their placeholder pages
- [ ] Code committed and pushed

**Update this document:** Change "Current Phase" to "Phase 3"

---

# PHASE 3: SELF MODE - BASIC FLOW

**Time estimate:** 2-3 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 3.1: Start Fresh Session

```bash
cd ~/Projects/finding-good-prove-tool
claude
```

**Initial prompt:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm starting Phase 3: Self Mode Basic Flow.

Run npm run build to confirm everything still works.
```

## Step 3.2: Question Library

**Prompt for Claude Code:**
```
Create src/lib/questions.ts with:

1. A questions array containing 45 questions:
   - 5 FIRES elements × 3 intensity levels × 3 questions each
   - Each question has: id, element, intensity, text

2. Questions should probe HOW the user succeeded, not just WHAT happened.
   Examples for each FIRES element:

   FEELINGS - Light:
   - "What felt satisfying about how this turned out?"
   - "When did you feel most 'in flow' during this?"
   
   FEELINGS - Deeper:
   - "What vulnerability did you allow that made this possible?"
   - "What feeling did you have to move through to get here?"

   INFLUENCE - Light:
   - "What action did you take that made a difference?"
   
   INFLUENCE - Deeper:
   - "What did you claim ownership of that others might not have?"

   (Create similar questions for Resilience, Ethics, Strengths)

3. Helper functions:
   - getQuestionsByFilter(element?, intensity?) - filter questions
   - selectQuestionsForSession(firesFocus[], intensity) - select 3-5 questions
   - firesInfo - display info for each element (label, color, description)
   - signalInfo - display info for validation signals

4. For selectQuestionsForSession:
   - If firesFocus provided, prioritize those elements
   - Otherwise, get a mix across elements
   - Always match the intensity level
   - Return 3 questions for light, 4 for balanced, 5 for deeper
```

**✓ Checkpoint:** File created, functions work correctly

## Step 3.3: Slider Component

**Prompt for Claude Code:**
```
Add a Slider component to src/components/ui/index.tsx:

Props:
- value: number
- onChange: (value: number) => void
- min: number (default 1)
- max: number (default 5)
- step: number (default 1)
- lowLabel?: string
- highLabel?: string
- showValue?: boolean (default true)

Style:
- Use brand primary color for the filled portion
- Show current value in a small bubble above thumb
- Labels at each end
```

**✓ Checkpoint:** Component added, no errors

## Step 3.4: More UI Components

**Prompt for Claude Code:**
```
Add these components to src/components/ui/index.tsx:

1. TimeframeSelector
   - Shows 4 buttons: Today, This Week, This Month, This Year
   - Selected state uses primary color
   - Props: selected, onChange

2. IntensitySelector  
   - Shows 3 options: Light, Balanced, Deeper
   - Each with description
   - Props: selected, onChange

3. FIRESElementSelector
   - Shows 5 elements as selectable chips
   - Uses FIRES colors from firesInfo
   - Maximum 3 selections
   - Props: selected, onToggle, max

4. QuestionCard
   - Shows question number/total
   - Shows FIRES element badge
   - Textarea for answer
   - Back/Next buttons
   - Character count
   - Minimum 20 characters to proceed
   - Props: questionNumber, totalQuestions, questionText, firesElement, firesColor, value, onChange, onBack, onNext, isLastQuestion

5. ProgressDots
   - Shows dots for total questions
   - Current dot highlighted
   - Completed dots in accent color
   - Props: total, current
```

**✓ Checkpoint:** Components added, no errors

## Step 3.5: Self Mode - Step Flow Structure

**Prompt for Claude Code:**
```
Rewrite src/pages/SelfMode.tsx with a proper step flow:

Steps in order:
1. 'email' - If not authenticated, show email input
2. 'goal' - "What's the goal, challenge, or thing that mattered?"
3. 'context' - Timeframe + Intensity selection (FIRES hints optional)
4. 'questions' - Question cards one at a time
5. 'generating' - Loading state while AI processes
6. 'results' - Show interpretation (mock for now)
7. 'complete' - Success + next actions

State needed:
- step: current step
- goalChallenge: string
- answers: string[] (parallel to selectedQuestions)
- error: string | null

Flow logic:
- Start at 'email' if not authenticated, else 'goal'
- After 'goal', go to 'context'
- After 'context', select questions and go to 'questions'
- After last question, go to 'generating' then 'results'

For the 'results' step, show mock data for now:
- Signal: "Developing"
- Insight: "You succeeded by taking ownership and staying focused..."
- Pattern with whatWorked, whyItWorked, howToRepeat
- Scores: 4, 4, 3

Use a renderStep() function with switch statement for clean code.
```

**✓ Checkpoint:** Flow works end-to-end with mock results

## Step 3.6: Test the Complete Flow

Manually test:
1. Open app in browser
2. Enter email
3. Enter a goal/challenge
4. Select timeframe and intensity
5. Answer all questions (20+ chars each)
6. See mock results

**✓ Checkpoint:** Complete flow works without errors

## Step 3.7: Add Validation and Polish

**Prompt for Claude Code:**
```
Update SelfMode.tsx with:

1. Validation:
   - Goal must be at least 20 characters
   - Each answer must be at least 20 characters
   - Show character count and helpful message

2. Navigation:
   - Back button on each step (except email)
   - Can go back to previous questions
   - Cancel button returns to landing

3. Loading states:
   - Show LoadingSpinner when transitioning

4. Error handling:
   - Catch errors and show ErrorMessage component
   - Allow retry

5. Smooth animations:
   - Add animate-fade-in class to step content
   - Smooth transitions between questions
```

**✓ Checkpoint:** Polish complete, UX feels smooth

## Step 3.8: Phase 3 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Create git commit: "Self Mode basic flow complete - Phase 3"

Push to GitHub.
```

**✓ Checkpoint:** Code pushed to GitHub

---

## ⏸️ PHASE 3 COMPLETE

**Before continuing:**
- [ ] Self Mode flow works end-to-end
- [ ] All validation works
- [ ] Mock results display correctly
- [ ] Code committed and pushed

**Update this document:** Change "Current Phase" to "Phase 4"

---

# PHASE 4: AI INTEGRATION

**Time estimate:** 2-3 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 4.1: Supabase Edge Function Check

Before this phase, verify your Edge Function exists:

1. Go to Supabase Dashboard
2. Edge Functions section
3. Look for `validation-interpret`

If it doesn't exist, you'll need to create it. If it does, we'll update it.

## Step 4.2: Update Edge Function

**IMPORTANT:** This step is done in Supabase Dashboard, not Claude Code.

Go to your Edge Function and update with this code (or create new):

```typescript
// supabase/functions/validation-interpret/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mode, timeframe, intensity, fires_focus, responses, goal_challenge } = await req.json()

    // Build prompt for Claude
    const prompt = buildPrompt(mode, timeframe, intensity, responses, goal_challenge)

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text

    // Parse Claude's response
    const interpretation = parseInterpretation(content)

    return new Response(JSON.stringify(interpretation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function buildPrompt(mode: string, timeframe: string, intensity: string, responses: any[], goalChallenge: string): string {
  const responsesText = responses.map((r, i) => 
    `Question ${i + 1} (${r.element}): ${r.questionText}\nAnswer: ${r.answer}`
  ).join('\n\n')

  return `You are analyzing a reflection for the Finding Good Prove Tool. The user is building proof of how their success happened.

CONTEXT:
- Goal/Challenge: ${goalChallenge}
- Timeframe: ${timeframe}
- Intensity: ${intensity}
- Mode: ${mode}

USER'S RESPONSES:
${responsesText}

ANALYZE and return a JSON object with:

1. "validationSignal": One of "emerging", "developing", or "grounded"
   - emerging: Vague responses, luck-attributed, can't explain how
   - developing: Some clarity but gaps in understanding process
   - grounded: Clear, specific, owns the process, could teach others

2. "validationInsight": A 1-2 sentence insight that captures what they did well. Start with "You..." and be specific and warm.

3. "scores": {
   "replication": 1-5 (could they repeat this?),
   "clarity": 1-5 (how specific were they?),
   "ownership": 1-5 (did they own their actions?)
}

4. "pattern": {
   "whatWorked": What specifically worked (1-2 sentences),
   "whyItWorked": Why it worked (1-2 sentences),
   "howToRepeat": How to do it again (1-2 sentences)
}

5. "firesExtracted": {
   "feelings": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "influence": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "resilience": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "ethics": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "strengths": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" }
}

6. "proofLine": A single shareable sentence summarizing their proof. Format: "I [achieved X] by [doing Y]."

Return ONLY valid JSON, no markdown or explanation.`
}

function parseInterpretation(content: string): any {
  try {
    // Try to parse as JSON directly
    return JSON.parse(content)
  } catch {
    // If parsing fails, return error structure
    return {
      validationSignal: 'developing',
      validationInsight: 'Your reflection shows thoughtful engagement with your success.',
      scores: { replication: 3, clarity: 3, ownership: 3 },
      pattern: {
        whatWorked: 'Your approach showed intention and focus.',
        whyItWorked: 'You brought your capabilities to bear on the challenge.',
        howToRepeat: 'Continue applying this intentional approach.'
      },
      firesExtracted: {},
      proofLine: 'I achieved my goal through focused effort and intention.'
    }
  }
}
```

**⚠️ IMPORTANT:** Add your `ANTHROPIC_API_KEY` to Edge Function secrets in Supabase Dashboard:
1. Edge Functions → validation-interpret → Settings
2. Add secret: ANTHROPIC_API_KEY = [your key]

**✓ Checkpoint:** Edge Function deployed and has API key

## Step 4.3: Update API to Call Edge Function

**Prompt for Claude Code:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm on Phase 4: AI Integration.

Update src/lib/api.ts to add:

1. An interpretValidation function that:
   - Takes: mode, timeframe, intensity, fires_focus, responses, goal_challenge
   - Calls the validation-interpret Edge Function
   - Returns the interpretation or error

2. Use getEdgeFunctionUrl('validation-interpret') for the URL

3. Include Authorization header with the Supabase anon key

4. Handle errors gracefully
```

**✓ Checkpoint:** Function created, no TypeScript errors

## Step 4.4: Wire SelfMode to Real AI

**Prompt for Claude Code:**
```
Update src/pages/SelfMode.tsx to:

1. Import interpretValidation from api.ts

2. Replace the mock 'generating' logic with:
   - Call interpretValidation with all the session data
   - Include goal_challenge in the request
   - Handle success: set interpretation and go to 'results'
   - Handle error: show error and stay on 'generating' with retry option

3. In the 'results' step, use real data from state.interpretation:
   - Display validationSignal as a badge
   - Display validationInsight
   - Display pattern (whatWorked, whyItWorked, howToRepeat)
   - Display scores
   - NEW: Display proofLine in a highlighted box
   - NEW: Show FIRES extracted summary (which elements were detected)

4. Add a "Copy Proof Line" button that copies proofLine to clipboard
```

**✓ Checkpoint:** Real AI interpretation works

## Step 4.5: Test AI Flow

1. Go through complete Self Mode flow
2. Answer questions thoughtfully
3. Verify AI returns meaningful interpretation
4. Check that all data displays correctly

**✓ Checkpoint:** AI returns relevant, personalized interpretation

## Step 4.6: Save to Database

**Prompt for Claude Code:**
```
Update SelfMode.tsx to save the validation after AI interpretation:

1. After receiving interpretation, call saveValidation with:
   - client_email from auth
   - mode: 'self'
   - timeframe, intensity from context
   - fires_focus from context (optional hints)
   - goal_challenge
   - responses
   - validation_signal from interpretation
   - validation_insight from interpretation
   - scores from interpretation
   - pattern from interpretation
   - fires_extracted from interpretation (NEW)
   - proof_line from interpretation (NEW)

2. Handle save errors gracefully (show error but still display results)

3. Store the saved validation ID in local state for potential use
```

## Step 4.7: Verify Database Save

1. Complete a full Self Mode flow
2. Check Supabase Dashboard → Table Editor → validations
3. Verify new row exists with all data

**⚠️ If missing columns:** You may need to add columns to validations table:

**Run in Supabase SQL Editor:**
```sql
-- Add new columns if they don't exist
ALTER TABLE validations 
ADD COLUMN IF NOT EXISTS goal_challenge TEXT,
ADD COLUMN IF NOT EXISTS fires_extracted JSONB,
ADD COLUMN IF NOT EXISTS proof_line TEXT;
```

**✓ Checkpoint:** Validation saves to database

## Step 4.8: Phase 4 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Create git commit: "AI integration complete - Phase 4"

Push to GitHub.
```

---

## ⏸️ PHASE 4 COMPLETE

**Before continuing:**
- [ ] Edge Function deployed and working
- [ ] AI returns personalized interpretation
- [ ] Validation saves to database
- [ ] All new fields populate correctly

**Update this document:** Change "Current Phase" to "Phase 5"

---

# PHASE 5: PULSE & PREDICTION

**Time estimate:** 1-2 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 5.1: Weekly Pulse Questions

**Prompt for Claude Code:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm on Phase 5: Pulse & Prediction.

Add to src/lib/questions.ts:

1. pulseQuestions array with:
   - { id: 'clarity', metric: 'clarity', text: 'How clear are you on what actually worked?', lowLabel: 'Still fuzzy', highLabel: 'Crystal clear' }
   - { id: 'confidence', metric: 'confidence', text: 'How confident are you that you could repeat this?', lowLabel: 'Got lucky', highLabel: 'I own this' }
   - { id: 'influence', metric: 'influence', text: 'How much did your actions create this outcome?', lowLabel: 'Mostly luck', highLabel: 'All me' }

2. getPulseQuestionsForWeek() function that:
   - Calculates current rotation week (week number modulo 3)
   - Returns 2 of the 3 questions based on rotation
   - Week 0: clarity + confidence
   - Week 1: confidence + influence
   - Week 2: clarity + influence

3. getCurrentRotationWeek() helper function
```

**✓ Checkpoint:** Functions created and work correctly

## Step 5.2: Pulse API Functions

**Prompt for Claude Code:**
```
Add to src/lib/api.ts:

1. savePulseResponse(pulse) function that:
   - Inserts into weekly_pulse_responses table
   - Fields: client_email, validation_id, rotation_week, clarity_score, confidence_score, influence_score

2. hasPulseForCurrentWeek(email, rotationWeek) function that:
   - Checks if user already submitted pulse this rotation week
   - Returns boolean
```

**✓ Checkpoint:** Functions created

## Step 5.3: Prediction API Functions

**Prompt for Claude Code:**
```
Add to src/lib/api.ts:

1. savePrediction(prediction) function that:
   - Inserts into predictions table
   - Fields: client_email, validation_id, prediction_text, timeframe, fires_focus, status: 'pending'

2. getPendingPredictions(email) function that:
   - Gets predictions where status = 'pending' for user
   - Order by created_at DESC

3. reviewPrediction(predictionId, outcomeText, outcomeAccuracy) function that:
   - Updates prediction with outcome_text, outcome_accuracy
   - Sets status to 'reviewed'
   - Sets reviewed_at timestamp
```

**✓ Checkpoint:** Functions created

## Step 5.4: Add Pulse Step to SelfMode

**Prompt for Claude Code:**
```
Update SelfMode.tsx to add pulse step after results:

1. Add 'pulse' step between 'results' and 'prediction' (or 'complete')

2. On mount / after auth, check hasPulseForCurrentWeek
   - If already submitted this week, skip pulse step
   - Store showPulse boolean in state

3. 'pulse' step renders:
   - "Weekly Pulse Check" header
   - Brief explanation
   - Two sliders based on getPulseQuestionsForWeek()
   - Continue button

4. On continue, save pulse response and go to 'prediction' step

5. Update flow: results → pulse (if needed) → prediction → complete
```

**✓ Checkpoint:** Pulse step works correctly

## Step 5.5: Add Prediction Steps to SelfMode

**Prompt for Claude Code:**
```
Update SelfMode.tsx:

1. Add 'prediction-review' step at the beginning (after email/before goal):
   - Check getPendingPredictions on auth
   - If pending prediction exists, show review UI
   - Show the prediction text
   - Ask "What actually happened?"
   - Slider for accuracy (1-5)
   - Submit saves review and continues to 'goal'
   - Skip option continues without reviewing

2. Add 'prediction' step at the end (after pulse or results):
   - "Make a Prediction" header
   - Textarea for prediction_text
   - "Based on what you learned, what do you predict will happen?"
   - Skip and Save buttons
   - Save creates pending prediction

3. 'complete' step shows:
   - Success message
   - Proof Line in shareable format
   - "Start Another" button
   - "View Proof Library" button
   - "Back to Home" button
```

**✓ Checkpoint:** Full prediction cycle works

## Step 5.6: Test Complete Self Mode Flow

Test this complete flow:
1. Enter email
2. (If pending prediction) Review prediction accuracy
3. Enter goal/challenge
4. Set context
5. Answer questions
6. See AI results
7. (If first this week) Complete pulse check
8. Make prediction for next time
9. See complete screen

**✓ Checkpoint:** Complete flow works end-to-end

## Step 5.7: Phase 5 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Create git commit: "Pulse and Prediction complete - Phase 5"

Push to GitHub.
```

---

## ⏸️ PHASE 5 COMPLETE

**Before continuing:**
- [ ] Pulse check works and saves
- [ ] Predictions save and show on next session
- [ ] Prediction review works
- [ ] All data saves to correct tables

**Update this document:** Change "Current Phase" to "Phase 6"

---

# PHASE 6: REQUEST MODE

**Time estimate:** 2-3 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 6.1: Create proof_requests Table

**Run in Supabase SQL Editor:**

```sql
-- Create proof_requests table
CREATE TABLE IF NOT EXISTS proof_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  responder_email TEXT,
  goal_challenge TEXT NOT NULL,
  what_you_did TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for share_id lookups
CREATE INDEX IF NOT EXISTS idx_proof_requests_share_id ON proof_requests(share_id);

-- Index for requester lookups  
CREATE INDEX IF NOT EXISTS idx_proof_requests_requester ON proof_requests(requester_email);

-- Enable RLS (permissive for now)
ALTER TABLE proof_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for proof_requests" ON proof_requests
  FOR ALL USING (true) WITH CHECK (true);
```

**✓ Checkpoint:** Table created in Supabase

## Step 6.2: Update API for Proof Requests

**Prompt for Claude Code:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm on Phase 6: Request Mode.

Update src/lib/api.ts proof request functions to make real Supabase calls:

1. createProofRequest should:
   - Generate 8-character share_id using crypto.randomUUID().slice(0,8)
   - Insert into proof_requests table
   - Return { id, share_id }

2. getProofRequestByShareId should:
   - Select * from proof_requests where share_id matches
   - Return the request or null

3. completeProofRequest(shareId, responderEmail, responses) should:
   - Update the request with responses, responder_email
   - Set status to 'completed'
   - Set completed_at timestamp
   - Return updated request
```

**✓ Checkpoint:** API functions work with database

## Step 6.3: Build RequestMode Page

**Prompt for Claude Code:**
```
Rewrite src/pages/RequestMode.tsx with full implementation:

Steps:
1. 'email' - Get requester's email if not authenticated
2. 'recipient' - Who to ask (name, optional email)
3. 'context' - What to get perspective on (goal_challenge, optional what_you_did)
4. 'preview' - Show what recipient will see
5. 'sending' - Loading state
6. 'complete' - Show shareable link

State:
- recipientName, recipientEmail (optional)
- goalChallenge, whatYouDid (optional)
- shareId (after creation)

On send:
- Create proof request
- Generate share link: {origin}/p/{shareId}
- Show copy link button

Complete screen:
- Success message
- Shareable link with copy button
- "Request from Someone Else" button
- "Back to Home" button
```

**✓ Checkpoint:** Request creation flow works

## Step 6.4: Build ProofRequestView Page

**Prompt for Claude Code:**
```
Create src/pages/ProofRequestView.tsx for responders at /p/:shareId:

1. On mount:
   - Get shareId from URL params
   - Load proof request by shareId
   - If not found, show error
   - If already completed, show already completed message

2. Show context:
   - "[Requester name] would like your perspective on:"
   - The goal_challenge
   - Optional what_you_did context

3. Collect responses (one at a time or all at once):
   - "What did you see them do?"
   - "How did they approach it?"
   - "What impact did it have?"
   - "What strength did they show?"
   - "When have you seen them do something similar?" (optional)

4. On submit:
   - Get responder email
   - Save responses via completeProofRequest
   - Show thank you message
   - Offer to start their own reflection

Use similar UI patterns to SelfMode.
```

**✓ Checkpoint:** Responder can complete request

## Step 6.5: Notification for Requester

**Prompt for Claude Code:**
```
Update the system to notify requester when someone responds:

1. Add to api.ts: getMyProofRequests(email) 
   - Gets all proof requests where requester_email matches

2. Create a way for requester to see responses:
   - Add to History page: "Perspectives Others Shared" section
   - Or create separate "My Requests" tab

3. When viewing a completed request, show:
   - Who responded
   - Their responses to each question
   - When they responded
```

**✓ Checkpoint:** Requester can see responses

## Step 6.6: Test Complete Request Flow

1. Create a request (as User A)
2. Copy the share link
3. Open in incognito (as User B)
4. Complete the perspective
5. Back as User A, verify you can see the response

**✓ Checkpoint:** Full request cycle works

## Step 6.7: Phase 6 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Create git commit: "Request Mode complete - Phase 6"

Push to GitHub.
```

---

## ⏸️ PHASE 6 COMPLETE

**Before continuing:**
- [ ] Can create request and get share link
- [ ] Share link works for responder
- [ ] Responses save correctly
- [ ] Requester can see responses

**Update this document:** Change "Current Phase" to "Phase 7"

---

# PHASE 7: HISTORY / PROOF LIBRARY

**Time estimate:** 1-2 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 7.1: Build History Page

**Prompt for Claude Code:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm on Phase 7: History / Proof Library.

Rewrite src/pages/History.tsx:

1. If not authenticated, show sign in prompt

2. If authenticated, load validations for user

3. Display as list:
   - Each card shows:
     - Signal badge (color coded)
     - Goal/challenge (truncated)
     - Proof Line (the shareable summary)
     - Date
     - FIRES elements detected (small colored dots)
   
4. Click to expand shows:
   - Full insight
   - Pattern (whatWorked, whyItWorked, howToRepeat)
   - Scores
   - Original responses
   - FIRES breakdown

5. Add "Proof Requests" section showing requests user has created

6. Empty states for both sections

7. "Add Proof" button in header
```

**✓ Checkpoint:** History page works

## Step 7.2: Search/Filter (Optional Enhancement)

**Prompt for Claude Code:**
```
Add optional filters to History page:

1. Search by goal/challenge text
2. Filter by FIRES element detected
3. Filter by signal level
4. Filter by date range

Make these collapsible so default view is clean.
```

**✓ Checkpoint:** Filters work (if implemented)

## Step 7.3: Phase 7 Commit

**Prompt for Claude Code:**
```
Run npm run build to verify no errors.

Create git commit: "History / Proof Library complete - Phase 7"

Push to GitHub.
```

---

## ⏸️ PHASE 7 COMPLETE

**Before continuing:**
- [ ] History page shows all validations
- [ ] Expand/collapse works
- [ ] Proof requests section works
- [ ] Empty states display correctly

**Update this document:** Change "Current Phase" to "Phase 8"

---

# PHASE 8: POLISH & DEPLOY

**Time estimate:** 2-4 hours  
**New Claude Code conversation:** YES - Start fresh

## Step 8.1: Error Handling Audit

**Prompt for Claude Code:**
```
Read CLAUDE.md and PROVE_TOOL_BUILD_GUIDE.md. I'm on Phase 8: Polish & Deploy.

Audit all pages for error handling:

1. Every API call should have try/catch
2. Network errors should show user-friendly messages
3. "Retry" buttons where appropriate
4. Loading states for all async operations
5. Empty states where data might not exist

List any gaps you find and fix them.
```

**✓ Checkpoint:** All error cases handled

## Step 8.2: Mobile Responsiveness

**Prompt for Claude Code:**
```
Audit and fix mobile responsiveness:

1. Check all pages at 375px width (mobile)
2. Fix any overflow or layout issues
3. Ensure buttons are touch-friendly (min 44px)
4. Text should be readable without zooming
5. Forms should be easy to complete on mobile

Use Tailwind responsive prefixes (sm:, md:, lg:) appropriately.
```

**✓ Checkpoint:** All pages work on mobile

## Step 8.3: Loading & Transition Polish

**Prompt for Claude Code:**
```
Add polish to loading states and transitions:

1. Add subtle fade animations between steps
2. Add skeleton loaders for data loading
3. Button loading states should be consistent
4. No jarring layout shifts during loading
5. Add animate-fade-in class to main content areas

Keep animations subtle and fast (150-300ms).
```

**✓ Checkpoint:** App feels smooth

## Step 8.4: Final Build Test

**Prompt for Claude Code:**
```
Run these commands and fix any issues:

1. npm run build - should have no errors or warnings
2. npm run lint - fix any linting errors
3. Review bundle size - flag if over 500KB
```

**✓ Checkpoint:** Clean build with no warnings

## Step 8.5: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: Vite
4. Environment Variables - Add:
   - VITE_SUPABASE_URL = https://mdsgkddrnqhhtncfeqxw.supabase.co
   - VITE_SUPABASE_ANON_KEY = [your key]
5. Deploy

**✓ Checkpoint:** Site deploys successfully

## Step 8.6: Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add: prove.findinggood.com (or your preferred subdomain)
3. Follow DNS configuration instructions
4. Wait for SSL certificate

**✓ Checkpoint:** Custom domain works

## Step 8.7: Production Test

Test the full production site:
1. Complete Self Mode flow
2. Create a Request
3. Complete Request as different user
4. View History
5. Check on mobile device

**✓ Checkpoint:** Production site fully functional

## Step 8.8: Final Commit

**Prompt for Claude Code:**
```
Create git commit: "Production ready - Phase 8 complete"

Push to GitHub.
```

---

## 🎉 BUILD COMPLETE

**Celebrate! You built a production app with AI assistance.**

---

# APPENDIX A: COMMON ISSUES & FIXES

## Tailwind Not Working
- Make sure tailwind.config.js content array includes your files
- Check postcss.config.js has tailwindcss plugin
- Restart dev server after config changes

## Supabase Connection Errors
- Check .env file has correct URL and key
- Make sure key is the "anon public" key
- Check browser console for specific errors

## Edge Function Errors
- Check Edge Function logs in Supabase Dashboard
- Verify ANTHROPIC_API_KEY is set in secrets
- Test with simpler prompt first

## TypeScript Errors
- Run `npm run build` to see all errors
- Usually missing types or imports
- Claude Code can fix most of these

## Git Issues
- If push fails, try: `git pull --rebase origin main`
- Make sure you're on main branch
- Check GitHub for conflicts

---

# APPENDIX B: CONTEXT FOR CLAUDE CODE

When starting a new Claude Code session, use this template:

```
Read CLAUDE.md for project context and PROVE_TOOL_BUILD_GUIDE.md for current progress.

I'm working on Phase [X], Step [Y].

Current status: [brief description]

Task: [what you want to accomplish]
```

When stuck:

```
I'm getting this error: [error message]

The relevant file is: [filename]

What I expected: [expected behavior]

What happened: [actual behavior]
```

---

# APPENDIX C: POST-LAUNCH IMPROVEMENTS

Ideas for after initial launch:

1. **Send to Others Mode** - Full implementation with alignment comparison
2. **Team Features** - Shared proof libraries
3. **Export** - PDF export of proof library
4. **Trends** - Visualization of patterns over time
5. **Coach Dashboard** - Integration with existing dashboard
6. **Email Notifications** - Zapier integration for notifications

---

**End of Build Guide**
