# API Setup Instructions

## Current Status
The Profile page is currently running in **Development Mode** with localStorage fallback.

## To Enable API Mode

1. **Start the Backend Server**
   - Ensure your backend server is running on `http://localhost:3000`
   - The API should be available at `http://localhost:3000/api/v1`

2. **Update Configuration**
   - Open `src/lib/config.ts`
   - Change `DEV_MODE: true` to `DEV_MODE: false`
   - Save the file

3. **API Endpoints Expected**
   - `GET /api/v1/profile` - Get user profile
   - `PUT /api/v1/profile` - Update user profile
   - `GET /api/v1/profile/experiences` - Get experiences
   - `POST /api/v1/profile/experiences` - Add experience
   - `PUT /api/v1/profile/experiences/{id}` - Update experience
   - `DELETE /api/v1/profile/experiences/{id}` - Delete experience
   - And similar endpoints for education, skills, achievements, projects

## Development Mode Features
- ✅ Profile data saved to localStorage
- ✅ All CRUD operations work locally
- ✅ Data persists between sessions
- ✅ No backend server required

## Production Mode Features
- ✅ Real API integration
- ✅ Server-side data persistence
- ✅ Authentication with JWT tokens
- ✅ Full OpenAPI specification compliance

## Switching Between Modes
Simply change `DEV_MODE` in `src/lib/config.ts`:
- `DEV_MODE: true` - Uses localStorage (no backend needed)
- `DEV_MODE: false` - Uses API endpoints (backend required)

