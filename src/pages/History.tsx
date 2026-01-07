import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Header, Card, Button, LoadingSpinner, Badge, EmptyState } from '../components/ui';
import { getValidations, getMyProofRequests } from '../lib/api';
import { signalInfo, firesInfo } from '../lib/questions';
import type { Validation, FIRESElement, ProofRequest } from '../types/validation';

type Tab = 'proofs' | 'requests';

export default function History() {
  const navigate = useNavigate();
  const { email, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('proofs');
  const [validations, setValidations] = useState<Validation[]>([]);
  const [proofRequests, setProofRequests] = useState<ProofRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!email) {
        setLoading(false);
        return;
      }

      // Load both validations and proof requests
      const [validationsResult, requestsResult] = await Promise.all([
        getValidations(email),
        getMyProofRequests(email)
      ]);

      if (validationsResult.success && validationsResult.data) {
        setValidations(validationsResult.data);
      }

      if (requestsResult.success && requestsResult.data) {
        setProofRequests(requestsResult.data);
      }

      setLoading(false);
    }

    loadData();
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

  const toggleExpandRequest = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const getStatusBadge = (status: ProofRequest['status']) => {
    const styles = {
      pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
      viewed: { bg: '#DBEAFE', text: '#1E40AF', label: 'Viewed' },
      completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
      expired: { bg: '#FEE2E2', text: '#991B1B', label: 'Expired' }
    };
    const style = styles[status];
    return (
      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'proofs'
                ? 'text-fg-primary border-fg-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('proofs')}
          >
            My Proofs ({validations.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'requests'
                ? 'text-fg-primary border-fg-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Perspectives Requested ({proofRequests.length})
          </button>
        </div>

        {/* My Proofs Tab */}
        {activeTab === 'proofs' && (validations.length === 0 ? (
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
        ))}

        {/* Perspectives Requested Tab */}
        {activeTab === 'requests' && (proofRequests.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            title="No perspectives requested yet"
            description="Request feedback from others to see how they observed your success"
            action={
              <Button variant="primary" onClick={() => navigate('/request')}>
                Request Perspective
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {proofRequests.map((req) => {
              const isExpanded = expandedRequestId === req.id;
              const hasResponse = req.status === 'completed' && req.responses;

              return (
                <Card
                  key={req.id}
                  variant="elevated"
                  padding="none"
                  className="overflow-hidden"
                >
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpandRequest(req.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(req.status)}
                          <span className="text-sm text-gray-500">
                            Requested from: <span className="font-medium text-gray-700">{req.recipient_name}</span>
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-1">
                          {req.goal_challenge}
                        </p>
                        {hasResponse && (
                          <p className="text-sm text-gray-600">
                            Responded by: {req.responder_email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(req.created_at)}
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
                      {/* Context provided */}
                      <div className="bg-fg-light rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">What you shared:</h4>
                        <p className="text-gray-700">{req.goal_challenge}</p>
                        {req.what_you_did && (
                          <>
                            <h4 className="text-sm font-medium text-gray-500 mt-3 mb-2">Context you provided:</h4>
                            <p className="text-gray-700">{req.what_you_did}</p>
                          </>
                        )}
                      </div>

                      {/* Share link if pending */}
                      {req.status === 'pending' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800 mb-2">Share this link with {req.recipient_name}:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-blue-200 truncate">
                              {window.location.origin}/p/{req.share_id}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/p/${req.share_id}`);
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Responses if completed */}
                      {hasResponse && req.responses && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-500">
                            {req.recipient_name}'s Perspective:
                          </h4>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">What they observed you do:</h5>
                            <p className="text-gray-600">{req.responses.what_observed}</p>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">How you approached it:</h5>
                            <p className="text-gray-600">{req.responses.how_approached}</p>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Impact they noticed:</h5>
                            <p className="text-gray-600">{req.responses.impact_observed}</p>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Strength they saw:</h5>
                            <p className="text-gray-600">{req.responses.strength_shown}</p>
                          </div>

                          {req.responses.similar_situations && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Similar situations they recalled:</h5>
                              <p className="text-gray-600">{req.responses.similar_situations}</p>
                            </div>
                          )}

                          {req.completed_at && (
                            <p className="text-sm text-gray-500 text-center mt-4">
                              Completed on {formatDate(req.completed_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ))}

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
