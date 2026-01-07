import { supabase, getEdgeFunctionUrl } from './supabase';
import type {
  Validation,
  ValidationInvitation,
  WeeklyPulseResponse,
  Prediction,
  ProofRequest,
  FIRESElement,
  Timeframe,
  Intensity,
  InterpretRequest,
  InterpretResponse,
  ApiResponse
} from '../types/validation';

// =============================================================================
// CLIENT OPERATIONS
// =============================================================================

/**
 * Get or create client by email
 */
export async function getOrCreateClient(email: string): Promise<ApiResponse<{ email: string }>> {
  try {
    // Check if client exists
    const { data: existing } = await supabase
      .from('clients')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return { success: true, data: existing };
    }

    // Create new client
    const { data: created, error } = await supabase
      .from('clients')
      .insert({ email })
      .select('email')
      .single();

    if (error) throw error;
    return { success: true, data: created };
  } catch (error) {
    console.error('Error in getOrCreateClient:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// VALIDATION OPERATIONS
// =============================================================================

/**
 * Save a validation entry
 */
export async function saveValidation(validation: Omit<Validation, 'id' | 'created_at'>): Promise<ApiResponse<Validation>> {
  try {
    console.log('[saveValidation] Starting save with data:', {
      client_email: validation.client_email,
      mode: validation.mode,
      goal_challenge: validation.goal_challenge?.substring(0, 50) + '...',
      timeframe: validation.timeframe,
      intensity: validation.intensity,
      fires_focus: validation.fires_focus,
      responses_count: validation.responses?.length,
      has_fires_extracted: !!validation.fires_extracted,
      has_proof_line: !!validation.proof_line,
      validation_signal: validation.validation_signal
    });

    const { data, error } = await supabase
      .from('validations')
      .insert(validation)
      .select()
      .single();

    if (error) {
      console.error('[saveValidation] Supabase error:', error);
      throw error;
    }

    console.log('[saveValidation] Successfully saved validation with id:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('[saveValidation] Caught error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get validations for a user
 */
export async function getValidations(email: string, limit = 20): Promise<ApiResponse<Validation[]>> {
  try {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting validations:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a single validation by ID
 */
export async function getValidation(id: string): Promise<ApiResponse<Validation>> {
  try {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting validation:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// INVITATION OPERATIONS (Other Mode)
// =============================================================================

/**
 * Create an invitation for Other mode
 */
export async function createInvitation(invitation: {
  sender_email: string;
  sender_name?: string;
  recipient_name: string;
  sender_context: string;
  timeframe: Timeframe;
  intensity: Intensity;
  fires_focus: FIRESElement[];
}): Promise<ApiResponse<ValidationInvitation>> {
  try {
    // Generate unique share_id
    const share_id = crypto.randomUUID().slice(0, 8);

    const { data, error } = await supabase
      .from('validation_invitations')
      .insert({
        ...invitation,
        share_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get invitation by share_id (for recipient)
 */
export async function getInvitationByShareId(shareId: string): Promise<ApiResponse<ValidationInvitation>> {
  try {
    const { data, error } = await supabase
      .from('validation_invitations')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting invitation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  shareId: string,
  status: 'pending' | 'viewed' | 'completed' | 'expired',
  updates?: Partial<ValidationInvitation>
): Promise<ApiResponse<ValidationInvitation>> {
  try {
    const { data, error } = await supabase
      .from('validation_invitations')
      .update({ status, ...updates })
      .eq('share_id', shareId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating invitation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Complete invitation (when recipient finishes)
 */
export async function completeInvitation(
  shareId: string,
  recipientEmail: string,
  recipientValidationId: string,
  alignment: ValidationInvitation['alignment'],
  giftToSender?: string
): Promise<ApiResponse<ValidationInvitation>> {
  try {
    const { data, error } = await supabase
      .from('validation_invitations')
      .update({
        status: 'completed',
        recipient_email: recipientEmail,
        recipient_validation_id: recipientValidationId,
        alignment,
        gift_to_sender: giftToSender,
        completed_at: new Date().toISOString()
      })
      .eq('share_id', shareId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error completing invitation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get invitations sent by a user
 */
export async function getSentInvitations(email: string): Promise<ApiResponse<ValidationInvitation[]>> {
  try {
    const { data, error } = await supabase
      .from('validation_invitations')
      .select('*')
      .eq('sender_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting sent invitations:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// WEEKLY PULSE OPERATIONS
// =============================================================================

/**
 * Save weekly pulse response
 */
export async function savePulseResponse(pulse: Omit<WeeklyPulseResponse, 'id' | 'created_at'>): Promise<ApiResponse<WeeklyPulseResponse>> {
  try {
    const { data, error } = await supabase
      .from('weekly_pulse_responses')
      .insert(pulse)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving pulse response:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if user has submitted pulse for current rotation week
 */
export async function hasPulseForCurrentWeek(email: string, rotationWeek: number): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('weekly_pulse_responses')
      .select('id')
      .eq('client_email', email)
      .eq('rotation_week', rotationWeek)
      .limit(1);

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking pulse:', error);
    return false;
  }
}

/**
 * Get pulse history for a user
 */
export async function getPulseHistory(email: string, limit = 12): Promise<ApiResponse<WeeklyPulseResponse[]>> {
  try {
    const { data, error } = await supabase
      .from('weekly_pulse_responses')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting pulse history:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// PREDICTION OPERATIONS
// =============================================================================

/**
 * Save a prediction
 */
export async function savePrediction(prediction: Omit<Prediction, 'id' | 'created_at'>): Promise<ApiResponse<Prediction>> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving prediction:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get pending predictions for a user
 */
export async function getPendingPredictions(email: string): Promise<ApiResponse<Prediction[]>> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('client_email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting pending predictions:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Review/update a prediction with outcome
 */
export async function reviewPrediction(
  predictionId: string,
  outcomeText: string,
  outcomeAccuracy: number
): Promise<ApiResponse<Prediction>> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .update({
        status: 'reviewed',
        outcome_text: outcomeText,
        outcome_accuracy: outcomeAccuracy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error reviewing prediction:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// AI INTERPRETATION (Edge Function)
// =============================================================================

/**
 * Call the validation-interpret Edge Function
 */
export async function interpretValidation(request: InterpretRequest): Promise<InterpretResponse> {
  try {
    const url = getEdgeFunctionUrl('validation-interpret');
    console.log('[interpretValidation] Calling Edge Function at:', url);
    console.log('[interpretValidation] Request:', {
      mode: request.mode,
      goal_challenge: request.goal_challenge?.substring(0, 50) + '...',
      timeframe: request.timeframe,
      intensity: request.intensity,
      responses_count: request.responses?.length
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(request)
    });

    console.log('[interpretValidation] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[interpretValidation] Error response:', errorText);
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[interpretValidation] Response data:', {
      validationSignal: data.validationSignal,
      hasInsight: !!data.validationInsight,
      hasScores: !!data.scores,
      hasPattern: !!data.pattern,
      hasProofLine: !!data.proofLine,
      hasFIRES: !!data.firesExtracted
    });

    return { success: true, data };
  } catch (error) {
    console.error('[interpretValidation] Caught error:', error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// ZAPIER WEBHOOK (Email Notifications)
// =============================================================================

const ZAPIER_WEBHOOK_URL = import.meta.env.VITE_ZAPIER_WEBHOOK_URL;

/**
 * Send invitation email via Zapier
 */
export async function sendInvitationEmail(invitation: ValidationInvitation): Promise<boolean> {
  if (!ZAPIER_WEBHOOK_URL) {
    console.warn('Zapier webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'validation_invitation',
        sender_name: invitation.sender_name || 'Someone',
        sender_email: invitation.sender_email,
        recipient_name: invitation.recipient_name,
        share_url: `${window.location.origin}/v/${invitation.share_id}`,
        sender_context: invitation.sender_context,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
}

/**
 * Send completion notification to sender via Zapier
 */
export async function sendCompletionNotification(invitation: ValidationInvitation): Promise<boolean> {
  if (!ZAPIER_WEBHOOK_URL) {
    console.warn('Zapier webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'validation_completed',
        sender_email: invitation.sender_email,
        sender_name: invitation.sender_name,
        recipient_name: invitation.recipient_name,
        view_url: `${window.location.origin}/r/${invitation.share_id}`,
        gift_to_sender: invitation.gift_to_sender,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending completion notification:', error);
    return false;
  }
}

// =============================================================================
// PROOF REQUEST OPERATIONS (Request Mode)
// =============================================================================

/**
 * Create a proof request (asking someone for their perspective on you)
 */
export async function createProofRequest(request: {
  requester_email: string;
  requester_name?: string;
  recipient_name: string;
  recipient_email?: string;
  goal_challenge: string;
  what_you_did?: string;
}): Promise<ApiResponse<{ id: string; share_id: string }>> {
  try {
    // Generate unique share_id
    const share_id = crypto.randomUUID().slice(0, 8);

    const { data, error } = await supabase
      .from('proof_requests')
      .insert({
        ...request,
        share_id,
        status: 'pending'
      })
      .select('id, share_id')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating proof request:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get proof request by share_id
 */
export async function getProofRequestByShareId(shareId: string): Promise<ApiResponse<ProofRequest>> {
  try {
    const { data, error } = await supabase
      .from('proof_requests')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting proof request:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Complete a proof request (when someone submits their perspective)
 */
export async function completeProofRequest(
  shareId: string,
  responderEmail: string,
  responses: { 
    what_observed: string;
    how_approached: string;
    impact_observed: string;
    strength_shown: string;
    similar_situations?: string;
  }
): Promise<ApiResponse<ProofRequest>> {
  try {
    const { data, error } = await supabase
      .from('proof_requests')
      .update({
        status: 'completed',
        responder_email: responderEmail,
        responses,
        completed_at: new Date().toISOString()
      })
      .eq('share_id', shareId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error completing proof request:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send proof request email via Zapier
 */
export async function sendProofRequestEmail(request: { 
  share_id: string;
  requester_email: string;
  requester_name?: string;
  recipient_name: string;
  recipient_email?: string;
  goal_challenge: string;
}): Promise<boolean> {
  if (!ZAPIER_WEBHOOK_URL || !request.recipient_email) {
    console.warn('Zapier webhook URL not configured or no recipient email');
    return false;
  }

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'proof_request',
        requester_name: request.requester_name || request.requester_email.split('@')[0],
        requester_email: request.requester_email,
        recipient_name: request.recipient_name,
        recipient_email: request.recipient_email,
        share_url: `${window.location.origin}/p/${request.share_id}`,
        goal_challenge: request.goal_challenge,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending proof request email:', error);
    return false;
  }
}

// =============================================================================
// EVENT CODE VALIDATION
// =============================================================================

/**
 * Validate an event code
 */
export async function validateEventCode(code: string): Promise<ApiResponse<{ valid: boolean; eventName?: string }>> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('name, is_active, expires_at')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return { success: true, data: { valid: false } };
    }

    // Check if active and not expired
    const isValid = data.is_active && 
      (!data.expires_at || new Date(data.expires_at) > new Date());

    return { 
      success: true, 
      data: { 
        valid: isValid, 
        eventName: isValid ? data.name : undefined 
      } 
    };
  } catch (error) {
    console.error('Error validating event code:', error);
    return { success: false, error: String(error) };
  }
}
