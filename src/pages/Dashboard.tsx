import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { BarChart3, Target, TrendingUp, User, Settings, Play } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Check if user has admin role
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');

  return (
    <Layout>
      <div className="responsive-container py-8 sm:py-12 lg:py-16">
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl luxury-glow luxury-stable">
              <BarChart3 className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-2">Dashboard</h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white/70">
                Welcome to Your Interview Hub
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl luxury-glow"></div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <BrutalistCard className="p-6 sm:p-8 lg:p-10 relative group">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center luxury-glow">
                    <Target className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-white">Start New Interview</h3>
                </div>
                <p className="mb-6 sm:mb-8 font-medium text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg">
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

              <BrutalistCard className="p-10 relative group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-400 rounded-2xl flex items-center justify-center luxury-glow">
                    <BarChart3 className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-medium text-white">Interview Summaries</h3>
                </div>
                <p className="mb-8 font-medium text-white/70 leading-relaxed text-lg">
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

              <BrutalistCard className="p-10 relative group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center luxury-glow">
                    <Play className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-medium text-white">Practice Mode</h3>
                </div>
                <p className="mb-8 font-medium text-white/70 leading-relaxed text-lg">
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

              <BrutalistCard className="p-10 relative group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-violet-500 rounded-2xl flex items-center justify-center luxury-glow">
                    <User className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-medium text-white">Update Profile</h3>
                </div>
                <p className="mb-8 font-medium text-white/70 leading-relaxed text-lg">
                  Keep your profile current. Generate ATS-optimized resumes from your experience.
                </p>
                <BrutalistButton
                  variant="outline"
                  size="full"
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </BrutalistButton>
              </BrutalistCard>

              {isAdmin && (
                <BrutalistCard className="p-10 relative group col-span-1 md:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-rose-500 rounded-2xl flex items-center justify-center luxury-glow">
                      <Settings className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-medium text-white">Admin Panel</h3>
                  </div>
                  <p className="mb-8 font-medium text-white/70 leading-relaxed text-lg">
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
