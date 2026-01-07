import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Header, Card, Button, LoadingSpinner } from '../components/ui';
import { getInvitationByShareId } from '../lib/api';

export default function SenderView() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      if (!shareId) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      const result = await getInvitationByShareId(shareId);
      if (result.success && result.data) {
        setInvitation(result.data);
      } else {
        setError('Invitation not found');
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
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  const isCompleted = invitation.status === 'completed';

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="md" className="py-8">
        <Header
          title={isCompleted ? `${invitation.recipient_name} Responded!` : 'Waiting for Response'}
          subtitle={isCompleted ? "See what they shared" : `${invitation.recipient_name} hasn't responded yet`}
        />
        
        <Card variant="elevated" padding="lg" className="mt-8 text-center">
          {isCompleted ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Response Received
              </h3>
              <p className="text-gray-600 mb-6">
                Full comparison view coming soon!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Waiting for {invitation.recipient_name}
              </h3>
              <p className="text-gray-600 mb-6">
                We'll notify you when they respond.
              </p>
            </>
          )}
          
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </Container>
    </div>
  );
}
