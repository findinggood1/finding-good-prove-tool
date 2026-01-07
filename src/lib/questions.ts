import type { Question, FIRESElement, Intensity, PulseQuestion } from '../types/validation';

// =============================================================================
// VALIDATION QUESTION LIBRARY
// 5 FIRES elements × 3 intensity levels × 3 questions each = 45 total
// =============================================================================

export const questions: Question[] = [
  // =========================================================================
  // FEELINGS
  // =========================================================================
  
  // Feelings - Light
  {
    id: 'f-light-1',
    element: 'feelings',
    intensity: 'light',
    text: 'What felt satisfying about how this turned out?'
  },
  {
    id: 'f-light-2',
    element: 'feelings',
    intensity: 'light',
    text: 'When did you feel most "in flow" during this?'
  },
  {
    id: 'f-light-3',
    element: 'feelings',
    intensity: 'light',
    text: 'What emotional state helped you succeed here?'
  },
  
  // Feelings - Balanced
  {
    id: 'f-balanced-1',
    element: 'feelings',
    intensity: 'balanced',
    text: 'What feeling told you that you were on the right track?'
  },
  {
    id: 'f-balanced-2',
    element: 'feelings',
    intensity: 'balanced',
    text: 'How did your emotional state contribute to the outcome?'
  },
  {
    id: 'f-balanced-3',
    element: 'feelings',
    intensity: 'balanced',
    text: 'What did you feel when you realized it was working?'
  },
  
  // Feelings - Deeper
  {
    id: 'f-deeper-1',
    element: 'feelings',
    intensity: 'deeper',
    text: 'What vulnerability did you allow that made this possible?'
  },
  {
    id: 'f-deeper-2',
    element: 'feelings',
    intensity: 'deeper',
    text: 'What emotional risk did you take that paid off?'
  },
  {
    id: 'f-deeper-3',
    element: 'feelings',
    intensity: 'deeper',
    text: 'What feeling did you have to move through to get here?'
  },

  // =========================================================================
  // INFLUENCE
  // =========================================================================
  
  // Influence - Light
  {
    id: 'i-light-1',
    element: 'influence',
    intensity: 'light',
    text: 'What action did you take that made a difference?'
  },
  {
    id: 'i-light-2',
    element: 'influence',
    intensity: 'light',
    text: 'Where did you take initiative that mattered?'
  },
  {
    id: 'i-light-3',
    element: 'influence',
    intensity: 'light',
    text: 'What did you do that moved things forward?'
  },
  
  // Influence - Balanced
  {
    id: 'i-balanced-1',
    element: 'influence',
    intensity: 'balanced',
    text: 'What did you do that you initially hesitated on?'
  },
  {
    id: 'i-balanced-2',
    element: 'influence',
    intensity: 'balanced',
    text: 'Where did you step outside your comfort zone?'
  },
  {
    id: 'i-balanced-3',
    element: 'influence',
    intensity: 'balanced',
    text: 'What choice did you make that changed the trajectory?'
  },
  
  // Influence - Deeper
  {
    id: 'i-deeper-1',
    element: 'influence',
    intensity: 'deeper',
    text: 'What did you claim ownership of that others might not have?'
  },
  {
    id: 'i-deeper-2',
    element: 'influence',
    intensity: 'deeper',
    text: 'Where did you lead when no one asked you to?'
  },
  {
    id: 'i-deeper-3',
    element: 'influence',
    intensity: 'deeper',
    text: 'What power did you exercise that you sometimes hold back?'
  },

  // =========================================================================
  // RESILIENCE
  // =========================================================================
  
  // Resilience - Light
  {
    id: 'r-light-1',
    element: 'resilience',
    intensity: 'light',
    text: 'What obstacle did you work around to make this happen?'
  },
  {
    id: 'r-light-2',
    element: 'resilience',
    intensity: 'light',
    text: 'What challenge did you persist through?'
  },
  {
    id: 'r-light-3',
    element: 'resilience',
    intensity: 'light',
    text: 'Where did you keep going when it would have been easy to stop?'
  },
  
  // Resilience - Balanced
  {
    id: 'r-balanced-1',
    element: 'resilience',
    intensity: 'balanced',
    text: 'What did you have to let go of to succeed here?'
  },
  {
    id: 'r-balanced-2',
    element: 'resilience',
    intensity: 'balanced',
    text: 'How did you reframe a setback as useful information?'
  },
  {
    id: 'r-balanced-3',
    element: 'resilience',
    intensity: 'balanced',
    text: 'What capacity did this challenge reveal in you?'
  },
  
  // Resilience - Deeper
  {
    id: 'r-deeper-1',
    element: 'resilience',
    intensity: 'deeper',
    text: 'What did this success cost you, and why was it worth it?'
  },
  {
    id: 'r-deeper-2',
    element: 'resilience',
    intensity: 'deeper',
    text: 'What part of yourself did you have to strengthen to get here?'
  },
  {
    id: 'r-deeper-3',
    element: 'resilience',
    intensity: 'deeper',
    text: 'What made you able to sustain effort when motivation faded?'
  },

  // =========================================================================
  // ETHICS (Why / Purpose)
  // =========================================================================
  
  // Ethics - Light
  {
    id: 'e-light-1',
    element: 'ethics',
    intensity: 'light',
    text: 'What value did you honor in how you approached this?'
  },
  {
    id: 'e-light-2',
    element: 'ethics',
    intensity: 'light',
    text: 'What principle guided your decisions?'
  },
  {
    id: 'e-light-3',
    element: 'ethics',
    intensity: 'light',
    text: 'What standard did you refuse to compromise on?'
  },
  
  // Ethics - Balanced
  {
    id: 'e-balanced-1',
    element: 'ethics',
    intensity: 'balanced',
    text: 'How did your "why" shape the way you worked?'
  },
  {
    id: 'e-balanced-2',
    element: 'ethics',
    intensity: 'balanced',
    text: 'What integrity did you maintain even when it was hard?'
  },
  {
    id: 'e-balanced-3',
    element: 'ethics',
    intensity: 'balanced',
    text: 'What deeper purpose did this success serve?'
  },
  
  // Ethics - Deeper
  {
    id: 'e-deeper-1',
    element: 'ethics',
    intensity: 'deeper',
    text: 'What would have been easier but felt wrong?'
  },
  {
    id: 'e-deeper-2',
    element: 'ethics',
    intensity: 'deeper',
    text: 'What line did you refuse to cross, even under pressure?'
  },
  {
    id: 'e-deeper-3',
    element: 'ethics',
    intensity: 'deeper',
    text: 'How did this success align with who you\'re becoming?'
  },

  // =========================================================================
  // STRENGTHS
  // =========================================================================
  
  // Strengths - Light
  {
    id: 's-light-1',
    element: 'strengths',
    intensity: 'light',
    text: 'What skill or ability did you rely on here?'
  },
  {
    id: 's-light-2',
    element: 'strengths',
    intensity: 'light',
    text: 'What came naturally to you in this situation?'
  },
  {
    id: 's-light-3',
    element: 'strengths',
    intensity: 'light',
    text: 'What strength did you use that others might not have?'
  },
  
  // Strengths - Balanced
  {
    id: 's-balanced-1',
    element: 'strengths',
    intensity: 'balanced',
    text: 'What unique perspective or approach did you bring?'
  },
  {
    id: 's-balanced-2',
    element: 'strengths',
    intensity: 'balanced',
    text: 'What pattern of yours showed up that tends to work?'
  },
  {
    id: 's-balanced-3',
    element: 'strengths',
    intensity: 'balanced',
    text: 'What did you do that felt easy but others find hard?'
  },
  
  // Strengths - Deeper
  {
    id: 's-deeper-1',
    element: 'strengths',
    intensity: 'deeper',
    text: 'What part of your identity showed up strongly here?'
  },
  {
    id: 's-deeper-2',
    element: 'strengths',
    intensity: 'deeper',
    text: 'What gift did you give that only you could give?'
  },
  {
    id: 's-deeper-3',
    element: 'strengths',
    intensity: 'deeper',
    text: 'What about who you are made this success possible?'
  }
];

