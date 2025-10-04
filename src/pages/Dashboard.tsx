import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    interviewsTaken: 12,
    avgScore: 87,
    upcomingSlots: 3,
    totalQuestions: 240,
  });

  const recentInterviews = [
    { id: 1, title: 'JavaScript Fundamentals', date: '2025-10-01', status: 'completed', score: 92 },
    { id: 2, title: 'React Advanced Patterns', date: '2025-09-28', status: 'completed', score: 85 },
    { id: 3, title: 'System Design Basics', date: '2025-09-25', status: 'completed', score: 78 },
    { id: 4, title: 'Data Structures', date: '2025-09-20', status: 'completed', score: 94 },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Dashboard</h1>
          <p className="text-xl font-bold uppercase">Your Interview Performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <BrutalistCard className="text-center">
            <FileText size={48} className="mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{stats.interviewsTaken}</div>
            <div className="text-sm font-bold uppercase">Interviews Taken</div>
          </BrutalistCard>

          <BrutalistCard variant="success" className="text-center">
            <TrendingUp size={48} className="mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{stats.avgScore}%</div>
            <div className="text-sm font-bold uppercase">Average Score</div>
          </BrutalistCard>

          <BrutalistCard variant="accent" className="text-center">
            <Clock size={48} className="mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{stats.upcomingSlots}</div>
            <div className="text-sm font-bold uppercase">Upcoming Slots</div>
          </BrutalistCard>

          <BrutalistCard className="text-center">
            <BarChart3 size={48} className="mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{stats.totalQuestions}</div>
            <div className="text-sm font-bold uppercase">Questions Answered</div>
          </BrutalistCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="mb-6">Recent Interviews</h2>
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <BrutalistCard
                  key={interview.id}
                  variant={interview.score >= 80 ? 'success' : 'default'}
                >
                  <h3 className="text-lg mb-2">{interview.title}</h3>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{interview.date}</span>
                    <span className="text-2xl">{interview.score}%</span>
                  </div>
                </BrutalistCard>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
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
                <h3 className="mb-4">View Analytics</h3>
                <p className="mb-6 font-medium">
                  Deep dive into your performance metrics. Identify strengths and areas for
                  improvement.
                </p>
                <BrutalistButton
                  variant="accent"
                  size="full"
                  onClick={() => navigate('/analytics')}
                >
                  View Reports
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
