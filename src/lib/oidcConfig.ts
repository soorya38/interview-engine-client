// Zitadel OIDC Configuration
// Update these values with your actual Zitadel instance details
export const oidcConfig = {
  authority: import.meta.env.VITE_ZITADEL_AUTHORITY || 'https://your-instance.zitadel.cloud',
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID || 'your-client-id',
  redirect_uri: window.location.origin + '/login',
  post_logout_redirect_uri: window.location.origin + '/login',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Clean up URL after successful login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
