// =============================================================================
// FINDING GOOD VALIDATION - TYPE DEFINITIONS
// =============================================================================

// FIRES Elements
export type FIRESElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';

// Context Settings
export type Timeframe = 'day' | 'week' | 'month' | 'year';
export type Intensity = 'light' | 'balanced' | 'deeper';

// Validation Signals
export type ValidationSignal = 'emerging' | 'developing' | 'grounded';

// Question Definition
export interface Question {
  id: string;
  element: FIRESElement;
  intensity: Intensity;
  text: string;
}

// User Response to a Question
export interface QuestionResponse {
  questionId: string;
  questionText: string;
  element: FIRESElement;
  answer: string;
}

// AI Interpretation Scores
export interface ValidationScores {
  replication: number; // 1-5: Could they explain this clearly enough that someone else could try it?
  clarity: number;     // 1-5: How specific and concrete are their insights?
  ownership: number;   // 1-5: How much do they claim agency in the success?
}

// AI Interpretation Pattern
export interface ValidationPattern {
  whatWorked: string;
  whyItWorked: string;
  howToRepeat: string;
}

// Alignment (for Other mode)
export interface ValidationAlignment {
  whatSenderSaw: string;
  whatRecipientRevealed: string;
  sharedTruth: string;
}

// AI Interpretation Response
export interface ValidationInterpretation {
  validationSignal: ValidationSignal;
  validationInsight: string;
  scores: ValidationScores;
  pattern: ValidationPattern;
  firesExtracted?: FIRESExtracted;     // NEW: AI-extracted FIRES elements
  proofLine?: string;                  // NEW: Shareable summary
  alignment?: ValidationAlignment;
  giftToSender?: string;
}

// FIRES Extracted Analysis (from AI)
export interface FIRESExtracted {
  feelings?: {
    present: boolean;
    strength: number; // 1-5
    evidence: string;
  };
  influence?: {
    present: boolean;
    strength: number; // 1-5
    evidence: string;
  };
  resilience?: {
    present: boolean;
    strength: number; // 1-5
    evidence: string;
  };
  ethics?: {
    present: boolean;
    strength: number; // 1-5
    evidence: string;
  };
  strengths?: {
    present: boolean;
    strength: number; // 1-5
    evidence: string;
  };
}

// Full Validation Entry (database record)
export interface Validation {
  id: string;
  client_email: string;
  mode: 'self' | 'other_sender' | 'other_recipient';
  timeframe: Timeframe;
  intensity: Intensity;
  fires_focus: FIRESElement[];
  goal_challenge: string;              // NEW: What they accomplished
  responses: QuestionResponse[];
  validation_signal: ValidationSignal;
  validation_insight: string;
  scores: ValidationScores;
  pattern: ValidationPattern;
  fires_extracted?: FIRESExtracted;    // NEW: AI-extracted FIRES elements
  proof_line?: string;                 // NEW: Shareable one-sentence summary
  event_code?: string;
  invitation_id?: string;
  created_at: string;
}

// Validation Invitation (Other mode)
export interface ValidationInvitation {
  id: string;
  share_id: string;
  sender_email: string;
  sender_name?: string;
  recipient_email?: string;
  recipient_name: string;
  sender_context: string;
  timeframe: Timeframe;
  intensity: Intensity;
  fires_focus: FIRESElement[];
  status: 'pending' | 'viewed' | 'completed' | 'expired';
  sender_validation_id?: string;
  recipient_validation_id?: string;
  alignment?: ValidationAlignment;
  gift_to_sender?: string;
  created_at: string;
  completed_at?: string;
}

// Weekly Pulse Response
export interface WeeklyPulseResponse {
  id: string;
  client_email: string;
  validation_id: string;
  rotation_week: number;
  clarity_score: number;      // 1-5
  confidence_score: number;   // 1-5
  influence_score: number;    // 1-5
  created_at: string;
}

// Prediction Entry
export interface Prediction {
  id: string;
  client_email: string;
  validation_id: string;
  prediction_text: string;
  timeframe: Timeframe;
  fires_focus: FIRESElement[];
  status: 'pending' | 'reviewed';
  outcome_text?: string;
  outcome_accuracy?: number;  // 1-5
  created_at: string;
  reviewed_at?: string;
}

// Proof Request (Request Mode - asking others about your proof)
export interface ProofRequest {
  id: string;
  share_id: string;
  requester_email: string;
  requester_name?: string;
  recipient_name: string;
  recipient_email?: string;
  responder_email?: string;
  goal_challenge: string;
  what_you_did?: string;
  status: 'pending' | 'viewed' | 'completed' | 'expired';
  responses?: {
    what_observed: string;
    how_approached: string;
    impact_observed: string;
    strength_shown: string;
    similar_situations?: string;
  };
  created_at: string;
  completed_at?: string;
}

// Pulse Question Definition
export interface PulseQuestion {
  id: string;
  metric: 'clarity' | 'confidence' | 'influence';
  text: string;
  lowLabel: string;
  highLabel: string;
}

// App Session State
export interface AppState {
  // Mode
  mode: 'self' | 'other' | 'request' | null;

  // Context
  goalChallenge: string | null;        // NEW: The thing that mattered
  timeframe: Timeframe | null;
  intensity: Intensity | null;
  firesFocus: FIRESElement[];

  // Other mode specifics
  recipientName: string | null;
  senderContext: string | null;

  // Questions flow
  selectedQuestions: Question[];
  currentQuestionIndex: number;
  responses: QuestionResponse[];

  // Results
  interpretation: ValidationInterpretation | null;

  // Pulse
  pulseScores: {
    clarity: number;
    confidence: number;
    influence: number;
  } | null;

  // Prediction
  predictionText: string | null;
  pendingPrediction: Prediction | null;
}

// Auth State
export interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Edge Function Request/Response
export interface InterpretRequest {
  mode: 'self' | 'recipient';
  goal_challenge: string;              // NEW: What they accomplished
  timeframe: Timeframe;
  intensity: Intensity;
  fires_focus: FIRESElement[];
  responses: QuestionResponse[];
  sender_context?: string;
  sender_name?: string;
  recipient_name?: string;
}

export interface InterpretResponse {
  success: boolean;
  data?: ValidationInterpretation;
  error?: string;
}
