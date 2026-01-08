import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import {
  Container,
  Header,
  Card,
  Button,
  Input,
  Textarea,
  IntensitySelector,
  QuestionCard,
  LoadingSpinner,
  Slider,
  Badge,
  ErrorMessage,
  InfoIcon
} from '../components/ui';
import { selectQuestionsForSession, getPulseQuestionsForWeek, getCurrentRotationWeek, firesInfo, signalInfo } from '../lib/questions';
import {
  saveValidation,
  savePulseResponse,
  savePrediction,
  getPendingPredictions,
  reviewPrediction,
  interpretValidation,
  hasPulseForCurrentWeek
} from '../lib/api';
import type { FIRESElement, Intensity, QuestionResponse, Prediction } from '../types/validation';

// Flow steps - now includes 'goal' step
type Step = 
  | 'email'
  | 'prediction-review'
  | 'goal'          // NEW: What's the goal/challenge?
  | 'context'
  | 'questions'
  | 'generating'
  | 'results'
  | 'pulse'
  | 'prediction'
  | 'complete';

export default function SelfMode() {
  const navigate = useNavigate();
  const { email, isAuthenticated, login, isLoading: authLoading } = useAuth();
  const { state, setMode, setGoalChallenge, setIntensity, setTimeframe, setSelectedQuestions, setInterpretation, resetSession } = useApp();

  // Local state
  const [step, setStep] = useState<Step>('email');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local UI state for goal input
  const [goalInput, setGoalInput] = useState('');

  // Pulse state
  const [pulseScores, setPulseScores] = useState({ clarity: 3, confidence: 3, influence: 3 });
  const [showPulse, setShowPulse] = useState(true);

  // Prediction state
  const [predictionText, setPredictionText] = useState('');
  const [pendingPrediction, setPendingPrediction] = useState<Prediction | null>(null);
  const [predictionOutcome, setPredictionOutcome] = useState('');
  const [predictionAccuracy, setPredictionAccuracy] = useState(3);

  // Store validation ID for pulse and prediction
  const [validationId, setValidationId] = useState<string | null>(null);

  // Initialize mode
  useEffect(() => {
    setMode('self');
    if (isAuthenticated) {
      checkForPendingPredictions();
    }
  }, [isAuthenticated]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && step === 'email') {
      checkForPendingPredictions();
    }
  }, [isAuthenticated, step]);

  const checkForPendingPredictions = async () => {
    if (!email) return;
    
    const result = await getPendingPredictions(email);
    if (result.success && result.data && result.data.length > 0) {
      setPendingPrediction(result.data[0]);
      setStep('prediction-review');
    } else {
      setStep('goal');  // Changed: go to goal step first
    }

    // Check if pulse needed
    const rotationWeek = getCurrentRotationWeek();
    const hasPulse = await hasPulseForCurrentWeek(email, rotationWeek);
    setShowPulse(!hasPulse);
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const success = await login(emailInput);
    if (success) {
      setEmailError('');
    } else {
      setEmailError('Unable to sign in. Please try again.');
    }
  };

  // Handle context setup complete
  const handleContextComplete = () => {
    if (!state.intensity) {
      setError('Please select an intensity level');
      return;
    }

    // Set default timeframe to 'week' since user describes it naturally in goal
    setTimeframe('week');

    // Pass empty array for firesFocus - AI extracts FIRES elements from responses
    const questions = selectQuestionsForSession(
      [],
      state.intensity
    );
    setSelectedQuestions(questions);
    setAnswers(new Array(questions.length).fill(''));
    setCurrentQuestionIndex(0);
    setStep('questions');
  };

  // Handle question answer
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < state.selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateInterpretation();
    }
  };

  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Generate AI interpretation
  const generateInterpretation = async () => {
    console.log('[SelfMode] Starting interpretation generation');
    console.log('[SelfMode] Current state:', {
      email,
      goalChallenge: state.goalChallenge,
      timeframe: state.timeframe,
      intensity: state.intensity,
      firesFocus: state.firesFocus,
      questionsCount: state.selectedQuestions.length,
      answersCount: answers.length
    });

    setStep('generating');
    setIsGenerating(true);
    setError(null);

    try {
      // Build responses
      const responses: QuestionResponse[] = state.selectedQuestions.map((q, i) => ({
        questionId: q.id,
        questionText: q.text,
        element: q.element,
        answer: answers[i]
      }));

      console.log('[SelfMode] Built responses:', responses.length, 'responses');

      // Call Edge Function for AI interpretation
      console.log('[SelfMode] Calling interpretValidation...');
      const interpretResult = await interpretValidation({
        mode: 'self',
        goal_challenge: state.goalChallenge!,
        timeframe: state.timeframe!,
        intensity: state.intensity!,
        responses
      });

      console.log('[SelfMode] interpretValidation result:', {
        success: interpretResult.success,
        hasData: !!interpretResult.data,
        error: interpretResult.error
      });

      if (!interpretResult.success || !interpretResult.data) {
        throw new Error(interpretResult.error || 'Failed to generate interpretation');
      }

      const interpretation = interpretResult.data;
      console.log('[SelfMode] Received interpretation:', {
        signal: interpretation.validationSignal,
        hasProofLine: !!interpretation.proofLine,
        hasFIRES: !!interpretation.firesExtracted
      });

      setInterpretation(interpretation);

      // Save to database
      console.log('[SelfMode] Calling saveValidation...');
      const validationData = {
        client_email: email!,
        mode: 'self' as const,
        goal_challenge: state.goalChallenge!,
        timeframe: state.timeframe!,
        intensity: state.intensity!,
        responses,
        validation_signal: interpretation.validationSignal,
        validation_insight: interpretation.validationInsight,
        scores: interpretation.scores,
        pattern: interpretation.pattern,
        fires_extracted: interpretation.firesExtracted,
        proof_line: interpretation.proofLine
      };

      console.log('[SelfMode] Validation data to save:', {
        client_email: validationData.client_email,
        mode: validationData.mode,
        timeframe: validationData.timeframe,
        intensity: validationData.intensity,
        has_goal: !!validationData.goal_challenge,
        has_responses: validationData.responses.length,
        has_fires_extracted: !!validationData.fires_extracted,
        has_proof_line: !!validationData.proof_line
      });

      const saveResult = await saveValidation(validationData);

      console.log('[SelfMode] saveValidation result:', {
        success: saveResult.success,
        hasData: !!saveResult.data,
        error: saveResult.error
      });

      if (!saveResult.success) {
        console.error('[SelfMode] Failed to save validation:', saveResult.error);
        // Don't block the user, just log the error
      } else {
        console.log('[SelfMode] Successfully saved validation with ID:', saveResult.data?.id);
        // Store validation ID for pulse and prediction
        if (saveResult.data?.id) {
          setValidationId(saveResult.data.id);
        }
      }

      setStep('results');
    } catch (err) {
      console.error('[SelfMode] Generation error:', err);
      setError(String(err));
      setStep('questions'); // Go back to questions on error
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle pulse submission
  const handlePulseSubmit = async () => {
    if (!email) return;

    const rotationWeek = getCurrentRotationWeek();
    await savePulseResponse({
      client_email: email,
      validation_id: validationId || null,
      rotation_week: rotationWeek,
      clarity_score: pulseScores.clarity,
      confidence_score: pulseScores.confidence,
      influence_score: pulseScores.influence
    });

    setStep('prediction');
  };

  // Handle prediction submission
  const handlePredictionSubmit = async () => {
    if (!email || !predictionText.trim()) {
      setStep('complete');
      return;
    }

    await savePrediction({
      client_email: email,
      validation_id: validationId || null,
      prediction_text: predictionText,
      timeframe: state.timeframe!,
      status: 'pending'
    });

    setStep('complete');
  };

  // Handle prediction review
  const handlePredictionReview = async () => {
    if (!pendingPrediction) return;

    await reviewPrediction(
      pendingPrediction.id,
      predictionOutcome,
      predictionAccuracy
    );

    setPendingPrediction(null);
    setStep('goal');  // Changed: go to goal step
  };

  // Skip prediction review
  const skipPredictionReview = () => {
    setPendingPrediction(null);
    setStep('goal');  // Changed: go to goal step
  };

  // Handle goal submission
  const handleGoalSubmit = () => {
    if (!goalInput.trim() || goalInput.trim().length < 20) {
      setError('Please provide at least 20 characters describing what you accomplished');
      return;
    }
    setError(null);
    setGoalChallenge(goalInput.trim());
    setStep('context');
  };

  // Render based on step
  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Let's start with your email
            </h2>
            <p className="text-gray-600 mb-6">
              This helps us save your progress and connect your reflections.
            </p>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              error={emailError}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
            <Button
              variant="primary"
              fullWidth
              className="mt-4"
              onClick={handleEmailSubmit}
              loading={authLoading}
            >
              Continue
            </Button>
          </Card>
        );

      case 'prediction-review':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Check Your Prediction
            </h2>
            <p className="text-gray-600 mb-4">
              Last time, you predicted:
            </p>
            <div className="bg-fg-light p-4 rounded-lg mb-6 italic text-gray-700">
              "{pendingPrediction?.prediction_text}"
            </div>
            <Textarea
              label="What actually happened?"
              value={predictionOutcome}
              onChange={(e) => setPredictionOutcome(e.target.value)}
              placeholder="Describe how things turned out..."
              rows={3}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How accurate was your prediction?
              </label>
              <Slider
                value={predictionAccuracy}
                onChange={setPredictionAccuracy}
                min={1}
                max={5}
                lowLabel="Way off"
                highLabel="Spot on"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={skipPredictionReview}>
                Skip for now
              </Button>
              <Button variant="primary" onClick={handlePredictionReview} className="flex-1">
                Save & Continue
              </Button>
            </div>
          </Card>
        );

      case 'goal':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Describe a goal, challenge, or experience you want to validate and when it happened
            </h2>
            <p className="text-gray-600 mb-6">
              Include the timeframe naturally in your description (e.g., "this week", "yesterday", "over the past month").
            </p>

            <Textarea
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., I closed a major deal this week, I led that difficult client meeting yesterday, I finished the project ahead of schedule this month..."
              rows={4}
              maxLength={500}
              showCount
              helperText={goalInput.length < 20 ? `At least 20 characters for a meaningful reflection (${goalInput.length}/20)` : undefined}
            />

            {error && <ErrorMessage message={error} className="mt-4" />}

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleGoalSubmit}
                disabled={goalInput.trim().length < 20}
              >
                Continue
              </Button>
            </div>
          </Card>
        );

      case 'context':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Level of Depth
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How deep do you want to go?
              </label>
              <IntensitySelector
                selected={state.intensity}
                onChange={(i) => setIntensity(i as Intensity)}
              />
            </div>

            {error && <ErrorMessage message={error} className="mt-4" />}

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setStep('goal')}>
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleContextComplete}
                disabled={!state.intensity}
              >
                Start Reflection
              </Button>
            </div>
          </Card>
        );

      case 'questions':
        const currentQuestion = state.selectedQuestions[currentQuestionIndex];
        if (!currentQuestion) return null;

        const elementInfo = firesInfo[currentQuestion.element];

        return (
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={state.selectedQuestions.length}
            questionText={currentQuestion.text}
            firesElement={elementInfo.label}
            firesColor={elementInfo.color}
            value={answers[currentQuestionIndex] || ''}
            onChange={(v) => handleAnswerChange(currentQuestionIndex, v)}
            onBack={currentQuestionIndex > 0 ? handlePrevQuestion : undefined}
            onNext={handleNextQuestion}
            isLastQuestion={currentQuestionIndex === state.selectedQuestions.length - 1}
          />
        );

      case 'generating':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Analyzing your reflection...
            </h2>
            <p className="text-gray-600 mt-2">
              Finding patterns in your success
            </p>
          </Card>
        );

      case 'results':
        const interpretation = state.interpretation;
        if (!interpretation) return null;

        const signalData = signalInfo[interpretation.validationSignal];
        const totalScore = interpretation.scores.replication + interpretation.scores.clarity + interpretation.scores.ownership;

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Signal Badge - moved to header of first card */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge
                  className="text-white px-4 py-2 text-lg"
                  style={{ backgroundColor: signalData.color } as React.CSSProperties}
                >
                  {signalData.label}
                </Badge>
              </div>
              <p className="text-center text-gray-600">{signalData.description}</p>
            </Card>

            {/* Validation Scores - FIRST */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Validation Scores</h3>
                <InfoIcon text="These scores measure how well you can replicate this success. Replication: Can you do this again? Clarity: How specific were you? Ownership: Did you own your actions?" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-3xl font-bold text-fg-primary">{interpretation.scores.replication}/5</div>
                  <div className="text-sm text-gray-500 mt-1">Replication</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-fg-primary">{interpretation.scores.clarity}/5</div>
                  <div className="text-sm text-gray-500 mt-1">Clarity</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-fg-primary">{interpretation.scores.ownership}/5</div>
                  <div className="text-sm text-gray-500 mt-1">Ownership</div>
                </div>
              </div>
              <div className="text-center pt-4 border-t border-gray-200">
                <div className="text-2xl font-bold text-fg-primary">{totalScore}/15</div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
            </Card>

            {/* FIRES Elements - SECOND */}
            {interpretation.firesExtracted && (
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">FIRES Elements Detected</h3>
                  <InfoIcon text="FIRES represents the key dimensions of success: Feelings (emotions), Influence (agency), Resilience (handling difficulty), Ethics (values), and Strengths (natural abilities). These were detected in your responses." />
                </div>
                <div className="space-y-3">
                  {Object.entries(interpretation.firesExtracted).map(([key, value]) => {
                    if (value.present) {
                      const elementInfo = firesInfo[key as FIRESElement];
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: elementInfo.color }}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{elementInfo.label}</span>
                            <span className="text-xs text-gray-500 ml-2">({elementInfo.description})</span>
                          </div>
                          <span className="text-sm font-semibold text-fg-primary">
                            {value.strength}/5
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </Card>
            )}

            {/* Insight - THIRD */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Insight</h3>
              <p className="text-gray-700 text-lg italic leading-relaxed">
                "{interpretation.validationInsight}"
              </p>
            </Card>

            {/* Proof Line - FOURTH */}
            {interpretation.proofLine && (
              <Card variant="elevated" padding="lg" className="bg-fg-accent bg-opacity-10 border-2 border-fg-accent">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Proof Line</h3>
                <p className="text-lg font-semibold text-gray-900 mb-3">
                  {interpretation.proofLine}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(interpretation.proofLine || '');
                  }}
                >
                  Copy Proof Line
                </Button>
              </Card>
            )}

            {/* Pattern - FIFTH (LAST) */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The Pattern</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">What Worked</h4>
                  <p className="text-gray-700">{interpretation.pattern.whatWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Why It Worked</h4>
                  <p className="text-gray-700">{interpretation.pattern.whyItWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">How to Repeat</h4>
                  <p className="text-gray-700">{interpretation.pattern.howToRepeat}</p>
                </div>
              </div>
            </Card>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setStep(showPulse ? 'pulse' : 'prediction')}
            >
              Continue
            </Button>
          </div>
        );

      case 'pulse':
        const pulseQuestions = getPulseQuestionsForWeek();
        
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Weekly Pulse Check
            </h2>
            <p className="text-gray-600 mb-6">
              Quick check on your overall clarity and confidence
            </p>

            <div className="space-y-8">
              {pulseQuestions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    {q.text}
                  </label>
                  <Slider
                    value={pulseScores[q.metric as keyof typeof pulseScores]}
                    onChange={(v) => setPulseScores(prev => ({ ...prev, [q.metric]: v }))}
                    min={1}
                    max={5}
                    lowLabel={q.lowLabel}
                    highLabel={q.highLabel}
                  />
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              fullWidth
              className="mt-8"
              onClick={handlePulseSubmit}
            >
              Continue
            </Button>
          </Card>
        );

      case 'prediction':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Make a Prediction
            </h2>
            <p className="text-gray-600 mb-6">
              Based on what you just learned, what do you predict will happen next?
            </p>

            <Textarea
              value={predictionText}
              onChange={(e) => setPredictionText(e.target.value)}
              placeholder="I predict that..."
              rows={4}
              helperText="This helps you track whether your insights translate to real outcomes"
            />

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setStep('complete')}>
                Skip
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePredictionSubmit}
                className="flex-1"
                disabled={!predictionText.trim()}
              >
                Save Prediction
              </Button>
            </div>
          </Card>
        );

      case 'complete':
        return (
          <Card variant="elevated" padding="lg" className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Validation Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              You've captured what worked and why. Use this pattern.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  resetSession();
                  setStep('context');
                  setAnswers([]);
                }}
              >
                Start Another
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/history')}
              >
                View Past Validations
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="md" className="py-8">
        <Header
          title="Build Your Proof"
          subtitle="Own the actions that created your outcome"
        />
        
        <div className="mt-8">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
}
