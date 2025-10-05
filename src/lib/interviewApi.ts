// Types for Interview Practice API - Updated to match OpenAPI spec

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

// Helper function to make API calls with proper headers and error handling
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: string[] = [];
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData.details || [];
      } catch {
        // If we can't parse the error response, use the status text
      }

      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
          throw new Error('Authentication required. Please log in again.');
        case 403:
          throw new Error('Access denied. You can only access your own data.');
        case 404:
          throw new Error('Resource not found. The requested data may have been deleted.');
        case 422:
          throw new Error(`Validation error: ${errorMessage}`);
        case 429:
          throw new Error('Too many requests. Please wait a moment and try again.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(errorMessage);
      }
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Re-throw API errors
    throw error;
  }
};

export interface Topic {
  ID: string;
  Topic: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question: string;
  tags: string[];
  time_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionCreateRequest {
  topic_id: string;
  question: string;
  tags?: string[];
  time_minutes?: number | null;
}

export interface QuestionUpdateRequest {
  topic_id?: string;
  question?: string;
  tags?: string[];
  time_minutes?: number | null;
}

export interface TopicCreateRequest {
  topic: string;
}

export interface InterviewStartResponse {
  session_id: string;
  initial_question: string;
}

export interface InterviewResponseRequest {
  text: string;
}

export interface InterviewResponse {
  response: string;
  session_ended: boolean;
  summary?: InterviewSummary;
}

export interface InterviewSummary {
  technical_score: number;
  grammatical_score: number;
  strong_points: string[];
  weak_points: string[];
  practice_points: string[];
  contextual_relevant: boolean;
  off_topic_count: number;
}

export interface InterviewSession {
  session_id: string;
  topic_id: string;
  topic_name: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  technical_score?: number;
  grammatical_score?: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface ConversationMessage {
  sender: 'user' | 'interviewer';
  text: string;
  timestamp: string;
}

export interface InterviewSessionDetail {
  session_id: string;
  topic_id: string;
  topic_name: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  conversation: ConversationMessage[];
  summary?: InterviewSummary;
  status: 'active' | 'completed' | 'abandoned';
}

// API functions for interview practice - Updated to match OpenAPI spec
export const interviewApi = {
  // Topics
  getTopics: async (userId: string): Promise<Topic[]> => {
    return apiCall('/topics', {
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  createTopic: async (userId: string, topic: TopicCreateRequest): Promise<Topic> => {
    return apiCall('/topics', {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(topic),
    });
  },

  // Questions
  getQuestions: async (userId: string, topicId?: string, tags?: string[]): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (topicId) params.append('topic_id', topicId);
    if (tags) params.append('tags', tags.join(','));
    
    return apiCall(`/questions?${params}`, {
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  createQuestion: async (userId: string, question: QuestionCreateRequest): Promise<Question> => {
    return apiCall('/questions', {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(question),
    });
  },

  getQuestion: async (userId: string, questionId: string): Promise<Question> => {
    return apiCall(`/questions/${questionId}`, {
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  updateQuestion: async (userId: string, questionId: string, question: QuestionUpdateRequest): Promise<Question> => {
    return apiCall(`/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(question),
    });
  },

  deleteQuestion: async (userId: string, questionId: string): Promise<void> => {
    await apiCall(`/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  // Interview sessions
  startInterview: async (userId: string, topicId: string): Promise<InterviewStartResponse> => {
    return apiCall('/interview/start', {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
        'X-Topic-ID': topicId,
      },
    });
  },

  submitInterviewResponse: async (userId: string, sessionId: string, response: InterviewResponseRequest): Promise<InterviewResponse> => {
    return apiCall(`/interview/${sessionId}`, {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(response),
    });
  },

  endInterview: async (userId: string, sessionId: string): Promise<{ summary: InterviewSummary }> => {
    return apiCall(`/interview/end/${sessionId}`, {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  getInterviewSessions: async (
    userId: string, 
    limit = 10, 
    offset = 0,
    filters?: {
      status?: string;
      topic_id?: string;
      date_from?: string;
      date_to?: string;
      search?: string;
    },
    sortBy?: 'started_at' | 'ended_at' | 'technical_score' | 'duration_minutes',
    sortOrder?: 'asc' | 'desc'
  ): Promise<InterviewSession[] | { sessions: InterviewSession[]; pagination: any; summary: any }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.topic_id) params.append('topic_id', filters.topic_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await apiCall(`/interview-sessions?${params}`, {
      headers: {
        'X-User-ID': userId,
      },
    });
    
    // Handle the response structure - API returns {sessions: [], pagination: {}, summary: {}}
    if (response && typeof response === 'object' && 'sessions' in response) {
      return response;
    }
    
    // Fallback for direct array response
    return Array.isArray(response) ? response : [];
  },

  getInterviewSession: async (userId: string, sessionId: string): Promise<InterviewSessionDetail> => {
    return apiCall(`/interview-sessions/${sessionId}`, {
      headers: {
        'X-User-ID': userId,
      },
    });
  },

  // Store interview summary
  storeInterviewSummary: async (userId: string, sessionId: string, summaryData: any): Promise<any> => {
    return apiCall(`/interview-sessions/${sessionId}/summary`, {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(summaryData),
    });
  },
};
