-- =============================================================================
-- PROVE TOOL - DATABASE SCHEMA UPDATE FOR PHASE 4 (AI Integration)
-- =============================================================================
-- Run this in your Supabase SQL Editor to add the new Phase 4 columns
-- to the validations table.
-- =============================================================================

-- Step 1: Check current schema (informational - copy results for reference)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'validations'
ORDER BY ordinal_position;

-- Step 2: Add new Phase 4 columns if they don't exist
-- These columns support the AI interpretation features

-- goal_challenge: What the user accomplished (required for context)
ALTER TABLE validations
ADD COLUMN IF NOT EXISTS goal_challenge TEXT;

-- fires_extracted: AI-extracted FIRES elements with evidence (optional)
ALTER TABLE validations
ADD COLUMN IF NOT EXISTS fires_extracted JSONB;

-- proof_line: AI-generated shareable one-sentence summary (optional)
ALTER TABLE validations
ADD COLUMN IF NOT EXISTS proof_line TEXT;

-- Step 3: Verify columns were added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'validations'
  AND column_name IN ('goal_challenge', 'fires_extracted', 'proof_line');

-- Step 4: (Optional) Add indexes for common queries
-- Uncomment if you want to optimize queries on these fields

-- CREATE INDEX IF NOT EXISTS idx_validations_proof_line
--   ON validations(client_email)
--   WHERE proof_line IS NOT NULL;

-- CREATE INDEX IF NOT EXISTS idx_validations_goal_challenge
--   ON validations USING gin(to_tsvector('english', goal_challenge));

-- =============================================================================
-- VERIFICATION COMPLETE
-- =============================================================================
-- The validations table should now have these columns:
--
-- Existing columns:
-- - id (uuid, primary key)
-- - client_email (text)
-- - mode (text)
-- - timeframe (text)
-- - intensity (text)
-- - fires_focus (jsonb array)
-- - responses (jsonb array)
-- - validation_signal (text)
-- - validation_insight (text)
-- - scores (jsonb object)
-- - pattern (jsonb object)
-- - event_code (text, optional)
-- - invitation_id (uuid, optional)
-- - created_at (timestamp)
--
-- New Phase 4 columns (just added):
-- - goal_challenge (text)
-- - fires_extracted (jsonb object)
-- - proof_line (text)
-- =============================================================================
