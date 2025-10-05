import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { interviewApi, type InterviewSession, type InterviewSessionDetail } from '@/lib/interviewApi';
import { ArrowLeft, Calendar, Clock, Target, ChevronLeft, ChevronRight, Loader2, AlertTriangle, BarChart3, FileText, MessageSquare } from 'lucide-react';


const InterviewSummaries = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    has_more: false
  });
  const [summaryStats, setSummaryStats] = useState({
    total_sessions: 0
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.sub) {
      fetchInterviewSessions();
    }
  }, [user?.sub]);

  const fetchInterviewSessions = async (resetOffset = false, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoading(true);
      const offset = resetOffset ? 0 : pagination.offset;
      
      const response = await interviewApi.getInterviewSessions(
        user?.sub || '', 
        pagination.limit, 
        offset
      );
      
      // Handle response structure
      if (response && typeof response === 'object' && 'sessions' in response) {
        setSessions(response.sessions || []);
        setPagination(prev => ({
          ...prev,
          offset: offset,
          total: response.pagination?.total || 0,
          has_more: response.pagination?.has_more || false
        }));
        setSummaryStats({
          total_sessions: response.summary?.total_sessions || 0
        });
      } else {
        // Fallback for direct array response
        setSessions(Array.isArray(response) ? response : []);
        setPagination(prev => ({
          ...prev,
          offset: offset,
          total: Array.isArray(response) ? response.length : 0,
          has_more: false
        }));
      }
    } catch (error: any) {
      console.error('Error fetching interview sessions:', error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (
        error.message.includes('Network error') || 
        error.message.includes('Server error') ||
        error.message.includes('Too many requests')
      )) {
        console.log(`Retrying fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchInterviewSessions(resetOffset, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        return;
      }
      
      // Show appropriate error message
      let errorTitle = "Error Loading Sessions";
      let errorDescription = error.message;
      
      if (error.message.includes('Authentication required')) {
        errorTitle = "Authentication Required";
        errorDescription = "Please log in again to access your interview data.";
      } else if (error.message.includes('Access denied')) {
        errorTitle = "Access Denied";
        errorDescription = "You can only access your own interview data.";
      } else if (error.message.includes('Network error')) {
        errorTitle = "Connection Error";
        errorDescription = "Please check your internet connection and try again.";
      } else if (error.message.includes('Server error')) {
        errorTitle = "Server Error";
        errorDescription = "Our servers are experiencing issues. Please try again later.";
      }
      
      setHasError(true);
      setErrorMessage(errorDescription);
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      setLoadingSession(true);
      const sessionDetail = await interviewApi.getInterviewSession(user?.sub || '', sessionId);
      setSelectedSession(sessionDetail);
      setShowSessionDetail(true);
    } catch (error: any) {
      console.error('Error fetching session detail:', error);
      toast({
        title: "Error Loading Session",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSession(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };


  const handlePageChange = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'prev' 
      ? Math.max(0, pagination.offset - pagination.limit)
      : pagination.offset + pagination.limit;
    
    setPagination(prev => ({ ...prev, offset: newOffset }));
    fetchInterviewSessions();
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    fetchInterviewSessions(true);
  };



  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Loader2 className="text-white w-10 h-10 animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Loading Interview Summaries</h2>
              <p className="text-muted-foreground font-medium">Fetching your interview history...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-destructive to-destructive/70 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold">Interview Summaries</h1>
                <p className="text-2xl font-medium text-muted-foreground">Your Interview History</p>
              </div>
            </div>
            <BrutalistButton variant="outline" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </BrutalistButton>
          </div>

          <BrutalistCard variant="error" className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-destructive to-destructive/70 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg">
                <AlertTriangle className="text-white w-12 h-12" />
              </div>
              <h2 className="text-3xl font-semibold mb-4">Unable to Load Interview Data</h2>
              <p className="text-muted-foreground mb-8 font-medium text-lg">{errorMessage}</p>
              <div className="flex gap-4 justify-center">
                <BrutalistButton variant="primary" onClick={handleRetry}>
                  Try Again
                </BrutalistButton>
                <BrutalistButton 
                  variant="outline" 
                  onClick={() => window.location.href = '/test-practice'}
                >
                  Start New Interview
                </BrutalistButton>
              </div>
            </div>
          </BrutalistCard>
        </div>
      </Layout>
    );
  }

  if (sessions.length === 0) {
    return (
      <Layout>
        <div className="responsive-container py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">Interview Summaries</h1>
                <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white/70">Your Interview History</p>
              </div>
            </div>
            <BrutalistButton variant="outline" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </BrutalistButton>
          </div>

          <BrutalistCard className="p-8 sm:p-10 lg:p-12">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 mx-auto shadow-lg">
                <FileText className="text-white w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide mb-3 sm:mb-4">No Interview Summaries Yet</h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 font-medium text-base sm:text-lg">
                Complete some interviews to see your performance summaries and track your progress.
              </p>
              <BrutalistButton 
                variant="primary" 
                onClick={() => window.location.href = '/test-practice'}
              >
                Start Your First Interview
              </BrutalistButton>
            </div>
          </BrutalistCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="responsive-container py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">Interview Summaries</h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white/70">Your Interview History</p>
            </div>
          </div>
          <BrutalistButton variant="outline" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </BrutalistButton>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-start mb-8 sm:mb-12">
          <BrutalistCard className="w-fit min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] p-4 sm:p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">{summaryStats.total_sessions}</div>
              <div className="text-xs sm:text-sm font-medium">Total Interviews</div>
            </div>
          </BrutalistCard>
        </div>


        {/* Interview Sessions List */}
        <div className="space-y-4 sm:space-y-6">
          {sessions.map((session) => (
            <BrutalistCard key={session.session_id} className="hover:shadow-lg transition-all">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-xl flex items-center justify-center luxury-glow">
                        <MessageSquare className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">{session.topic_name}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-white/70 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        {formatDate(session.started_at)}
                      </div>
                      {session.duration_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock size={18} />
                          {formatDuration(session.duration_minutes)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Target size={18} />
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {session.technical_score && (
                      <div className="text-right">
                        <div className={`text-3xl font-black ${
                          session.technical_score >= 80 ? 'text-success' :
                          session.technical_score >= 60 ? 'text-accent' : 'text-destructive'
                        }`}>
                          {session.technical_score}%
                        </div>
                        <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Technical</div>
                      </div>
                    )}
                    
                    <BrutalistButton
                      variant="outline"
                      onClick={() => fetchSessionDetail(session.session_id)}
                      disabled={loadingSession}
                      className="w-full sm:w-auto"
                    >
                      {loadingSession ? 'Loading...' : 'View Details'}
                    </BrutalistButton>
                  </div>
                </div>

                {session.technical_score && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-muted h-3 border-2 border-black">
                      <div 
                        className={`h-full ${
                          session.technical_score >= 80 ? 'bg-success' :
                          session.technical_score >= 60 ? 'bg-accent' : 'bg-destructive'
                        }`}
                        style={{ width: `${session.technical_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wide">
                      {session.technical_score >= 80 ? 'Excellent' :
                       session.technical_score >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                )}
              </div>
            </BrutalistCard>
          ))}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <BrutalistCard className="mt-8 p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} sessions
              </div>
              <div className="flex gap-3">
                <BrutalistButton
                  variant="outline"
                  onClick={() => handlePageChange('prev')}
                  disabled={pagination.offset === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Previous
                </BrutalistButton>
                <BrutalistButton
                  variant="outline"
                  onClick={() => handlePageChange('next')}
                  disabled={!pagination.has_more}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </BrutalistButton>
              </div>
            </div>
          </BrutalistCard>
        )}

        {/* Session Detail Modal */}
        {showSessionDetail && selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <BrutalistCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedSession.topic_name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(selectedSession.started_at)}
                      </div>
                      {selectedSession.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {formatDuration(selectedSession.duration_minutes)}
                        </div>
                      )}
                    </div>
                  </div>
                  <BrutalistButton
                    variant="secondary"
                    onClick={() => setShowSessionDetail(false)}
                  >
                    Close
                  </BrutalistButton>
                </div>

                {selectedSession.summary && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <BrutalistCard variant="success">
                        <div className="text-sm font-bold uppercase mb-2">Technical Score</div>
                        <div className="text-4xl font-bold">{selectedSession.summary.technical_score}/100</div>
                      </BrutalistCard>
                      <BrutalistCard variant="accent">
                        <div className="text-sm font-bold uppercase mb-2">Grammar Score</div>
                        <div className="text-4xl font-bold">{selectedSession.summary.grammatical_score}/100</div>
                      </BrutalistCard>
                    </div>

                    <div>
                      <h3 className="mb-3">Strong Points</h3>
                      {selectedSession.summary.strong_points && selectedSession.summary.strong_points.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {selectedSession.summary.strong_points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>None noted.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3">Areas for Improvement</h3>
                      {selectedSession.summary.weak_points && selectedSession.summary.weak_points.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {selectedSession.summary.weak_points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>None noted.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3">Practice Recommendations</h3>
                      {selectedSession.summary.practice_points && selectedSession.summary.practice_points.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {selectedSession.summary.practice_points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>None noted.</p>
                      )}
                    </div>

                    <div className="p-4 bg-secondary border-2 border-border">
                      <div className="text-sm">
                        <strong>Interview Stats:</strong>{' '}
                        {selectedSession.summary.contextual_relevant ? 'Responses were relevant' : 'Some responses were off-topic'}
                        {selectedSession.summary.off_topic_count > 0 && ` (${selectedSession.summary.off_topic_count} off-topic responses)`}
                      </div>
                    </div>

                    {/* Conversation History */}
                    {selectedSession.conversation && selectedSession.conversation.length > 0 && (
                      <div>
                        <h3 className="mb-3">Conversation History</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {selectedSession.conversation.map((msg, idx) => (
                            <div key={idx} className="border-2 border-border bg-background p-3">
                              <div className="font-bold text-sm mb-1">{msg.sender}</div>
                              <div className="text-sm">{msg.text}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </BrutalistCard>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewSummaries;
