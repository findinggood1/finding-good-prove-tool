import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Header, Card, Button, LoadingSpinner, Textarea, Input, Badge } from '../components/ui';
import { getInvitationByShareId, updateInvitationStatus, interpretValidation, saveValidation, completeInvitation } from '../lib/api';
import { firesInfo } from '../lib/questions';
import type { ValidationInvitation, QuestionResponse, FIRESElement, ValidationInterpretation } from '../types/validation';

type Step = 'loading' | 'intro' | 'email' | 'questions' | 'generating' | 'results' | 'error';

// Fixed questions for Other Mode (no intensity selection)
const RECIPIENT_QUESTIONS = [
  {
    id: 'approach',
    text: 'What were you doing that made this work?',
    element: 'influence' as FIRESElement
  },
  {
    id: 'notice',
    text: 'What did you notice about your approach?',
    element: 'feelings' as FIRESElement
  },
  {
    id: 'strength',
    text: 'What strength did you draw on?',
    element: 'strengths' as FIRESElement
  },
  {
    id: 'future',
    text: 'How might you do something similar in the future?',
    element: 'resilience' as FIRESElement
  }
];

export default function RecipientView() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('loading');
  const [invitation, setInvitation] = useState<ValidationInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [clipboardSuccess, setClipboardSuccess] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(RECIPIENT_QUESTIONS.length).fill(''));
  const [interpretation, setInterpretation] = useState<ValidationInterpretation | null>(null);

  // Handle clipboard copy
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setClipboardSuccess(true);
      setTimeout(() => setClipboardSuccess(false), 2000);
    } catch (err) {
      console.error('[RecipientView] Clipboard copy failed:', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  useEffect(() => {
    async function loadInvitation() {
      if (!shareId) {
        setError('Invalid invitation link');
        setStep('error');
        return;
      }

      const result = await getInvitationByShareId(shareId);
      if (result.success && result.data) {
        const inv = result.data;

        // Check if already completed
        if (inv.status === 'completed') {
          setError('This invitation has already been completed');
          setStep('error');
          return;
        }

        setInvitation(inv);

        // Mark as viewed if pending
        if (inv.status === 'pending') {
          await updateInvitationStatus(shareId, 'viewed');
        }

        setStep('intro');
      } else {
        setError('Invitation not found or expired');
        setStep('error');
      }
    }

    loadInvitation();
  }, [shareId]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    setError(null);
    setStep('questions');
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestionIndex].trim();

    if (currentAnswer.length < 20) {
      setError('Please provide at least 20 characters');
      return;
    }

    setError(null);

    if (currentQuestionIndex < RECIPIENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - generate interpretation
      generateInterpretation();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const generateInterpretation = async () => {
    setStep('generating');

    // Build responses array
    const responses: QuestionResponse[] = RECIPIENT_QUESTIONS.map((q, i) => ({
      questionId: q.id,
      questionText: q.text,
      element: q.element,
      answer: answers[i]
    }));

    // Call AI interpretation
    // Use defaults since Send to Others mode doesn't collect these
    const timeframe = 'week';
    const intensity = 'balanced';

    const interpretResult = await interpretValidation({
      mode: 'recipient',
      goal_challenge: invitation!.what_sender_noticed,
      timeframe,
      intensity,
      responses,
      sender_context: invitation!.what_sender_noticed,
      sender_name: invitation!.sender_name,
      recipient_name: invitation!.recipient_name
    });

    if (!interpretResult.success || !interpretResult.data) {
      setError(interpretResult.error || 'Failed to generate interpretation');
      setStep('questions');
      return;
    }

    const interpretData = interpretResult.data;
    setInterpretation(interpretData);

    // Save validation for recipient
    const saveResult = await saveValidation({
      client_email: recipientEmail,
      mode: 'other_recipient',
      timeframe,
      intensity,
      goal_challenge: invitation!.what_sender_noticed,
      responses,
      validation_signal: interpretData.validationSignal,
      validation_insight: interpretData.validationInsight,
      scores: interpretData.scores,
      pattern: interpretData.pattern,
      fires_extracted: interpretData.firesExtracted,
      proof_line: interpretData.proofLine,
      invitation_id: invitation!.id
    });

    if (saveResult.success && saveResult.data) {
      // Complete the invitation
      try {
        const completeResult = await completeInvitation(
          shareId!,
          recipientEmail,
          saveResult.data.id,
          {
            whatSenderSaw: invitation!.what_sender_noticed,
            whatRecipientRevealed: interpretData.proofLine || interpretData.validationInsight,
            sharedTruth: interpretData.pattern.whatWorked
          }
        );

        if (!completeResult.success) {
          console.error('[RecipientView] Failed to complete invitation:', completeResult.error);
          // Don't block user - they can still see results
        }
      } catch (err) {
        console.error('[RecipientView] Error completing invitation:', err);
        // Don't block user - they can still see results
      }
    }

    setStep('results');
  };

  const renderStep = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        );

      case 'intro':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-fg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {invitation?.sender_name || 'Someone'} noticed something you did well
              </h2>
              <p className="text-gray-600 mb-6">
                They want to help you understand HOW you did it—so you can do it again
              </p>
            </div>

            <div className="bg-fg-light rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">What they noticed:</p>
              <p className="text-gray-900 italic">"{invitation?.what_sender_noticed}"</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>This will take about 5 minutes.</strong><br />
                You'll answer a few questions about your approach, and we'll help you surface the patterns you can repeat.
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={() => setStep('email')}>
              Get Started
            </Button>
          </Card>
        );

      case 'email':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Before we begin...
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your email so we can save your proof for future reference
            </p>
            <form onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                label="Your Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('intro')}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        );

      case 'questions':
        const currentQuestion = RECIPIENT_QUESTIONS[currentQuestionIndex];
        const currentAnswer = answers[currentQuestionIndex];
        const charCount = currentAnswer.length;
        const isValid = charCount >= 20;

        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {RECIPIENT_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentQuestionIndex
                      ? 'bg-fg-primary'
                      : i < currentQuestionIndex
                      ? 'bg-fg-accent'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {RECIPIENT_QUESTIONS.length}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${firesInfo[currentQuestion.element].color}20`,
                    color: firesInfo[currentQuestion.element].color
                  }}
                >
                  {firesInfo[currentQuestion.element].label}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion.text}
              </h2>
            </div>

            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Take your time to reflect..."
              rows={6}
              maxLength={2000}
            />

            <div className="flex items-center justify-between mt-2 text-sm">
              <span className={charCount >= 20 ? 'text-green-600' : 'text-gray-500'}>
                {charCount >= 20 ? '✓ Ready' : `${charCount}/20 characters minimum`}
              </span>
              <span className="text-gray-500">{charCount}/2000</span>
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              <Button
                variant="primary"
                fullWidth
                onClick={handleNext}
                disabled={!isValid}
              >
                {currentQuestionIndex === RECIPIENT_QUESTIONS.length - 1 ? 'Generate Insights' : 'Next'}
              </Button>
            </div>
          </Card>
        );

      case 'generating':
        return (
          <Card variant="elevated" padding="lg" className="text-center animate-fade-in">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">
              Analyzing your responses and extracting the patterns you can repeat...
            </p>
          </Card>
        );

      case 'results':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Celebration header */}
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Here's Your Proof
              </h2>
              <p className="text-gray-600">
                {invitation?.sender_name || 'They'} saw it, and now you understand how you did it
              </p>
            </Card>

            {/* Proof Line - Shareable */}
            {interpretation?.proofLine && (
              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Your Proof Line</h3>
                <p className="text-lg font-medium text-gray-900 italic mb-4">
                  "{interpretation.proofLine}"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(interpretation.proofLine!)}
                >
                  {clipboardSuccess ? '✓ Copied!' : 'Copy'}
                </Button>
              </Card>
            )}

            {/* Insight */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Insight</h3>
              <p className="text-gray-900">{interpretation?.validationInsight}</p>
            </Card>

            {/* Pattern */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Your Pattern</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">What Worked</h4>
                  <p className="text-gray-600">{interpretation?.pattern.whatWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Why It Worked</h4>
                  <p className="text-gray-600">{interpretation?.pattern.whyItWorked}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">How to Repeat</h4>
                  <p className="text-gray-600">{interpretation?.pattern.howToRepeat}</p>
                </div>
              </div>
            </Card>

            {/* FIRES Elements Detected */}
            {interpretation?.firesExtracted && (
              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Strengths We Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(interpretation.firesExtracted).map(([key, value]) => {
                    if (value.present) {
                      const element = key as FIRESElement;
                      return (
                        <Badge
                          key={element}
                          className="text-white"
                          style={{ backgroundColor: firesInfo[element].color }}
                        >
                          {firesInfo[element].label}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </Card>
            )}

            {/* What sender saw */}
            <Card variant="outlined" padding="lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                What {invitation?.sender_name || 'they'} noticed:
              </h3>
              <p className="text-gray-700 italic">"{invitation?.what_sender_noticed}"</p>
            </Card>

            {/* Actions */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                What's next?
              </h3>
              <div className="space-y-3">
                <Button variant="primary" fullWidth onClick={() => navigate('/self')}>
                  Build More Proof
                </Button>
                <Button variant="outline" fullWidth onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'error':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              This invitation may have expired or been completed already.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
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
          title="You've Been Noticed"
          subtitle="Someone saw you succeed—let's understand how you did it"
        />
        <div className="mt-8">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
}
