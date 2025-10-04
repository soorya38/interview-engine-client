import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuthStore } from '@/store/authStore';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistCard from '@/components/BrutalistCard';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check for callback error
    const error = searchParams.get('error');
    if (error === 'callback_failed') {
      console.error('OIDC callback failed');
    }

    // Check if this is a logout scenario
    const isLogout = searchParams.get('logout') === 'true';
    const logoutInitiated = sessionStorage.getItem('logout_initiated') === 'true';
    
    if (isLogout || logoutInitiated) {
      console.log('Logout detected, clearing OIDC session...');
      // Clear the OIDC session completely
      if (auth.isAuthenticated) {
        auth.removeUser().catch(console.error);
        console.log('OIDC session cleared after logout');
      }
      // Clear the logout flag
      sessionStorage.removeItem('logout_initiated');
      return;
    }

    // Redirect if already authenticated (but not during logout)
    if (isAuthenticated && !isLogout && !logoutInitiated) {
      // Check if user came from a protected route
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
      return;
    }

    // Handle OIDC callback (but not during logout)
    if (auth.isAuthenticated && auth.user && !isLogout && !logoutInitiated) {
      console.log('OIDC callback detected, logging in user');
      login(
        auth.user.access_token || '',
        auth.user.profile.sub || '',
        auth.user.profile.email || '',
        auth.user.profile.name
      );
      navigate('/dashboard');
    }
  }, [auth.isAuthenticated, auth.user, isAuthenticated, login, navigate, searchParams]);

  const handleOIDCLogin = () => {
    try {
      console.log('Attempting OIDC login...');
      // Force a fresh login by adding prompt=login parameter
      auth.signinRedirect({
        extraQueryParams: {
          prompt: 'login'
        }
      });
    } catch (error) {
      console.error('OIDC login failed:', error);
      // Show error message to user
      alert('Login failed. Please check your Zitadel configuration.');
    }
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BrutalistCard className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-bold uppercase mb-4">Loading...</h2>
            <p>Authenticating with Zitadel</p>
          </div>
        </BrutalistCard>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BrutalistCard className="w-full max-w-md">
          <h1 className="text-center mb-8">AI Interview Hub</h1>
          
          <div className="bg-destructive text-destructive-foreground border-4 border-destructive p-4 mb-6">
            <p className="font-bold text-sm uppercase mb-2">Authentication Error</p>
            <p className="text-sm">{auth.error.message}</p>
            <p className="text-xs mt-2">
              If you're in development mode, make sure to configure a valid Zitadel instance.
            </p>
          </div>

          <BrutalistButton
            variant="primary"
            size="full"
            onClick={handleOIDCLogin}
          >
            Try Again
          </BrutalistButton>
        </BrutalistCard>
      </div>
    );
  }

  const callbackError = searchParams.get('error');
  const isLogout = searchParams.get('logout') === 'true';
  const logoutInitiated = sessionStorage.getItem('logout_initiated') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BrutalistCard className="w-full max-w-md">
        <h1 className="text-center mb-8">AI Interview Hub</h1>
        
        {(isLogout || logoutInitiated) && (
          <div className="mb-6 p-4 border-4 border-green-500 bg-green-50">
            <p className="font-bold text-sm uppercase mb-2 text-green-700">Successfully Logged Out</p>
            <p className="text-sm text-green-600">You have been logged out successfully. Please log in again to continue.</p>
          </div>
        )}
        
        {callbackError === 'callback_failed' && (
          <div className="mb-6 p-4 border-4 border-destructive bg-destructive/10">
            <p className="font-bold text-sm uppercase mb-2 text-destructive">Authentication Failed</p>
            <p className="text-sm text-destructive">The authentication process failed. Please try again.</p>
          </div>
        )}
        
        <div className="mb-8 p-6 border-4 border-primary bg-primary/10">
          <p className="font-bold uppercase text-lg text-center mb-2">Enterprise Authentication</p>
          <p className="text-center text-sm">Sign in with your Zitadel account to access the AI Interview Hub</p>
        </div>

        <BrutalistButton
          variant="primary"
          size="full"
          onClick={handleOIDCLogin}
        >
          Login with Zitadel
        </BrutalistButton>

        <div className="mt-6 p-4 border-2 border-border bg-muted/20">
          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by Zitadel OIDC
          </p>
        </div>
      </BrutalistCard>
    </div>
  );
};

export default Login;
