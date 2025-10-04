import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuthStore } from '@/store/authStore';
import BrutalistCard from '@/components/BrutalistCard';

const Callback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      console.log('Processing OIDC callback...');
      console.log('Auth state:', { 
        isLoading: auth.isLoading, 
        isAuthenticated: auth.isAuthenticated, 
        user: auth.user,
        error: auth.error 
      });

      // If there's an error, show it
      if (auth.error) {
        console.error('Auth error:', auth.error);
        setError(`Authentication failed: ${auth.error.message}`);
        return;
      }

      // If we have a user and are authenticated, proceed
      if (auth.user && auth.isAuthenticated) {
        console.log('User authenticated, storing auth data...');
        console.log('User Info:', {
          sub: auth.user.profile.sub,
          email: auth.user.profile.email,
          name: auth.user.profile.name,
          access_token: auth.user.access_token ? 'Present' : 'Missing',
          id_token: auth.user.id_token ? 'Present' : 'Missing',
          profile: auth.user.profile,
          expires_at: auth.user.expires_at,
          scope: auth.user.scope
        });
        login(
          auth.user.access_token || '',
          auth.user.profile.sub || '',
          auth.user.profile.email || '',
          auth.user.profile.name
        );
        console.log('Redirecting to dashboard...');
        navigate('/dashboard');
      } else if (!auth.isLoading) {
        // If not loading and no user, there might be an issue
        console.log('No user found after callback, not loading');
        setError('Authentication failed - no user data received');
      }
    };

    handleCallback();
  }, [auth, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BrutalistCard className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-bold uppercase mb-4">Authentication Error</h2>
            <div className="bg-destructive text-destructive-foreground border-4 border-destructive p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground border-4 border-primary font-bold uppercase"
            >
              Back to Login
            </button>
          </div>
        </BrutalistCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BrutalistCard className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase mb-4">Processing Login</h2>
          <p>Completing authentication with Zitadel...</p>
        </div>
      </BrutalistCard>
    </div>
  );
};

export default Callback;
