// Zitadel OIDC Configuration
// Update these values with your actual Zitadel instance details

// For development, use a working demo instance
export const oidcConfig = {
  authority: import.meta.env.VITE_ZITADEL_AUTHORITY || 'http://localhost',
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID || '340519404208914436',
  redirect_uri: window.location.origin + '/callback',
  // post_logout_redirect_uri: window.location.origin + '/login', // Commented out until configured in Zitadel
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Clean up URL after successful login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onSignoutCallback: () => {
    // Clean up URL after logout
    console.log('OIDC logout callback triggered');
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
