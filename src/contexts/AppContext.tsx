import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  FIRESElement,
  Timeframe,
  Intensity,
  Question,
  QuestionResponse,
  ValidationInterpretation,
  Prediction
} from '../types/validation';

// Initial state
const initialState: AppState = {
  mode: null,
  goalChallenge: null,
  timeframe: null,
  intensity: null,
  firesFocus: [],
  recipientName: null,
  senderContext: null,
  selectedQuestions: [],
  currentQuestionIndex: 0,
  responses: [],
  interpretation: null,
  pulseScores: null,
  predictionText: null,
  pendingPrediction: null
};

interface AppContextType {
  state: AppState;
  // Mode
  setMode: (mode: 'self' | 'other' | 'request') => void;
  // Context setup
  setGoalChallenge: (goalChallenge: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setIntensity: (intensity: Intensity) => void;
  toggleFiresFocus: (element: FIRESElement) => void;
  setFiresFocus: (elements: FIRESElement[]) => void;
  // Other mode
  setRecipientName: (name: string) => void;
  setSenderContext: (context: string) => void;
  // Questions
  setSelectedQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  addResponse: (response: QuestionResponse) => void;
  updateResponse: (index: number, answer: string) => void;
  // Results
  setInterpretation: (interpretation: ValidationInterpretation) => void;
  // Pulse
  setPulseScores: (scores: { clarity: number; confidence: number; influence: number }) => void;
  // Prediction
  setPredictionText: (text: string) => void;
  setPendingPrediction: (prediction: Prediction | null) => void;
  // Reset
  resetSession: () => void;
  resetToContextSetup: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Mode
  const setMode = useCallback((mode: 'self' | 'other' | 'request') => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  // Context setup
  const setGoalChallenge = useCallback((goalChallenge: string) => {
    setState(prev => ({ ...prev, goalChallenge }));
  }, []);

  const setTimeframe = useCallback((timeframe: Timeframe) => {
    setState(prev => ({ ...prev, timeframe }));
  }, []);

  const setIntensity = useCallback((intensity: Intensity) => {
    setState(prev => ({ ...prev, intensity }));
  }, []);

  const toggleFiresFocus = useCallback((element: FIRESElement) => {
    setState(prev => {
      const current = prev.firesFocus;
      if (current.includes(element)) {
        return { ...prev, firesFocus: current.filter(e => e !== element) };
      }
      // Max 3 elements
      if (current.length >= 3) return prev;
      return { ...prev, firesFocus: [...current, element] };
    });
  }, []);

  const setFiresFocus = useCallback((elements: FIRESElement[]) => {
    setState(prev => ({ ...prev, firesFocus: elements.slice(0, 3) }));
  }, []);

  // Other mode
  const setRecipientName = useCallback((name: string) => {
    setState(prev => ({ ...prev, recipientName: name }));
  }, []);

  const setSenderContext = useCallback((context: string) => {
    setState(prev => ({ ...prev, senderContext: context }));
  }, []);

  // Questions
  const setSelectedQuestions = useCallback((questions: Question[]) => {
    setState(prev => ({ ...prev, selectedQuestions: questions }));
  }, []);

  const setCurrentQuestionIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  const addResponse = useCallback((response: QuestionResponse) => {
    setState(prev => ({ ...prev, responses: [...prev.responses, response] }));
  }, []);

  const updateResponse = useCallback((index: number, answer: string) => {
    setState(prev => {
      const newResponses = [...prev.responses];
      if (newResponses[index]) {
        newResponses[index] = { ...newResponses[index], answer };
      }
      return { ...prev, responses: newResponses };
    });
  }, []);

  // Results
  const setInterpretation = useCallback((interpretation: ValidationInterpretation) => {
    setState(prev => ({ ...prev, interpretation }));
  }, []);

  // Pulse
  const setPulseScores = useCallback((scores: { clarity: number; confidence: number; influence: number }) => {
    setState(prev => ({ ...prev, pulseScores: scores }));
  }, []);

  // Prediction
  const setPredictionText = useCallback((text: string) => {
    setState(prev => ({ ...prev, predictionText: text }));
  }, []);

  const setPendingPrediction = useCallback((prediction: Prediction | null) => {
    setState(prev => ({ ...prev, pendingPrediction: prediction }));
  }, []);

  // Reset
  const resetSession = useCallback(() => {
    setState(initialState);
  }, []);

  const resetToContextSetup = useCallback(() => {
    setState(prev => ({
      ...initialState,
      mode: prev.mode
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setMode,
        setGoalChallenge,
        setTimeframe,
        setIntensity,
        toggleFiresFocus,
        setFiresFocus,
        setRecipientName,
        setSenderContext,
        setSelectedQuestions,
        setCurrentQuestionIndex,
        addResponse,
        updateResponse,
        setInterpretation,
        setPulseScores,
        setPredictionText,
        setPendingPrediction,
        resetSession,
        resetToContextSetup
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
