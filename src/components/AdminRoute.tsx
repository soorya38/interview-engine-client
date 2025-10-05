import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import { Shield, ArrowLeft } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useAuthStore();

  // Check if user has admin role
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-xl font-bold uppercase">Admin Access Required</p>
            </div>
            <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </BrutalistButton>
          </div>

          <BrutalistCard variant="error">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-destructive border-4 border-border flex items-center justify-center mb-6 mx-auto">
                <Shield size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">
                You need administrator privileges to access this page. 
                Please contact your system administrator if you believe this is an error.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Your current role: <span className="font-bold">{user?.role || 'User'}</span></p>
                <p>Required role: <span className="font-bold">Admin</span></p>
              </div>
            </div>
          </BrutalistCard>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