// =============================================================================
// WEEKLY PULSE QUESTIONS (Rotating set of 3)
// =============================================================================

export const pulseQuestions: PulseQuestion[] = [
  {
    id: 'clarity',
    metric: 'clarity',
    text: 'How clear are you on what actually worked this week?',
    lowLabel: 'Still fuzzy',
    highLabel: 'Crystal clear'
  },
  {
    id: 'confidence',
    metric: 'confidence',
    text: 'How confident are you that you could repeat this success?',
    lowLabel: 'Got lucky',
    highLabel: 'I own this'
  },
  {
    id: 'influence',
    metric: 'influence',
    text: 'How much did your actions (vs. circumstances) create this outcome?',
    lowLabel: 'Mostly luck',
    highLabel: 'All me'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get questions filtered by element and intensity
 */
export function getQuestionsByFilter(
  element?: FIRESElement,
  intensity?: Intensity
): Question[] {
  return questions.filter(q => {
    if (element && q.element !== element) return false;
    if (intensity && q.intensity !== intensity) return false;
    return true;
  });
}

/**
 * Select random questions for a validation session
 * Returns 3 questions, one from each selected FIRES element (or random if fewer selected)
 */
export function selectQuestionsForSession(
  firesFocus: FIRESElement[],
  intensity: Intensity
): Question[] {
  const selected: Question[] = [];
  
  // Get questions matching the intensity
  const intensityQuestions = questions.filter(q => q.intensity === intensity);
  
  // If we have FIRES focus elements, select one question from each (up to 3)
  if (firesFocus.length > 0) {
    const shuffledFocus = [...firesFocus].sort(() => Math.random() - 0.5);
    const elementsToUse = shuffledFocus.slice(0, 3);
    
    for (const element of elementsToUse) {
      const elementQuestions = intensityQuestions.filter(q => q.element === element);
      if (elementQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * elementQuestions.length);
        selected.push(elementQuestions[randomIndex]);
      }
    }
  }
  
  // If we still need more questions, fill from remaining pool
  while (selected.length < 3) {
    const remaining = intensityQuestions.filter(
      q => !selected.some(s => s.id === q.id)
    );
    if (remaining.length === 0) break;
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[randomIndex]);
  }
  
  return selected;
}

