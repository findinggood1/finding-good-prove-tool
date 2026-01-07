import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Header, Card, Button, LoadingSpinner, Badge, EmptyState } from '../components/ui';
import { getValidations } from '../lib/api';
import { signalInfo, firesInfo } from '../lib/questions';
import type { Validation, FIRESElement } from '../types/validation';

export default function History() {
  const navigate = useNavigate();
  const { email, isAuthenticated } = useAuth();
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadValidations() {
      if (!email) {
        setLoading(false);
        return;
      }

      const result = await getValidations(email);
      if (result.success && result.data) {
        setValidations(result.data);
      }
      setLoading(false);
    }

    loadValidations();
  }, [email]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-fg-light">
        <Container size="md" className="py-8">
          <Header title="Proof Library" />
          <Card variant="elevated" padding="lg" className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sign in to see your proof library
            </h2>
            <Button variant="primary" onClick={() => navigate('/self')}>
              Start Building Proof
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-fg-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fg-light">
      <Container size="lg" className="py-8">
        <div className="flex items-center justify-between mb-8">
          <Header title="Proof Library" showLogo={false} />
          <Button variant="primary" onClick={() => navigate('/self')}>
            Add Proof
          </Button>
        </div>

        {validations.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No proof collected yet"
            description="Start building your proof library to track what works and why"
            action={
              <Button variant="primary" onClick={() => navigate('/self')}>
                Build Your First Proof
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {validations.map((v) => {
              const signal = signalInfo[v.validation_signal];
              const isExpanded = expandedId === v.id;

              return (
                <Card
                  key={v.id}
                  variant="elevated"
                  padding="none"
                  className="overflow-hidden"
                >
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(v.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className="text-white"
                            style={{ backgroundColor: signal.color } as React.CSSProperties}
                          >
                            {signal.label}
                          </Badge>
                          <span className="text-sm text-gray-500 capitalize">
                            {v.timeframe} • {v.intensity}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium line-clamp-2">
                          "{v.validation_insight}"
                        </p>
                        {v.fires_extracted && (
                          <div className="flex gap-2 mt-3">
                            {Object.entries(v.fires_extracted).map(([key, value]) => {
                              if (value.present) {
                                const element = key as FIRESElement;
                                return (
                                  <span
                                    key={element}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: `${firesInfo[element].color}20`,
                                      color: firesInfo[element].color
                                    }}
                                  >
                                    {firesInfo[element].label}
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(v.created_at)}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 animate-fade-in">
                      {/* Pattern */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">What Worked</h4>
                          <p className="text-gray-700">{v.pattern.whatWorked}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Why It Worked</h4>
                          <p className="text-gray-700">{v.pattern.whyItWorked}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">How to Repeat</h4>
                          <p className="text-gray-700">{v.pattern.howToRepeat}</p>
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Scores</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-fg-primary">{v.scores.replication}</div>
                            <div className="text-xs text-gray-500">Replication</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-fg-primary">{v.scores.clarity}</div>
                            <div className="text-xs text-gray-500">Clarity</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-fg-primary">{v.scores.ownership}</div>
                            <div className="text-xs text-gray-500">Ownership</div>
                          </div>
                        </div>
                      </div>

                      {/* Responses */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Your Responses</h4>
                        <div className="space-y-4">
                          {v.responses.map((r, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: firesInfo[r.element].color }}
                                />
                                <span className="text-sm text-gray-500">{firesInfo[r.element].label}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 italic">"{r.questionText}"</p>
                              <p className="text-gray-800">{r.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
