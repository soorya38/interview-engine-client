import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const skillData = [
    { subject: 'Algorithms', score: 92, fullMark: 100 },
    { subject: 'Data Structures', score: 88, fullMark: 100 },
    { subject: 'System Design', score: 75, fullMark: 100 },
    { subject: 'JavaScript', score: 95, fullMark: 100 },
    { subject: 'React', score: 90, fullMark: 100 },
    { subject: 'SQL', score: 82, fullMark: 100 },
  ];

  const strongTopics = [
    { name: 'JavaScript ES6+', score: 95, questions: '19/20' },
    { name: 'React Hooks', score: 92, questions: '23/25' },
    { name: 'Algorithms', score: 92, questions: '18/20' },
    { name: 'REST APIs', score: 90, questions: '27/30' },
    { name: 'Data Structures', score: 88, questions: '22/25' },
  ];

  const weakTopics = [
    { name: 'System Design', score: 75, tip: 'Review distributed systems patterns' },
    { name: 'SQL Optimization', score: 72, tip: 'Practice query optimization techniques' },
    { name: 'WebSockets', score: 68, tip: 'Study real-time communication patterns' },
    { name: 'Docker/K8s', score: 65, tip: 'Complete containerization tutorial' },
    { name: 'GraphQL', score: 62, tip: 'Build a GraphQL API project' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Analytics</h1>
          <p className="text-xl font-bold uppercase">Performance Insights</p>
        </div>

        <BrutalistCard>
          <h2 className="mb-6">Skill Radar</h2>
          <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillData}>
                <PolarGrid stroke="#2C2C2C" strokeWidth={3} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#2C2C2C', fontWeight: 'bold', fontSize: 14 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#2C2C2C', fontWeight: 'bold' }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#45B7D1"
                  fill="#45B7D1"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {skillData.map((skill) => (
              <div key={skill.subject} className="border-4 border-border p-3">
                <div className="text-sm font-bold uppercase mb-1">{skill.subject}</div>
                <div className="text-3xl font-bold">{skill.score}%</div>
              </div>
            ))}
          </div>
        </BrutalistCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <BrutalistCard variant="success">
            <h2 className="mb-6">Strong Topics</h2>
            <div className="space-y-4">
              {strongTopics.map((topic, index) => (
                <div key={index} className="border-b-4 border-success-foreground pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg">{topic.name}</h3>
                    <span className="text-3xl font-bold">{topic.score}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="uppercase">Correct: {topic.questions}</span>
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>

          <BrutalistCard variant="error">
            <h2 className="mb-6">Weak Topics</h2>
            <div className="space-y-4">
              {weakTopics.map((topic, index) => (
                <div key={index} className="border-b-4 border-destructive-foreground pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg">{topic.name}</h3>
                    <span className="text-3xl font-bold">{topic.score}%</span>
                  </div>
                  <div className="text-sm font-bold uppercase">
                    💡 {topic.tip}
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
