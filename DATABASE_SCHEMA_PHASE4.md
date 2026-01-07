# Database Schema Update - Phase 4 (AI Integration)

## Problem

Validation save is failing with **400 Bad Request** error because the data being sent from the frontend doesn't match the current database schema.

## Missing Columns

The following columns are **NEW in Phase 4** and need to be added to the `validations` table:

### 1. `goal_challenge` (TEXT, NOT NULL)
- **Purpose:** Stores what the user accomplished
- **Example:** "I closed a major deal this week"
- **Frontend Type:** `string`
- **Required:** Yes

### 2. `fires_extracted` (JSONB, NULLABLE)
- **Purpose:** AI-extracted FIRES elements with evidence
- **Example:**
  ```json
  {
    "feelings": {
      "present": true,
      "strength": 4,
      "evidence": "Felt confident during the presentation"
    },
    "influence": {
      "present": true,
      "strength": 5,
      "evidence": "Took ownership of the decision"
    }
  }
  ```
- **Frontend Type:** `FIRESExtracted` (JSONB object)
- **Required:** No (optional)

### 3. `proof_line` (TEXT, NULLABLE)
- **Purpose:** AI-generated shareable one-sentence summary
- **Example:** "I closed the deal by building trust and addressing concerns proactively."
- **Frontend Type:** `string`
- **Required:** No (optional)

## Complete Schema Comparison

### Data Being Sent (from saveValidation function)

```typescript
{
  client_email: string,              // EXISTS in DB
  mode: 'self' | 'other_sender' | 'other_recipient', // EXISTS in DB
  goal_challenge: string,            // ❌ MISSING - needs to be added
  timeframe: 'day' | 'week' | 'month' | 'year', // EXISTS in DB
  intensity: 'light' | 'balanced' | 'deeper', // EXISTS in DB
  fires_focus: FIRESElement[],       // EXISTS in DB (JSONB array)
  responses: QuestionResponse[],     // EXISTS in DB (JSONB array)
  validation_signal: 'emerging' | 'developing' | 'grounded', // EXISTS in DB
  validation_insight: string,        // EXISTS in DB
  scores: {                          // EXISTS in DB (JSONB object)
    replication: number,
    clarity: number,
    ownership: number
  },
  pattern: {                         // EXISTS in DB (JSONB object)
    whatWorked: string,
    whyItWorked: string,
    howToRepeat: string
  },
  fires_extracted?: FIRESExtracted,  // ❌ MISSING - needs to be added
  proof_line?: string                // ❌ MISSING - needs to be added
}
```

### Current Database Columns (Before Update)

```sql
id                 UUID         PRIMARY KEY (auto-generated)
client_email       TEXT         NOT NULL
mode               TEXT         NOT NULL
timeframe          TEXT         NOT NULL
intensity          TEXT         NOT NULL
fires_focus        JSONB        NOT NULL (array)
responses          JSONB        NOT NULL (array)
validation_signal  TEXT         NOT NULL
validation_insight TEXT         NOT NULL
scores             JSONB        NOT NULL (object)
pattern            JSONB        NOT NULL (object)
event_code         TEXT         NULLABLE
invitation_id      UUID         NULLABLE
created_at         TIMESTAMP    DEFAULT NOW()
```

### Required Database Columns (After Update)

Add these three columns:

```sql
goal_challenge     TEXT         NOT NULL
fires_extracted    JSONB        NULLABLE
proof_line         TEXT         NULLABLE
```

## How to Fix

### Step 1: Run the SQL Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema-update.sql`
4. Run the script
5. Verify the three columns were added successfully

### Step 2: Quick Fix (Alternative)

If you prefer, run just this command in Supabase SQL Editor:

```sql
ALTER TABLE validations
ADD COLUMN IF NOT EXISTS goal_challenge TEXT,
ADD COLUMN IF NOT EXISTS fires_extracted JSONB,
ADD COLUMN IF NOT EXISTS proof_line TEXT;
```

### Step 3: Verify the Fix

After running the SQL, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'validations'
ORDER BY ordinal_position;
```

You should see all three new columns listed.

### Step 4: Test the Application

1. Restart your dev server: `npm run dev`
2. Complete a Self Mode flow
3. Check browser console logs - you should see:
   ```
   [saveValidation] Successfully saved validation with id: xxx
   ```
4. Verify in Supabase Table Editor that the row appears with:
   - `goal_challenge` populated
   - `proof_line` populated (if AI returned one)
   - `fires_extracted` populated (if AI returned data)

## Why This Happened

The Phase 4 AI integration added three new fields to support:
1. **Goal/Challenge context** - Helps AI understand what the user achieved
2. **FIRES extraction** - AI analyzes and extracts which FIRES elements are present
3. **Proof Line** - AI generates a shareable one-sentence summary

These fields were added to the TypeScript types but the database schema wasn't updated yet.

## Troubleshooting

### If you still get 400 errors after adding columns:

1. **Check RLS policies** - Ensure INSERT is allowed:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'validations';
   ```

2. **Check for NULL constraint errors** - If `goal_challenge` is required but NULL:
   ```sql
   ALTER TABLE validations
   ALTER COLUMN goal_challenge SET NOT NULL;
   ```

3. **Check console logs** - The detailed logging will show the exact Supabase error:
   ```
   [saveValidation] Supabase error: { ... }
   ```

### If data types don't match:

- `fires_focus` should be JSONB (array)
- `responses` should be JSONB (array)
- `scores` should be JSONB (object)
- `pattern` should be JSONB (object)
- `fires_extracted` should be JSONB (object)

## Expected Result

After fixing the schema, you should see successful saves:

```
[SelfMode] Calling saveValidation...
[saveValidation] Starting save with data: { ... }
[saveValidation] Successfully saved validation with id: 550e8400-e29b-41d4-a716-446655440000
[SelfMode] Successfully saved validation with ID: 550e8400-e29b-41d4-a716-446655440000
```

And in Supabase Table Editor, you'll see the new validation row with all fields populated.
