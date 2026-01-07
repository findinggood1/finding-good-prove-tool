import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Header,
  Card,
  Button,
  LoadingSpinner
} from '../components/ui';

/**
 * ProofRequestView - Respond to Request Mode
 * When someone shares /p/:shareId link, recipient comes here to provide their perspective
 *
 * This will be fully implemented in Phase 6
 */
export default function ProofRequestView() {
  const navigate = useNavigate();
  const { shareId } = useParams<{ shareId: string }>();

  return (
    <div className="min-h-screen bg-fg-light py-8">
      <Container size="md">
        <Header
          title="Proof Request Response"
          subtitle="Coming soon in Phase 6"
        />

        <Card variant="elevated" padding="lg" className="mt-8">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">
              Share ID: <span className="font-mono text-fg-primary">{shareId}</span>
            </p>
            <p className="text-gray-500">
              This page will allow someone to provide their perspective on your proof.
            </p>
            <p className="text-gray-500 text-sm">
              Phase 6: Request Mode - Full implementation pending
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
