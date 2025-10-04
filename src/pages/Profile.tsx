import { useState } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { User, Briefcase, GraduationCap, Award, FileDown, FolderOpen } from 'lucide-react';

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

  const [skills, setSkills] = useState([
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
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Top Performer - JavaScript Interview', date: '2025-09' },
    { id: 2, title: 'Perfect Score - React Assessment', date: '2025-08' },
    { id: 3, title: '90+ Average Across All Topics', date: '2025-07' },
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API'],
      githubUrl: 'https://github.com/alex/ecommerce-platform',
      liveUrl: 'https://ecommerce-demo.com',
      status: 'Completed',
      date: '2024-12'
    },
    {
      id: 2,
      name: 'AI Chat Application',
      description: 'Real-time chat app with AI integration using OpenAI API',
      technologies: ['React', 'Socket.io', 'OpenAI API', 'MongoDB'],
      githubUrl: 'https://github.com/alex/ai-chat-app',
      liveUrl: 'https://ai-chat-demo.com',
      status: 'In Progress',
      date: '2025-01'
    },
  ]);

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    role: '',
    company: '',
    dates: '',
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    dates: ''
  });
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    date: ''
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    status: 'Completed',
    date: ''
  });

  const handleGenerateResume = () => {
    alert('Generating ATS-optimized resume... This will trigger API call to /generate-resume');
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile saved:', { profile, experiences, education, skills, achievements, projects });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    if (newExperience.role && newExperience.company) {
      setExperiences([...experiences, { ...newExperience, id: Date.now() }]);
      setNewExperience({ role: '', company: '', dates: '', description: '' });
    }
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.school) {
      setEducation([...education, { ...newEducation, id: Date.now() }]);
      setNewEducation({ degree: '', school: '', dates: '' });
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.title) {
      setAchievements([...achievements, { ...newAchievement, id: Date.now() }]);
      setNewAchievement({ title: '', date: '' });
    }
  };

  const handleUpdateExperience = (id: number, field: string, value: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemoveExperience = (id: number) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleRemoveEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleRemoveAchievement = (id: number) => {
    setAchievements(achievements.filter(ach => ach.id !== id));
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.description) {
      const technologies = newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
      setProjects([...projects, { 
        ...newProject, 
        id: Date.now(),
        technologies 
      }]);
      setNewProject({
        name: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        status: 'Completed',
        date: ''
      });
    }
  };

  const handleUpdateProject = (id: number, field: string, value: string) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const handleRemoveProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1>Profile</h1>
          <BrutalistButton
            variant={isEditing ? 'success' : 'primary'}
            onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
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
                    {isEditing ? (
                      <div className="space-y-3">
                        <BrutalistInput
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                          placeholder="Job Title"
                        />
                        <BrutalistInput
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company"
                        />
                        <BrutalistInput
                          value={exp.dates}
                          onChange={(e) => handleUpdateExperience(exp.id, 'dates', e.target.value)}
                          placeholder="Dates (e.g., 2022 - Present)"
                        />
                        <textarea
                          className="w-full p-3 border-2 border-border bg-input font-medium"
                          value={exp.description}
                          onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                          rows={3}
                          placeholder="Job description"
                        />
                        <div className="flex gap-2">
                          <BrutalistButton 
                            variant="destructive" 
                            size="default"
                            onClick={() => handleRemoveExperience(exp.id)}
                          >
                            Remove
                          </BrutalistButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl mb-1">{exp.role}</h3>
                        <div className="font-bold text-lg mb-2">{exp.company}</div>
                        <div className="text-sm font-bold uppercase mb-3 text-muted-foreground">
                          {exp.dates}
                        </div>
                        <p className="font-medium">{exp.description}</p>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="border-2 border-dashed border-border p-4 space-y-3">
                    <h4 className="font-bold uppercase text-sm">Add New Experience</h4>
                    <BrutalistInput
                      value={newExperience.role}
                      onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                      placeholder="Job Title"
                    />
                    <BrutalistInput
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                      placeholder="Company"
                    />
                    <BrutalistInput
                      value={newExperience.dates}
                      onChange={(e) => setNewExperience({...newExperience, dates: e.target.value})}
                      placeholder="Dates"
                    />
                    <textarea
                      className="w-full p-3 border-2 border-border bg-input font-medium"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      rows={3}
                      placeholder="Job description"
                    />
                    <BrutalistButton variant="secondary" size="full" onClick={handleAddExperience}>
                      Add Experience
                    </BrutalistButton>
                  </div>
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
                    {isEditing ? (
                      <div className="space-y-3">
                        <BrutalistInput
                          value={edu.degree}
                          onChange={(e) => setEducation(education.map(ed => 
                            ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                          ))}
                          placeholder="Degree"
                        />
                        <BrutalistInput
                          value={edu.school}
                          onChange={(e) => setEducation(education.map(ed => 
                            ed.id === edu.id ? { ...ed, school: e.target.value } : ed
                          ))}
                          placeholder="School"
                        />
                        <BrutalistInput
                          value={edu.dates}
                          onChange={(e) => setEducation(education.map(ed => 
                            ed.id === edu.id ? { ...ed, dates: e.target.value } : ed
                          ))}
                          placeholder="Dates"
                        />
                        <BrutalistButton 
                          variant="destructive" 
                          size="default"
                          onClick={() => handleRemoveEducation(edu.id)}
                        >
                          Remove
                        </BrutalistButton>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl mb-1">{edu.degree}</h3>
                        <div className="font-bold text-lg">{edu.school}</div>
                        <div className="text-sm font-bold uppercase text-muted-foreground">
                          {edu.dates}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="border-2 border-dashed border-border p-4 space-y-3">
                    <h4 className="font-bold uppercase text-sm">Add New Education</h4>
                    <BrutalistInput
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      placeholder="Degree"
                    />
                    <BrutalistInput
                      value={newEducation.school}
                      onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                      placeholder="School"
                    />
                    <BrutalistInput
                      value={newEducation.dates}
                      onChange={(e) => setNewEducation({...newEducation, dates: e.target.value})}
                      placeholder="Dates"
                    />
                    <BrutalistButton variant="secondary" size="full" onClick={handleAddEducation}>
                      Add Education
                    </BrutalistButton>
                  </div>
                )}
              </div>
            </BrutalistCard>

            <BrutalistCard>
              <h2 className="mb-6">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-accent text-accent-foreground border-4 border-accent font-bold uppercase flex items-center gap-2"
                  >
                    {skill}
                    {isEditing && (
                      <button 
                        className="text-xl hover:text-destructive"
                        onClick={() => handleRemoveSkill(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex gap-2 items-center">
                    <BrutalistInput
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill"
                      className="w-32"
                    />
                    <BrutalistButton 
                      variant="secondary" 
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                    >
                      Add
                    </BrutalistButton>
                  </div>
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
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <BrutalistInput
                          value={achievement.title}
                          onChange={(e) => setAchievements(achievements.map(ach => 
                            ach.id === achievement.id ? { ...ach, title: e.target.value } : ach
                          ))}
                          placeholder="Achievement title"
                        />
                        <BrutalistInput
                          value={achievement.date}
                          onChange={(e) => setAchievements(achievements.map(ach => 
                            ach.id === achievement.id ? { ...ach, date: e.target.value } : ach
                          ))}
                          placeholder="Date"
                          className="w-32"
                        />
                        <BrutalistButton 
                          variant="destructive" 
                          size="default"
                          onClick={() => handleRemoveAchievement(achievement.id)}
                        >
                          Remove
                        </BrutalistButton>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-lg">{achievement.title}</span>
                        <span className="font-bold uppercase text-sm">{achievement.date}</span>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="border-2 border-dashed border-success-foreground p-4 space-y-3">
                    <h4 className="font-bold uppercase text-sm">Add New Achievement</h4>
                    <BrutalistInput
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                      placeholder="Achievement title"
                    />
                    <BrutalistInput
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                      placeholder="Date"
                    />
                    <BrutalistButton variant="secondary" size="full" onClick={handleAddAchievement}>
                      Add Achievement
                    </BrutalistButton>
                  </div>
                )}
              </div>
            </BrutalistCard>

            <BrutalistCard className="bg-white border-white">
              <h2 className="mb-6 flex items-center gap-2">
                <FolderOpen size={32} />
                Projects
              </h2>
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div key={project.id} className="border-l-4 border-success pl-4 pb-4 bg-white rounded-sm">
                    {index > 0 && <div className="border-t-2 border-gray-300 mb-4 -ml-4"></div>}
                    {isEditing ? (
                      <div className="space-y-3">
                        <BrutalistInput
                          value={project.name}
                          onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                          placeholder="Project Name"
                        />
                        <textarea
                          className="w-full p-3 border-2 border-border bg-input font-medium"
                          value={project.description}
                          onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                          rows={3}
                          placeholder="Project description"
                        />
                        <BrutalistInput
                          value={project.technologies.join(', ')}
                          onChange={(e) => handleUpdateProject(project.id, 'technologies', e.target.value)}
                          placeholder="Technologies (comma separated)"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <BrutalistInput
                            value={project.githubUrl}
                            onChange={(e) => handleUpdateProject(project.id, 'githubUrl', e.target.value)}
                            placeholder="GitHub URL"
                          />
                          <BrutalistInput
                            value={project.liveUrl}
                            onChange={(e) => handleUpdateProject(project.id, 'liveUrl', e.target.value)}
                            placeholder="Live URL"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            className="p-3 border-2 border-border bg-input font-medium"
                            value={project.status}
                            onChange={(e) => handleUpdateProject(project.id, 'status', e.target.value)}
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Planned">Planned</option>
                          </select>
                          <BrutalistInput
                            value={project.date}
                            onChange={(e) => handleUpdateProject(project.id, 'date', e.target.value)}
                            placeholder="Date (e.g., 2024-12)"
                          />
                        </div>
                        <div className="flex gap-2">
                          <BrutalistButton 
                            variant="destructive" 
                            size="default"
                            onClick={() => handleRemoveProject(project.id)}
                          >
                            Remove
                          </BrutalistButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{project.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                              project.status === 'Completed' 
                                ? 'border-green-500 bg-green-100 text-green-700'
                                : project.status === 'In Progress'
                                ? 'border-yellow-500 bg-yellow-100 text-yellow-700'
                                : 'border-blue-500 bg-blue-100 text-blue-700'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground">{project.date}</span>
                          </div>
                        </div>
                        <p className="font-medium mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent text-accent-foreground border-2 border-accent font-bold text-xs uppercase"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-primary hover:underline"
                            >
                              GitHub →
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-success hover:underline"
                            >
                              Live Demo →
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="border-2 border-dashed border-success-foreground p-4 space-y-3">
                    <h4 className="font-bold uppercase text-sm">Add New Project</h4>
                    <BrutalistInput
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Project Name"
                    />
                    <textarea
                      className="w-full p-3 border-2 border-border bg-input font-medium"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      rows={3}
                      placeholder="Project description"
                    />
                    <BrutalistInput
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                      placeholder="Technologies (comma separated)"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <BrutalistInput
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                        placeholder="GitHub URL"
                      />
                      <BrutalistInput
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                        placeholder="Live URL"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="p-3 border-2 border-border bg-input font-medium"
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Planned">Planned</option>
                      </select>
                      <BrutalistInput
                        value={newProject.date}
                        onChange={(e) => setNewProject({...newProject, date: e.target.value})}
                        placeholder="Date"
                      />
                    </div>
                    <BrutalistButton variant="secondary" size="full" onClick={handleAddProject}>
                      Add Project
                    </BrutalistButton>
                  </div>
                )}
              </div>
            </BrutalistCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