/**
 * Get pulse questions for current rotation week
 * Rotates which 2 of 3 metrics are shown each week
 */
export function getPulseQuestionsForWeek(): PulseQuestion[] {
  const rotationWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 3;
  
  // Each week shows 2 of 3 questions
  switch (rotationWeek) {
    case 0:
      return [pulseQuestions[0], pulseQuestions[1]]; // clarity, confidence
    case 1:
      return [pulseQuestions[1], pulseQuestions[2]]; // confidence, influence
    case 2:
      return [pulseQuestions[0], pulseQuestions[2]]; // clarity, influence
    default:
      return [pulseQuestions[0], pulseQuestions[1]];
  }
}

/**
 * Get current rotation week number (for deduplication)
 */
export function getCurrentRotationWeek(): number {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 3;
}

/**
 * Get FIRES element display info
 */
export const firesInfo: Record<FIRESElement, { label: string; color: string; description: string }> = {
  feelings: {
    label: 'Feelings',
    color: '#E57373',
    description: 'Emotional awareness and regulation'
  },
  influence: {
    label: 'Influence',
    color: '#64B5F6',
    description: 'Agency and control over outcomes'
  },
  resilience: {
    label: 'Resilience',
    color: '#81C784',
    description: 'Capacity to persist through difficulty'
  },
  ethics: {
    label: 'Ethics',
    color: '#FFD54F',
    description: 'Values alignment and purpose'
  },
  strengths: {
    label: 'Strengths',
    color: '#BA68C8',
    description: 'Natural abilities and talents'
  }
};

/**
 * Get validation signal display info
 */
export const signalInfo: Record<string, { label: string; color: string; description: string }> = {
  emerging: {
    label: 'Emerging',
    color: '#9E9E9E',
    description: 'Pattern is vague or circumstantial'
  },
  developing: {
    label: 'Developing',
    color: '#2196F3',
    description: 'Clear pattern but not yet trusted'
  },
  grounded: {
    label: 'Grounded',
    color: '#4CAF50',
    description: 'Specific, owned, and replicable'
  }
};
