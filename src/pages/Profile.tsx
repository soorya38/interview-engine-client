import { useState } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { User, Briefcase, GraduationCap, Award, FileDown } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    email: 'alex.johnson@example.com',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
  });

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      role: 'Senior Software Engineer',
      company: 'Tech Corp',
      dates: '2022 - Present',
      description: 'Lead development of cloud-native applications using React and Node.js',
    },
    {
      id: 2,
      role: 'Software Engineer',
      company: 'StartupXYZ',
      dates: '2019 - 2022',
      description: 'Built scalable microservices architecture for e-commerce platform',
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      degree: 'BS Computer Science',
      school: 'University of California',
      dates: '2015 - 2019',
    },
  ]);

  const skills = [
    'JavaScript',
    'React',
    'Node.js',
    'TypeScript',
    'Python',
    'SQL',
    'System Design',
    'AWS',
    'Docker',
    'GraphQL',
  ];

  const achievements = [
    { id: 1, title: 'Top Performer - JavaScript Interview', date: '2025-09' },
    { id: 2, title: 'Perfect Score - React Assessment', date: '2025-08' },
    { id: 3, title: '90+ Average Across All Topics', date: '2025-07' },
  ];

  const handleGenerateResume = () => {
    alert('Generating ATS-optimized resume... This will trigger API call to /generate-resume');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1>Profile</h1>
          <BrutalistButton
            variant={isEditing ? 'success' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </BrutalistButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <BrutalistCard>
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 border-4 border-border bg-secondary flex items-center justify-center">
                  <User size={96} className="text-muted-foreground" />
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <BrutalistInput
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Full Name"
                  />
                  <BrutalistInput
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="Job Title"
                  />
                  <BrutalistInput
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Email"
                  />
                  <BrutalistInput
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="Location"
                  />
                  <BrutalistInput
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Phone"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="mb-2">{profile.name}</h2>
                  <p className="text-xl font-bold mb-4">{profile.title}</p>
                  <div className="space-y-2 text-left">
                    <p className="font-bold">{profile.email}</p>
                    <p className="font-bold">{profile.location}</p>
                    <p className="font-bold">{profile.phone}</p>
                  </div>
                </div>
              )}
            </BrutalistCard>

            <BrutalistCard variant="accent">
              <h3 className="mb-4 flex items-center gap-2">
                <FileDown size={24} />
                ATS Resume
              </h3>
              <p className="mb-4 font-medium text-sm">
                Generate a professional, ATS-optimized resume from your profile data
              </p>
              <BrutalistButton variant="accent" size="full" onClick={handleGenerateResume}>
                Generate Resume
              </BrutalistButton>
            </BrutalistCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BrutalistCard>
              <h2 className="mb-6 flex items-center gap-2">
                <Briefcase size={32} />
                Experience
              </h2>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-accent pl-4 pb-4">
                    <h3 className="text-xl mb-1">{exp.role}</h3>
                    <div className="font-bold text-lg mb-2">{exp.company}</div>
                    <div className="text-sm font-bold uppercase mb-3 text-muted-foreground">
                      {exp.dates}
                    </div>
                    {isEditing ? (
                      <textarea
                        className="w-full p-3 border-2 border-border bg-input font-medium"
                        value={exp.description}
                        rows={3}
                      />
                    ) : (
                      <p className="font-medium">{exp.description}</p>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <BrutalistButton variant="secondary" size="full">
                    Add Experience
                  </BrutalistButton>
                )}
              </div>
            </BrutalistCard>

            <BrutalistCard>
              <h2 className="mb-6 flex items-center gap-2">
                <GraduationCap size={32} />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-success pl-4">
                    <h3 className="text-xl mb-1">{edu.degree}</h3>
                    <div className="font-bold text-lg">{edu.school}</div>
                    <div className="text-sm font-bold uppercase text-muted-foreground">
                      {edu.dates}
                    </div>
                  </div>
                ))}
                {isEditing && (
                  <BrutalistButton variant="secondary" size="full">
                    Add Education
                  </BrutalistButton>
                )}
              </div>
            </BrutalistCard>

            <BrutalistCard>
              <h2 className="mb-6">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-accent text-accent-foreground border-4 border-accent font-bold uppercase"
                  >
                    {skill}
                    {isEditing && (
                      <button className="ml-2 text-xl hover:text-destructive">×</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <BrutalistButton variant="secondary">Add Skill</BrutalistButton>
                )}
              </div>
            </BrutalistCard>

            <BrutalistCard variant="success">
              <h2 className="mb-6 flex items-center gap-2">
                <Award size={32} />
                Achievements
              </h2>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex justify-between items-center border-b-4 border-success-foreground pb-3 last:border-0"
                  >
                    <span className="font-bold text-lg">{achievement.title}</span>
                    <span className="font-bold uppercase text-sm">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </BrutalistCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
