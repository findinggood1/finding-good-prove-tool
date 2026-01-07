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
  TimeframeSelector,
  IntensitySelector,
  FIRESElementSelector,
  QuestionCard,
  LoadingSpinner,
  Slider,
  Badge,
  ErrorMessage
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
import type { FIRESElement, Timeframe, Intensity, QuestionResponse, Prediction } from '../types/validation';

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
  const { state, setMode, setGoalChallenge, setTimeframe, setIntensity, toggleFiresFocus, setSelectedQuestions, setInterpretation, resetSession } = useApp();

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
    if (!state.timeframe || !state.intensity) {
      setError('Please select a timeframe and intensity');
      return;
    }

    const questions = selectQuestionsForSession(
      state.firesFocus,
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

      // Call Edge Function
      const result = await interpretValidation({
        mode: 'self',
        goal_challenge: state.goalChallenge!,
        timeframe: state.timeframe!,
        intensity: state.intensity!,
        fires_focus: state.firesFocus,
        responses
      });

      if (result.success && result.data) {
        setInterpretation(result.data);
        
        // Save to database
        await saveValidation({
          client_email: email!,
          mode: 'self',
          goal_challenge: state.goalChallenge!,
          timeframe: state.timeframe!,
          intensity: state.intensity!,
          fires_focus: state.firesFocus,
          responses,
          validation_signal: result.data.validationSignal,
          validation_insight: result.data.validationInsight,
          scores: result.data.scores,
          pattern: result.data.pattern
        });

        setStep('results');
      } else {
        throw new Error(result.error || 'Failed to generate interpretation');
      }
    } catch (err) {
      console.error('Generation error:', err);
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
      validation_id: '', // Would need actual validation ID
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
      validation_id: '', // Would need actual validation ID
      prediction_text: predictionText,
      timeframe: state.timeframe!,
      fires_focus: state.firesFocus,
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
              What's the goal, challenge, or thing that mattered?
            </h2>
            <p className="text-gray-600 mb-6">
              Describe what you accomplished or handled that you want to understand better.
            </p>

            <Textarea
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., I led that difficult client meeting, finished the project ahead of schedule, handled the team conflict constructively..."
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
              Set Your Context
            </h2>

            <div className="space-y-6">
              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What timeframe are you reflecting on?
                </label>
                <TimeframeSelector
                  selected={state.timeframe}
                  onChange={(t) => setTimeframe(t as Timeframe)}
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How deep do you want to go?
                </label>
                <IntensitySelector
                  selected={state.intensity}
                  onChange={(i) => setIntensity(i as Intensity)}
                />
              </div>

              {/* FIRES Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What areas do you want to explore?
                </label>
                <FIRESElementSelector
                  selected={state.firesFocus}
                  onToggle={(e) => toggleFiresFocus(e as FIRESElement)}
                  max={3}
                />
              </div>
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
                disabled={!state.timeframe || !state.intensity}
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

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Signal Badge */}
            <Card variant="elevated" padding="lg">
              <div className="text-center">
                <Badge
                  className="text-white px-4 py-2 text-lg"
                  style={{ backgroundColor: signalData.color } as React.CSSProperties}
                >
                  {signalData.label}
                </Badge>
                <p className="mt-4 text-gray-600">{signalData.description}</p>
              </div>
            </Card>

            {/* Insight */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Insight</h3>
              <p className="text-gray-700 text-lg italic">
                "{interpretation.validationInsight}"
              </p>
            </Card>

            {/* Pattern */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The Pattern</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">What Worked</h4>
                  <p className="text-gray-700">{interpretation.pattern.whatWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Why It Worked</h4>
                  <p className="text-gray-700">{interpretation.pattern.whyItWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">How to Repeat</h4>
                  <p className="text-gray-700">{interpretation.pattern.howToRepeat}</p>
                </div>
              </div>
            </Card>

            {/* Scores */}
            <Card variant="outlined" padding="md">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Validation Scores</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-fg-primary">{interpretation.scores.replication}</div>
                  <div className="text-xs text-gray-500">Replication</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-fg-primary">{interpretation.scores.clarity}</div>
                  <div className="text-xs text-gray-500">Clarity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-fg-primary">{interpretation.scores.ownership}</div>
                  <div className="text-xs text-gray-500">Ownership</div>
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
