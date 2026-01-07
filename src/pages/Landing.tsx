import { useNavigate } from 'react-router-dom';
import { Container, Header, Card } from '../components/ui';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="md" className="py-8">
        {/* Header */}
        <Header
          title="Prove"
          subtitle="Own the actions that created your outcomes"
        />

        {/* Main content */}
        <Card variant="elevated" padding="lg" className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How would you like to build proof?
            </h2>
            <p className="text-gray-600">
              Choose a mode to begin
            </p>
          </div>

          {/* Mode selection */}
          <div className="space-y-4">
            {/* Self Mode */}
            <button
              onClick={() => navigate('/self')}
              className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-fg-primary hover:bg-fg-light transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-fg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-fg-primary transition-colors">
                    Reflect on My Own Success
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Understand how you made something happen so you can repeat it
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-fg-primary transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Send to Other Mode */}
            <button
              onClick={() => navigate('/other')}
              className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-fg-primary hover:bg-fg-light transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-fg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-fg-primary transition-colors">
                    Ask Someone "How Did You Do That?"
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Help someone else surface their proof while learning something transferable
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-fg-primary transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Request Mode */}
            <button
              onClick={() => navigate('/request')}
              className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-fg-primary hover:bg-fg-light transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-fg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-fg-primary transition-colors">
                    Get Someone's Perspective on Me
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Ask someone to share what they saw in how you achieved something
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-fg-primary transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* History link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => navigate('/history')}
              className="text-fg-primary hover:text-fg-dark font-medium transition-colors"
            >
              View past proofs →
            </button>
          </div>
        </Card>

        {/* About section */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            If you can't articulate how you got there, you can't repeat it.
            <br />
            Prove helps you own your process—so you can use it again.
          </p>
        </div>
      </Container>
    </div>
  );
}
