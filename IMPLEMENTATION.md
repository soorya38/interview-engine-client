# AI Interview Hub - Implementation Guide

## Neo-Brutalist Design System

The platform uses a stark, unapologetic design language:

- **Colors**: Deep charcoal (#2C2C2C), cool gray (#F5F5F5), with surgical accent colors
- **Typography**: Inter font family, bold weights, uppercase labels
- **Layout**: Hard-edged blocks with zero border radius, 4px borders, 8px grid spacing
- **Interactions**: Instant state changes, high-contrast hover inversions, no animations

## Authentication Setup

### OIDC Integration (Zitadel)

Currently configured as placeholder. To enable:

1. Install OIDC client:
```bash
npm install @auth0/auth0-react
# or
npm install oidc-client-ts
```

2. Update `src/pages/Login.tsx` with your Zitadel configuration:
```typescript
const oidcConfig = {
  authority: 'YOUR_ISSUER_URL',
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: window.location.origin + '/callback',
  scope: 'openid profile email',
};
```

3. The global API interceptor in `src/lib/apiClient.ts` automatically adds:
   - `Authorization: Bearer ${access_token}`
   - `X-User-ID: ${user_sub}`
   - `X-Email-ID: ${user_email}`

## Pages

### Login (`/login`)
- Email/password form with validation
- OIDC "Login with Zitadel" button (ready for integration)
- Auto-redirects authenticated users to dashboard

### Dashboard (`/dashboard`)
- Metric cards: Interviews taken, avg score, upcoming slots, total questions
- Recent interviews sidebar with color-coded performance
- Quick action cards for starting interviews, viewing analytics, practice mode, profile

### Analytics (`/analytics`)
- Strong topics card (green) - top 5 skills >80%
- Weak topics card (red) - bottom 5 with improvement tips
- Radar chart showing skill distribution across domains
- Built with Recharts, styled neo-brutalist (thick lines, stark contrast)

### Test & Practice (`/test-practice`)
- Tabbed interface: Live Test | Practice Mode
- **Live Test**: Timer, progress bar, multiple-choice questions, navigation
- **Practice Mode**: Topic selector grid with question counts
- Keyboard-friendly navigation

### Profile (`/profile`)
- LinkedIn-inspired professional layout
- Editable sections: Personal info, Experience, Education, Skills, Achievements
- **ATS Resume Generator**: Button triggers `/generate-resume` API call
- Edit mode toggle for inline updates

## State Management

- **Auth Store** (`src/store/authStore.ts`): Zustand store for user session
- **API Client** (`src/lib/apiClient.ts`): Axios with auto-headers and 401 handling
- localStorage for token persistence

## Component Library

Custom neo-brutalist components:
- `BrutalistButton`: 5 variants (primary, secondary, destructive, success, accent)
- `BrutalistCard`: Color-coded containers with 4px borders
- `BrutalistInput`: Hard-edged inputs with focus states
- `Layout`: Global nav with responsive mobile menu

## API Integration Points

Expected endpoints (mock data currently used):
- `GET /dashboard` - User stats and recent interviews
- `GET /analytics` - Skill performance data
- `GET /test/:id` - Test questions
- `POST /submit-test` - Submit answers
- `GET /practice/:topic` - Practice questions by topic
- `GET /profile` - User profile data
- `PUT /profile` - Update profile
- `POST /generate-resume` - ATS resume generation

## Development

```bash
npm install
npm run dev
```

## Deployment Checklist

- [ ] Add real OIDC credentials to environment
- [ ] Configure API base URL in `apiClient.ts`
- [ ] Set up CORS for backend
- [ ] Test token refresh flow
- [ ] Add error boundaries for production
- [ ] Enable service worker for offline mode
- [ ] Add analytics tracking

## Accessibility

- WCAG AA compliant contrast ratios (>4.5:1)
- Keyboard navigation on all interactive elements
- ARIA labels on icon buttons
- Focus visible states with 4px accent ring
- Screen reader friendly semantic HTML

## Performance

- Zero animations = instant rendering
- Code splitting via React Router
- Lazy load chart library
- Tree-shaken Lucide icons
- Target bundle size: <500KB gzipped
