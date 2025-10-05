import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { interviewApi, type InterviewSession, type InterviewSessionDetail, type Topic } from '@/lib/interviewApi';
import { ArrowLeft, Calendar, Clock, Target, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, Search } from 'lucide-react';


const InterviewSummaries = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  
  // Filtering and pagination state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    topic_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'started_at' | 'ended_at' | 'technical_score' | 'duration_minutes'>('started_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    has_more: false
  });
  const [summaryStats, setSummaryStats] = useState({
    total_sessions: 0,
    completed_sessions: 0,
    average_score: 0,
    high_scores: 0
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.sub) {
      fetchTopics();
      fetchInterviewSessions();
    }
  }, [user?.sub]);

  // Fetch topics for filtering
  const fetchTopics = async () => {
    try {
      const topicsData = await interviewApi.getTopics(user?.sub || '');
      setTopics(topicsData || []);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchInterviewSessions = async (resetOffset = false, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoading(true);
      const offset = resetOffset ? 0 : pagination.offset;
      
      const response = await interviewApi.getInterviewSessions(
        user?.sub || '', 
        pagination.limit, 
        offset,
        {
          status: filters.status || undefined,
          topic_id: filters.topic_id || undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          search: filters.search || undefined
        },
        sortBy,
        sortOrder
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
          total_sessions: response.summary?.total_sessions || 0,
          completed_sessions: response.summary?.completed_sessions || 0,
          average_score: response.summary?.average_score || 0,
          high_scores: response.summary?.high_scores || 0
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

  // Filter and sort handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleSortChange = (field: 'started_at' | 'ended_at' | 'technical_score' | 'duration_minutes') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchInterviewSessions(true);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      topic_id: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setSortBy('started_at');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchInterviewSessions(true);
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

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInterviewSessions(true);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters, sortBy, sortOrder]);


  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent border-4 border-border flex items-center justify-center mb-4 animate-spin mx-auto">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Loading Interview Summaries</h2>
              <p className="text-muted-foreground">Fetching your interview history...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Interview Summaries</h1>
              <p className="text-xl font-bold uppercase">Your Interview History</p>
            </div>
            <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </BrutalistButton>
          </div>

          <BrutalistCard variant="error">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-destructive border-4 border-border flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Unable to Load Interview Data</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="flex gap-4 justify-center">
                <BrutalistButton variant="primary" onClick={handleRetry}>
                  Try Again
                </BrutalistButton>
                <BrutalistButton 
                  variant="secondary" 
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Interview Summaries</h1>
              <p className="text-xl font-bold uppercase">Your Interview History</p>
            </div>
            <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </BrutalistButton>
          </div>

          <BrutalistCard>
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-accent border-4 border-border flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">No Interview Summaries Yet</h2>
              <p className="text-muted-foreground mb-6">
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Interview Summaries</h1>
            <p className="text-xl font-bold uppercase">Your Interview History</p>
          </div>
          <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </BrutalistButton>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <BrutalistCard>
            <div className="text-center p-4">
              <div className="text-2xl font-bold">{summaryStats.total_sessions}</div>
              <div className="text-sm font-bold uppercase">Total Interviews</div>
            </div>
          </BrutalistCard>
          <BrutalistCard>
            <div className="text-center p-4">
              <div className="text-2xl font-bold">{summaryStats.completed_sessions}</div>
              <div className="text-sm font-bold uppercase">Completed</div>
            </div>
          </BrutalistCard>
          <BrutalistCard>
            <div className="text-center p-4">
              <div className="text-2xl font-bold">{summaryStats.high_scores}</div>
              <div className="text-sm font-bold uppercase">High Scores</div>
            </div>
          </BrutalistCard>
          <BrutalistCard>
            <div className="text-center p-4">
              <div className="text-2xl font-bold">{Math.round(summaryStats.average_score)}%</div>
              <div className="text-sm font-bold uppercase">Avg Score</div>
            </div>
          </BrutalistCard>
        </div>

        {/* Filters and Sorting */}
        <BrutalistCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} />
              <h3 className="text-lg font-bold">Filters & Sorting</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="active">Active</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Topic</label>
                <select
                  className="w-full px-3 py-2 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                  value={filters.topic_id}
                  onChange={(e) => handleFilterChange('topic_id', e.target.value)}
                >
                  <option value="">All Topics</option>
                  {topics.map((topic) => (
                    <option key={topic.ID} value={topic.ID}>
                      {topic.Topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-bold uppercase mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-bold uppercase mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-bold uppercase mb-2">Search</label>
                <div className="flex gap-2">
                  <BrutalistInput
                    type="text"
                    placeholder="Search sessions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex-1"
                  />
                  <BrutalistButton variant="secondary" onClick={handleSearch}>
                    <Search size={16} />
                  </BrutalistButton>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Sort By</label>
                  <select
                    className="px-3 py-2 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="started_at">Start Date</option>
                    <option value="ended_at">End Date</option>
                    <option value="technical_score">Technical Score</option>
                    <option value="duration_minutes">Duration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Order</label>
                  <BrutalistButton
                    variant="secondary"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1"
                  >
                    {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                  </BrutalistButton>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <BrutalistButton variant="primary" onClick={handleSearch}>
                Apply Filters
              </BrutalistButton>
              <BrutalistButton variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </BrutalistButton>
            </div>
          </div>
        </BrutalistCard>

        {/* Interview Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <BrutalistCard key={session.session_id} className="hover:bg-muted/50 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{session.topic_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(session.started_at)}
                      </div>
                      {session.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {formatDuration(session.duration_minutes)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target size={16} />
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {session.technical_score && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          session.technical_score >= 80 ? 'text-green-600' :
                          session.technical_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {session.technical_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Technical</div>
                      </div>
                    )}
                    
                    <BrutalistButton
                      variant="secondary"
                      onClick={() => fetchSessionDetail(session.session_id)}
                      disabled={loadingSession}
                    >
                      {loadingSession ? 'Loading...' : 'View Details'}
                    </BrutalistButton>
                  </div>
                </div>

                {session.technical_score && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-2 border border-border">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          session.technical_score >= 80 ? 'bg-green-500' :
                          session.technical_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${session.technical_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">
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
          <BrutalistCard className="mt-6">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} sessions
                </div>
                <div className="flex gap-2">
                  <BrutalistButton
                    variant="secondary"
                    onClick={() => handlePageChange('prev')}
                    disabled={pagination.offset === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </BrutalistButton>
                  <BrutalistButton
                    variant="secondary"
                    onClick={() => handlePageChange('next')}
                    disabled={!pagination.has_more}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </BrutalistButton>
                </div>
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
