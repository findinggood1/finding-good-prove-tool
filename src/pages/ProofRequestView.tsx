import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Header,
  Card,
  Button,
  Input,
  Textarea,
  LoadingSpinner,
  ErrorMessage
} from '../components/ui';
import { getProofRequestByShareId, completeProofRequest } from '../lib/api';
import type { ProofRequest } from '../types/validation';

type Step =
  | 'loading'
  | 'not-found'
  | 'already-completed'
  | 'context'
  | 'questions'
  | 'submitting'
  | 'complete';

export default function ProofRequestView() {
  const navigate = useNavigate();
  const { shareId } = useParams<{ shareId: string }>();

  // State
  const [step, setStep] = useState<Step>('loading');
  const [request, setRequest] = useState<ProofRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Response data
  const [responderEmail, setResponderEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({
    what_observed: '',
    how_approached: '',
    impact_observed: '',
    strength_shown: '',
    similar_situations: ''
  });

  // Question definitions
  const questions = [
    {
      key: 'what_observed' as const,
      label: 'What did you see them do?',
      placeholder: 'Describe the specific actions or behaviors you observed...',
      helperText: 'Be specific about what you actually saw them do',
      required: true
    },
    {
      key: 'how_approached' as const,
      label: 'How did they approach it?',
      placeholder: 'Describe their method, style, or approach...',
      helperText: 'What was distinctive about how they handled this?',
      required: true
    },
    {
      key: 'impact_observed' as const,
      label: 'What impact did it have?',
      placeholder: 'Describe the results or effects you noticed...',
      helperText: 'What changed? What happened as a result?',
      required: true
    },
    {
      key: 'strength_shown' as const,
      label: 'What strength did they show?',
      placeholder: 'What capability or quality did you see in action...',
      helperText: 'What natural ability or skill did they demonstrate?',
      required: true
    },
    {
      key: 'similar_situations' as const,
      label: 'When have you seen them do something similar? (Optional)',
      placeholder: 'Other times you\'ve observed this pattern...',
      helperText: 'This helps them see their consistency',
      required: false
    }
  ];

  // Load proof request on mount
  useEffect(() => {
    if (!shareId) {
      setStep('not-found');
      return;
    }

    loadProofRequest();
  }, [shareId]);

  const loadProofRequest = async () => {
    if (!shareId) return;

    try {
      const result = await getProofRequestByShareId(shareId);

      if (!result.success || !result.data) {
        setStep('not-found');
        return;
      }

      setRequest(result.data);

      // Check if already completed
      if (result.data.status === 'completed') {
        setStep('already-completed');
      } else {
        setStep('context');
      }
    } catch (err) {
      console.error('Error loading proof request:', err);
      setError(String(err));
      setStep('not-found');
    }
  };

  // Handle email submission
  const handleEmailSubmit = () => {
    if (!responderEmail || !responderEmail.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setStep('questions');
  };

  // Handle question navigation
  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = responses[currentQuestion.key];

    if (currentQuestion.required && (!currentAnswer || currentAnswer.trim().length < 20)) {
      setError('Please provide at least 20 characters for this response');
      return;
    }

    setError(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError(null);
    } else {
      setStep('context');
      setError(null);
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!shareId || !responderEmail) return;

    setStep('submitting');
    setError(null);

    try {
      const result = await completeProofRequest(shareId, responderEmail, responses);

      if (result.success) {
        setStep('complete');
      } else {
        throw new Error(result.error || 'Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(String(err));
      setStep('questions');
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 'loading':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading request...</p>
          </Card>
        );

      case 'not-found':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Request Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              This proof request doesn't exist or the link is invalid.
            </p>
            {error && <ErrorMessage message={error} className="mb-4" />}
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </Card>
        );

      case 'already-completed':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Already Completed
            </h2>
            <p className="text-gray-600 mb-6">
              Someone has already responded to this proof request.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Start Your Own Reflection
            </Button>
          </Card>
        );

      case 'context':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {request?.requester_name || 'Someone'} would like your perspective
            </h2>
            <p className="text-gray-600 mb-6">
              They want to understand HOW they succeeded and need your observations
            </p>

            {/* Show the context */}
            <div className="bg-fg-light rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">What they accomplished:</p>
              <p className="font-medium text-gray-900 mb-3">
                "{request?.goal_challenge}"
              </p>
              {request?.what_you_did && (
                <>
                  <p className="text-sm text-gray-500 mb-2">Context they provided:</p>
                  <p className="text-sm text-gray-700 italic">
                    {request.what_you_did}
                  </p>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              You'll be asked to share what you observed about their approach, impact, and strengths.
            </p>

            {/* Collect email */}
            <Input
              label="Your email"
              type="email"
              value={responderEmail}
              onChange={(e) => setResponderEmail(e.target.value)}
              placeholder="your@email.com"
              error={emailError}
              helperText="So they know who provided this perspective"
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleEmailSubmit}
              >
                Continue
              </Button>
            </div>
          </Card>
        );

      case 'questions':
        const currentQuestion = questions[currentQuestionIndex];
        const currentAnswer = responses[currentQuestion.key];
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        const canProceed = !currentQuestion.required || (currentAnswer && currentAnswer.trim().length >= 20);

        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {currentQuestion.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-fg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <Textarea
              label={currentQuestion.label}
              value={currentAnswer}
              onChange={(e) => setResponses({ ...responses, [currentQuestion.key]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              helperText={currentQuestion.helperText}
              rows={6}
              maxLength={1000}
              showCount
            />

            {error && <ErrorMessage message={error} className="mt-4" />}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleNext}
                disabled={!canProceed}
              >
                {isLastQuestion ? 'Submit Response' : 'Next Question'}
              </Button>
            </div>
          </Card>
        );

      case 'submitting':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Submitting your perspective...
            </h2>
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
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your perspective has been shared with {request?.requester_name || 'the requester'}.
              Your observations will help them understand how they succeeded.
            </p>

            <div className="bg-fg-light rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                The insights you've shared help them see what they might have missed about their own success.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/')}
              >
                Start Your Own Reflection
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => window.close()}
              >
                Close
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
          title="Share Your Perspective"
          subtitle="Help someone understand how their success happened"
        />

        <div className="mt-8">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
}
