import { useNavigate } from 'react-router-dom';
import { Container, Header, Card, Button } from '../components/ui';

export default function OtherMode() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="md" className="py-8">
        <Header
          title="Ask How They Did It"
          subtitle="Help someone else surface their proof while learning something transferable"
        />
        
        <Card variant="elevated" padding="lg" className="mt-8 text-center">
          <div className="w-16 h-16 bg-fg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            This mode lets you help someone else articulate how they achieved something you noticed.
            The gift is in the asking—you both learn something valuable.
          </p>
          
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </Container>
    </div>
  );
}
