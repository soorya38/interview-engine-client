import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuthStore } from '@/store/authStore';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistCard from '@/components/BrutalistCard';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Handle OIDC callback
    if (auth.isAuthenticated && auth.user) {
      login(
        auth.user.access_token || '',
        auth.user.profile.sub || '',
        auth.user.profile.email || '',
        auth.user.profile.name
      );
      navigate('/dashboard');
    }
  }, [auth.isAuthenticated, auth.user, isAuthenticated, login, navigate]);

  const handleOIDCLogin = () => {
    auth.signinRedirect();
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BrutalistCard className="w-full max-w-md">
        <h1 className="text-center mb-8">AI Interview Hub</h1>
        
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
