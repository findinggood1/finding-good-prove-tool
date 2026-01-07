import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Header, Card, Button, Input, Textarea, LoadingSpinner } from '../components/ui';
import { createInvitation } from '../lib/api';

type Step = 'email' | 'recipient' | 'context' | 'sending' | 'complete';

export default function OtherMode() {
  const navigate = useNavigate();
  const { email, isAuthenticated, login } = useAuth();
  const [step, setStep] = useState<Step>(!isAuthenticated ? 'email' : 'recipient');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [successDescription, setSuccessDescription] = useState('');
  const [shareId, setShareId] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!senderEmail) {
      setError('Please enter your email');
      return;
    }

    const success = await login(senderEmail);
    if (success) {
      setStep('recipient');
    } else {
      setError('Failed to authenticate. Please try again.');
    }
  };

  const handleRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientName.trim()) {
      setError('Please enter the recipient\'s name');
      return;
    }

    setStep('context');
  };

  const handleContextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!successDescription.trim() || successDescription.trim().length < 20) {
      setError('Please provide at least 20 characters describing what you saw them accomplish');
      return;
    }

    setStep('sending');

    // Create the invitation
    const result = await createInvitation({
      sender_email: email!,
      sender_name: senderName || email!.split('@')[0],
      recipient_name: recipientName,
      sender_context: successDescription,
      timeframe: 'week', // Default for Other mode
      intensity: 'balanced' // Default for Other mode
    });

    if (result.success && result.data) {
      setShareId(result.data.share_id);
      setStep('complete');
    } else {
      setError(result.error || 'Failed to create invitation');
      setStep('context');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/v/${shareId}`;
    navigator.clipboard.writeText(link);
  };

  const startAnother = () => {
    setRecipientName('');
    setSuccessDescription('');
    setShareId('');
    setError(null);
    setStep('recipient');
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome!
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your email to get started
            </p>
            <form onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                label="Your Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
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
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        );

      case 'recipient':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who did you see succeed?
              </h2>
              <p className="text-gray-600">
                You're about to give someone the gift of recognizing their success
              </p>
            </div>
            <form onSubmit={handleRecipientSubmit}>
              <Input
                type="text"
                label="Your Name (optional)"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="How should they know you?"
                helperText="This will be shown to the recipient"
              />
              <div className="mt-4">
                <Input
                  type="text"
                  label="Their Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Who succeeded?"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        );

      case 'context':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What did you see {recipientName} accomplish?
              </h2>
              <p className="text-gray-600">
                Describe what you noticed. Be specific—the more detail you provide, the more valuable this reflection will be.
              </p>
            </div>
            <form onSubmit={handleContextSubmit}>
              <Textarea
                label="What You Saw"
                value={successDescription}
                onChange={(e) => setSuccessDescription(e.target.value)}
                placeholder="I saw you handle that difficult conversation with real skill. You stayed calm, asked good questions, and helped everyone find common ground..."
                rows={6}
                maxLength={1000}
                showCount
                helperText="Minimum 20 characters"
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('recipient')}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Create Link
                </Button>
              </div>
            </form>
          </Card>
        );

      case 'sending':
        return (
          <Card variant="elevated" padding="lg" className="text-center animate-fade-in">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Creating your gift link...</p>
          </Card>
        );

      case 'complete':
        return (
          <Card variant="elevated" padding="lg" className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your gift is ready!
              </h2>
              <p className="text-gray-600">
                Share this link with {recipientName}. When they use it, they'll reflect on how they achieved this success.
              </p>
            </div>

            <div className="bg-fg-light rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Shareable Link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-300 truncate">
                  {window.location.origin}/v/{shareId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareLink}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What happens next:</strong><br />
                {recipientName} will answer a few reflection questions about how they did this. They'll receive insights about their approach that they can use again in the future.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={startAnother}>
                Help Someone Else
              </Button>
              <Button variant="ghost" onClick={() => navigate('/history')}>
                View My Invitations
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
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
          title="I Saw You Do Something Great"
          subtitle="Help someone understand HOW they succeeded—the gift is in the noticing"
        />

        <div className="mt-8">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
}
