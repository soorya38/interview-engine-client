import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Check if user has admin role
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Dashboard</h1>
          <p className="text-xl font-bold uppercase">Welcome to Your Interview Hub</p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrutalistCard className="p-8">
                <h3 className="mb-4">Start New Interview</h3>
                <p className="mb-6 font-medium">
                  Test your skills with AI-powered technical interviews. Get instant feedback and
                  detailed analytics.
                </p>
                <BrutalistButton
                  variant="success"
                  size="full"
                  onClick={() => navigate('/test-practice')}
                >
                  Begin Interview
                </BrutalistButton>
              </BrutalistCard>

              <BrutalistCard className="p-8">
                <h3 className="mb-4">Interview Summaries</h3>
                <p className="mb-6 font-medium">
                  Review your interview history and detailed performance summaries. Track your progress over time.
                </p>
                <BrutalistButton
                  variant="accent"
                  size="full"
                  onClick={() => navigate('/summaries')}
                >
                  View Summaries
                </BrutalistButton>
              </BrutalistCard>

              <BrutalistCard className="p-8">
                <h3 className="mb-4">Practice Mode</h3>
                <p className="mb-6 font-medium">
                  Sharpen your skills without pressure. Practice unlimited questions by topic.
                </p>
                <BrutalistButton
                  variant="primary"
                  size="full"
                  onClick={() => navigate('/test-practice')}
                >
                  Start Practice
                </BrutalistButton>
              </BrutalistCard>

              <BrutalistCard className="p-8">
                <h3 className="mb-4">Update Profile</h3>
                <p className="mb-6 font-medium">
                  Keep your profile current. Generate ATS-optimized resumes from your experience.
                </p>
                <BrutalistButton
                  variant="primary"
                  size="full"
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </BrutalistButton>
              </BrutalistCard>

              {isAdmin && (
                <BrutalistCard className="p-8">
                  <h3 className="mb-4">Admin Panel</h3>
                  <p className="mb-6 font-medium">
                    Manage topics and questions for the interview system. Create and organize content.
                  </p>
                  <BrutalistButton
                    variant="accent"
                    size="full"
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </BrutalistButton>
                </BrutalistCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
