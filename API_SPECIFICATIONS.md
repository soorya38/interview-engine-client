# Interview API Specifications

This document provides comprehensive API specifications for the interview system, including storage and retrieval of interview summaries.

## Overview

The interview system consists of two main API endpoints:

1. **Interview Summary Storage API** - Stores interview summaries when users complete interviews
2. **Interview Summaries API** - Retrieves interview history for the summaries page

## 1. Interview Summary Storage API

**File:** `interview-summary-storage-api.yaml`

### Purpose
Stores interview summaries in the backend database when users complete interviews and click "Back to Lobby".

### Key Endpoint
```
POST /interview-sessions/{session_id}/summary
```

### When Called
- When user completes an interview
- When user clicks "Back to Lobby" from summary screen
- Before clearing session state

### Request Body Structure
```json
{
  "summary": {
    "technical_score": 85,
    "grammatical_score": 92,
    "strong_points": ["Clear explanation of technical concepts"],
    "weak_points": ["Could improve on time management"],
    "practice_points": ["Practice coding problems"],
    "contextual_relevant": true,
    "off_topic_count": 0
  },
  "topic_id": "topic-1",
  "total_questions": 5,
  "correct_answers": 4,
  "time_spent": 30,
  "technical_score": 85.0,
  "communication_score": 92.0,
  "question_breakdown": [
    {
      "question_id": "q_1",
      "question_text": "Explain the difference between let and const",
      "user_answer": "let allows reassignment, const does not",
      "is_correct": true,
      "time_taken": 45,
      "difficulty_score": 7,
      "skill_tags": ["javascript", "variables", "es6"]
    }
  ]
}
```

### Response
```json
{
  "message": "Interview summary stored successfully",
  "session_id": "session-12345",
  "stored_at": "2024-01-15T10:30:00Z",
  "analytics_available": true
}
```

## 2. Interview Summaries API

**File:** `interview-summaries-api.yaml`

### Purpose
Retrieves interview history and detailed session information for the Interview Summaries page.

### Key Endpoints

#### Get Interview Sessions
```
GET /interview-sessions
```

**Query Parameters:**
- `limit` (optional): Number of sessions to return (1-100, default: 20)
- `offset` (optional): Number of sessions to skip (default: 0)
- `status` (optional): Filter by status (active, completed, abandoned)
- `topic_id` (optional): Filter by topic
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `sort_by` (optional): Sort field (started_at, ended_at, technical_score, duration_minutes)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "session-12345",
      "topic_id": "topic-1",
      "topic_name": "JavaScript Fundamentals",
      "started_at": "2024-01-15T10:00:00Z",
      "ended_at": "2024-01-15T10:30:00Z",
      "duration_minutes": 30,
      "technical_score": 85,
      "grammatical_score": 92,
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "summary": {
    "total_sessions": 25,
    "completed_sessions": 23,
    "average_score": 81.5,
    "high_scores": 15
  }
}
```

#### Get Detailed Session
```
GET /interview-sessions/{session_id}
```

**Response:**
```json
{
  "session_id": "session-12345",
  "topic_id": "topic-1",
  "topic_name": "JavaScript Fundamentals",
  "started_at": "2024-01-15T10:00:00Z",
  "ended_at": "2024-01-15T10:30:00Z",
  "duration_minutes": 30,
  "conversation": [
    {
      "sender": "interviewer",
      "text": "Welcome to your JavaScript interview...",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "sender": "user",
      "text": "let allows reassignment while const does not...",
      "timestamp": "2024-01-15T10:00:15Z"
    }
  ],
  "summary": {
    "technical_score": 85,
    "grammatical_score": 92,
    "strong_points": ["Clear explanation of technical concepts"],
    "weak_points": ["Could improve on time management"],
    "practice_points": ["Practice coding problems"],
    "contextual_relevant": true,
    "off_topic_count": 0
  },
  "status": "completed"
}
```

## Implementation Status

### Frontend Implementation ✅
- **InterviewSummaries.tsx**: Uses `interviewApi.getInterviewSessions()` and `interviewApi.getInterviewSession()`
- **TestPractice.tsx**: Uses `storeInterviewSummary()` function for storage
- **Navigation**: Updated to use `/summaries` route instead of `/analytics`

### API Functions ✅
- **interviewApi.ts**: Contains all necessary API functions
- **Storage**: `storeInterviewSummary()` function implemented
- **Retrieval**: `getInterviewSessions()` and `getInterviewSession()` functions implemented

### Backend Requirements 🔄
The backend needs to implement the endpoints specified in the YAML files:

1. **Storage Endpoint**: `POST /interview-sessions/{session_id}/summary`
2. **List Endpoint**: `GET /interview-sessions`
3. **Detail Endpoint**: `GET /interview-sessions/{session_id}`

## Security Considerations

- All endpoints require `X-User-ID` header for authentication
- Users can only access their own interview data
- Implement rate limiting to prevent abuse
- Log all access for audit purposes
- Validate all input data
- Use parameterized queries to prevent SQL injection

## Database Schema Recommendations

### Tables Needed
1. **interview_sessions**: Store session metadata
2. **interview_summaries**: Store detailed summary data
3. **conversation_messages**: Store conversation history
4. **question_breakdowns**: Store per-question performance data

### Indexes Required
- `user_id` for fast user-specific queries
- `started_at` for time-based sorting
- `topic_id` for topic-based filtering
- `session_id` for session lookups

## Error Handling

### Common Error Responses
- **400**: Bad request - Invalid parameters
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - User cannot access this resource
- **404**: Not found - Session or resource not found
- **409**: Conflict - Summary already exists
- **500**: Internal server error

### Error Response Format
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": ["technical_score is required"]
}
```

## Testing

### Test Cases
1. **Storage API**:
   - Store valid interview summary
   - Handle duplicate storage attempts
   - Validate required fields
   - Test authentication

2. **Retrieval API**:
   - Get user's interview sessions
   - Test pagination
   - Test filtering and sorting
   - Test detailed session retrieval
   - Test access control

### Test Data
Use the examples provided in the YAML specifications for consistent testing.

## Monitoring and Analytics

### Metrics to Track
- API response times
- Error rates by endpoint
- User engagement with summaries
- Storage success rates
- Query performance

### Logging
- All API calls with timestamps
- User actions and navigation
- Error occurrences and details
- Performance metrics

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket support for live session updates
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Export Functionality**: Allow users to export their interview data
4. **Analytics Dashboard**: Advanced performance analytics
5. **Recommendations**: AI-powered improvement suggestions

### Scalability Considerations
- Database sharding by user ID
- Caching frequently accessed data
- CDN for static assets
- Load balancing for high traffic
- Database read replicas for analytics queries
