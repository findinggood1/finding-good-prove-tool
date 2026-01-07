import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
import { createProofRequest, sendProofRequestEmail } from '../lib/api';

// Flow steps
type Step = 
  | 'email'
  | 'recipient'
  | 'context'
  | 'preview'
  | 'sending'
  | 'complete';

export default function RequestMode() {
  const navigate = useNavigate();
  const { email, isAuthenticated, login, isLoading: authLoading } = useAuth();

  // Local state
  const [step, setStep] = useState<Step>('email');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Request details
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [goalChallenge, setGoalChallenge] = useState('');
  const [whatYouDid, setWhatYouDid] = useState('');
  const [shareId, setShareId] = useState('');

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && step === 'email') {
      setStep('recipient');
    }
  }, [isAuthenticated, step]);

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const success = await login(emailInput);
    if (success) {
      setEmailError('');
      setStep('recipient');
    } else {
      setEmailError('Unable to sign in. Please try again.');
    }
  };

  // Handle recipient info submission
  const handleRecipientSubmit = () => {
    if (!recipientName.trim()) {
      setError('Please enter the person\'s name');
      return;
    }
    setError(null);
    setStep('context');
  };

  // Handle context submission
  const handleContextSubmit = () => {
    if (!goalChallenge.trim()) {
      setError('Please describe what you accomplished');
      return;
    }
    setError(null);
    setStep('preview');
  };

  // Handle sending the request
  const handleSend = async () => {
    if (!email) return;
    
    setStep('sending');
    setError(null);

    try {
      // Create the proof request
      const result = await createProofRequest({
        requester_email: email,
        requester_name: email.split('@')[0], // Use email prefix as name
        recipient_name: recipientName,
        recipient_email: recipientEmail || undefined,
        goal_challenge: goalChallenge,
        what_you_did: whatYouDid || undefined
      });

      if (result.success && result.data) {
        setShareId(result.data.share_id);
        
        // Send email if recipient email provided
        if (recipientEmail) {
          await sendProofRequestEmail({
            share_id: result.data.share_id,
            requester_email: email,
            requester_name: email.split('@')[0],
            recipient_name: recipientName,
            recipient_email: recipientEmail,
            goal_challenge: goalChallenge
          });
        }
        
        setStep('complete');
      } else {
        throw new Error(result.error || 'Failed to create request');
      }
    } catch (err) {
      console.error('Error creating request:', err);
      setError(String(err));
      setStep('preview');
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/p/${shareId}`;
    navigator.clipboard.writeText(link);
  };

  // Render current step
  const renderStep = () => {
    if (authLoading) {
      return (
        <Card variant="elevated" padding="lg" className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </Card>
      );
    }

    switch (step) {
      case 'email':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              First, let's identify you
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your email so the person you ask can share their perspective with you
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
            >
              Continue
            </Button>
          </Card>
        );

      case 'recipient':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Who do you want to ask?
            </h2>
            <p className="text-gray-600 mb-6">
              Choose someone who observed your success and can share what they saw
            </p>

            <div className="space-y-4">
              <Input
                label="Their name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Sarah, my manager"
              />

              <Input
                label="Their email (optional)"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="their@email.com"
                helperText="If provided, we'll send them an invitation directly"
              />
            </div>

            {error && <ErrorMessage message={error} className="mt-4" />}

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleRecipientSubmit}
              >
                Continue
              </Button>
            </div>
          </Card>
        );

      case 'context':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              What do you want their perspective on?
            </h2>
            <p className="text-gray-600 mb-6">
              Describe what you accomplished that you'd like {recipientName} to reflect on
            </p>

            <div className="space-y-4">
              <Textarea
                label="The goal, challenge, or accomplishment"
                value={goalChallenge}
                onChange={(e) => setGoalChallenge(e.target.value)}
                placeholder="e.g., Leading the product launch last month, handling that difficult client conversation..."
                rows={3}
                maxLength={500}
                showCount
              />

              <Textarea
                label="What you did (optional - helps them remember)"
                value={whatYouDid}
                onChange={(e) => setWhatYouDid(e.target.value)}
                placeholder="e.g., I coordinated with 5 teams, presented to the board..."
                rows={3}
                maxLength={500}
                showCount
                helperText="This gives them context to provide better observations"
              />
            </div>

            {error && <ErrorMessage message={error} className="mt-4" />}

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setStep('recipient')}>
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleContextSubmit}
                disabled={!goalChallenge.trim()}
              >
                Preview Request
              </Button>
            </div>
          </Card>
        );

      case 'preview':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Preview your request
            </h2>

            {/* Preview card */}
            <div className="bg-fg-light rounded-lg p-6 mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-gray-900">{recipientName}</span> will receive:
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 mb-3">
                  "{email?.split('@')[0]}" would like your perspective on something they accomplished:
                </p>
                <p className="font-medium text-gray-900 mb-2">
                  "{goalChallenge}"
                </p>
                {whatYouDid && (
                  <p className="text-sm text-gray-600 italic">
                    Context: {whatYouDid}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                They'll be asked questions like: "What did you see them do?", "How did they approach it?", "What impact did it have?"
              </p>
            </div>

            {error && <ErrorMessage message={error} className="mb-4" />}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('context')}>
                Edit
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSend}
              >
                {recipientEmail ? 'Send Request' : 'Create Link'}
              </Button>
            </div>
          </Card>
        );

      case 'sending':
        return (
          <Card variant="elevated" padding="lg" className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Creating your request...
            </h2>
          </Card>
        );

      case 'complete':
        const shareLink = `${window.location.origin}/p/${shareId}`;
        
        return (
          <Card variant="elevated" padding="lg" className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {recipientEmail ? 'Request Sent!' : 'Link Created!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {recipientEmail 
                ? `We've sent an invitation to ${recipientName}. You'll be notified when they respond.`
                : `Share this link with ${recipientName} to get their perspective.`
              }
            </p>

            {/* Share link */}
            <div className="bg-fg-light rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Share this link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-200 truncate">
                  {shareLink}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/')}
              >
                Done
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setStep('recipient');
                  setRecipientName('');
                  setRecipientEmail('');
                  setGoalChallenge('');
                  setWhatYouDid('');
                  setShareId('');
                }}
              >
                Request from Someone Else
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
          title="Get External Perspective"
          subtitle="Ask someone to share what they observed about your success"
        />
        
        <div className="mt-8">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
}
