import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Header, Card, Button, LoadingSpinner } from '../components/ui';
import { getInvitationByShareId } from '../lib/api';

export default function RecipientView() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      if (!shareId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      const result = await getInvitationByShareId(shareId);
      if (result.success && result.data) {
        setInvitation(result.data);
      } else {
        setError('Invitation not found or expired');
      }
      setLoading(false);
    }

    loadInvitation();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fg-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-fg-light">
        <Container size="md" className="py-8">
          <Header title="Validation" />
          <Card variant="elevated" padding="lg" className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              This invitation may have expired or been completed.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="md" className="py-8">
        <Header
          title="You've Been Invited"
          subtitle={`${invitation.sender_name || 'Someone'} wants to learn from your success`}
        />
        
        <Card variant="elevated" padding="lg" className="mt-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-fg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">
              {invitation.sender_name || 'Someone'} noticed something you did well and wants to understand how you did it.
            </p>
            {invitation.sender_context && (
              <div className="bg-fg-light p-4 rounded-lg text-left">
                <p className="text-sm text-gray-500 mb-1">What they noticed:</p>
                <p className="text-gray-700 italic">"{invitation.sender_context}"</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recipient Flow Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              The recipient experience is being built. Check back soon!
            </p>
            
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
