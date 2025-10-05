import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { useAuthStore } from '@/store/authStore';
import { profileApi, type Profile, type ProfileInfo, type Experience, type Education, type Achievement, type Project } from '@/lib/profileApi';
import { API_CONFIG, isApiAvailable } from '@/lib/config';
import { User, Briefcase, GraduationCap, Award, FileDown, FolderOpen } from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState<Profile>({
    profile: {
      name: user?.name || 'User',
      title: 'Role',
      email: user?.email || '',
      location: 'Address',
      phone: 'Number',
    },
    experiences: [],
    education: [],
    skills: [],
    achievements: [],
    projects: [],
  });

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

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if API is available
        if (!isApiAvailable()) {
          // Development mode - load from localStorage
          console.log('Development mode: loading from localStorage');
          const savedProfile = localStorage.getItem('profile_data');
          if (savedProfile) {
            setProfileData(JSON.parse(savedProfile));
          } else {
            setProfileData({
              profile: {
                name: user?.name || 'User',
                title: 'Role',
                email: user?.email || '',
                location: 'Address',
                phone: 'Number',
              },
              experiences: [],
              education: [],
              skills: [],
              achievements: [],
              projects: [],
            });
          }
          return;
        }
        
        const data = await profileApi.getProfile();
        setProfileData(data);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        if (err.response?.status === 404) {
          // Profile doesn't exist yet, check localStorage first
          const savedProfile = localStorage.getItem('profile_data');
          if (savedProfile) {
            console.log('Loading profile from localStorage');
            setProfileData(JSON.parse(savedProfile));
          } else {
            console.log('Profile not found, using default values');
            setProfileData({
              profile: {
                name: user?.name || 'User',
                title: 'Role',
                email: user?.email || '',
                location: 'Address',
                phone: 'Number',
              },
              experiences: [],
              education: [],
              skills: [],
              achievements: [],
              projects: [],
            });
          }
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || 'User',
          email: user.email || '',
        }
      }));
    }
  }, [user]);

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Create HTML content for the resume
      const resumeHTML = generateResumeHTML(profileData);
      
      printWindow.document.write(resumeHTML);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
    } catch (err) {
      console.error('Failed to generate resume:', err);
      setError('Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const generateResumeHTML = (profile: Profile) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${profile.profile.name}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .title {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
          }
          .contact {
            font-size: 14px;
            color: #555;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .experience-item, .education-item, .project-item {
            margin-bottom: 15px;
          }
          .item-title {
            font-weight: bold;
            font-size: 16px;
          }
          .item-company, .item-school {
            font-weight: bold;
            color: #666;
          }
          .item-dates {
            font-style: italic;
            color: #888;
            font-size: 14px;
          }
          .item-description {
            margin-top: 5px;
            font-size: 14px;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill-tag {
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid #ddd;
          }
          .project-links {
            margin-top: 5px;
          }
          .project-links a {
            color: #0066cc;
            text-decoration: none;
            margin-right: 15px;
            font-size: 14px;
          }
          .project-links a:hover {
            text-decoration: underline;
          }
          .technologies {
            margin-top: 5px;
            font-size: 14px;
            color: #666;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${profile.profile.name}</div>
          <div class="title">${profile.profile.title}</div>
          <div class="contact">
            ${profile.profile.email} | ${profile.profile.phone} | ${profile.profile.location}
          </div>
        </div>

        ${profile.experiences && profile.experiences.length > 0 ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${profile.experiences.map(exp => `
            <div class="experience-item">
              <div class="item-title">${exp.role}</div>
              <div class="item-company">${exp.company}</div>
              <div class="item-dates">${exp.dates}</div>
              <div class="item-description">${exp.description}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${profile.education && profile.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${profile.education.map(edu => `
            <div class="education-item">
              <div class="item-title">${edu.degree}</div>
              <div class="item-school">${edu.school}</div>
              <div class="item-dates">${edu.dates}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${profile.skills && profile.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${profile.projects && profile.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${profile.projects.map(project => `
            <div class="project-item">
              <div class="item-title">${project.name}</div>
              <div class="item-dates">${project.date} - ${project.status}</div>
              <div class="item-description">${project.description}</div>
              ${project.technologies && project.technologies.length > 0 ? `
                <div class="technologies">
                  <strong>Technologies:</strong> ${project.technologies.join(', ')}
                </div>
              ` : ''}
              ${(project.githubUrl || project.liveUrl) ? `
                <div class="project-links">
                  ${project.githubUrl ? `<a href="${project.githubUrl}">GitHub</a>` : ''}
                  ${project.liveUrl ? `<a href="${project.liveUrl}">Live Demo</a>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${profile.achievements && profile.achievements.length > 0 ? `
        <div class="section">
          <div class="section-title">Achievements</div>
          ${profile.achievements.map(achievement => `
            <div class="experience-item">
              <div class="item-title">${achievement.title}</div>
              <div class="item-dates">${achievement.date}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if API is available
      if (!isApiAvailable()) {
        // Development mode - save to localStorage
        console.log('Development mode: saving to localStorage');
        localStorage.setItem('profile_data', JSON.stringify(profileData));
        setIsEditing(false);
        setError('Profile saved locally (Development Mode)');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      await profileApi.updateProfile(profileData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      if (err.response?.status === 404) {
        // API not available, save to localStorage as fallback
        console.log('API endpoint not found, saving to localStorage');
        localStorage.setItem('profile_data', JSON.stringify(profileData));
        setIsEditing(false);
        setError('Profile saved locally (API not available)');
        setTimeout(() => setError(null), 3000);
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to save profile data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim()) {
      try {
        setLoading(true);
        setError(null);
        const result = await profileApi.addSkill(newSkill.trim());
        setProfileData(prev => ({
          ...prev,
          skills: result.skills
        }));
        setNewSkill('');
      } catch (err) {
        console.error('Failed to add skill:', err);
        setError('Failed to add skill');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await profileApi.removeSkill(skill);
      setProfileData(prev => ({
        ...prev,
        skills: result.skills
      }));
    } catch (err) {
      console.error('Failed to remove skill:', err);
      setError('Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (newExperience.role && newExperience.company) {
      try {
        setLoading(true);
        setError(null);
        const result = await profileApi.addExperience(newExperience);
        setProfileData(prev => ({
          ...prev,
          experiences: [...prev.experiences, result]
        }));
        setNewExperience({ role: '', company: '', dates: '', description: '' });
      } catch (err) {
        console.error('Failed to add experience:', err);
        setError('Failed to add experience');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddEducation = async () => {
    if (newEducation.degree && newEducation.school) {
      try {
        setLoading(true);
        setError(null);
        const result = await profileApi.addEducation(newEducation);
        setProfileData(prev => ({
          ...prev,
          education: [...prev.education, result]
        }));
        setNewEducation({ degree: '', school: '', dates: '' });
      } catch (err) {
        console.error('Failed to add education:', err);
        setError('Failed to add education');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAchievement = async () => {
    if (newAchievement.title) {
      try {
        setLoading(true);
        setError(null);
        const result = await profileApi.addAchievement(newAchievement);
        setProfileData(prev => ({
          ...prev,
          achievements: [...prev.achievements, result]
        }));
        setNewAchievement({ title: '', date: '' });
      } catch (err) {
        console.error('Failed to add achievement:', err);
        setError('Failed to add achievement');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateExperience = async (id: number, field: string, value: string) => {
    try {
      setLoading(true);
      setError(null);
      const experience = profileData?.experiences?.find(exp => exp.id === id);
      if (experience) {
        const updatedExperience = { ...experience, [field]: value };
        const result = await profileApi.updateExperience(id, updatedExperience);
        setProfileData(prev => ({
          ...prev,
          experiences: prev.experiences.map(exp => exp.id === id ? result : exp)
        }));
      }
    } catch (err) {
      console.error('Failed to update experience:', err);
      setError('Failed to update experience');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExperience = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await profileApi.deleteExperience(id);
      setProfileData(prev => ({
        ...prev,
        experiences: prev.experiences.filter(exp => exp.id !== id)
      }));
    } catch (err) {
      console.error('Failed to remove experience:', err);
      setError('Failed to remove experience');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEducation = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await profileApi.deleteEducation(id);
      setProfileData(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }));
    } catch (err) {
      console.error('Failed to remove education:', err);
      setError('Failed to remove education');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAchievement = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await profileApi.deleteAchievement(id);
      setProfileData(prev => ({
        ...prev,
        achievements: prev.achievements.filter(ach => ach.id !== id)
      }));
    } catch (err) {
      console.error('Failed to remove achievement:', err);
      setError('Failed to remove achievement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (newProject.name && newProject.description) {
      try {
        setLoading(true);
        setError(null);
        const technologies = newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
        const projectData = {
          ...newProject,
          technologies,
          status: newProject.status as 'Completed' | 'In Progress' | 'Planned'
        };
        const result = await profileApi.addProject(projectData);
        setProfileData(prev => ({
          ...prev,
          projects: [...prev.projects, result]
        }));
        setNewProject({
          name: '',
          description: '',
          technologies: '',
          githubUrl: '',
          liveUrl: '',
          status: 'Completed',
          date: ''
        });
      } catch (err) {
        console.error('Failed to add project:', err);
        setError('Failed to add project');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProject = async (id: number, field: string, value: string) => {
    try {
      setLoading(true);
      setError(null);
      const project = profileData?.projects?.find(proj => proj.id === id);
      if (project) {
        const updatedProject = { ...project, [field]: value };
        const result = await profileApi.updateProject(id, updatedProject);
        setProfileData(prev => ({
          ...prev,
          projects: prev.projects.map(proj => proj.id === id ? result : proj)
        }));
      }
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProject = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await profileApi.deleteProject(id);
      setProfileData(prev => ({
        ...prev,
        projects: prev.projects.filter(proj => proj.id !== id)
      }));
    } catch (err) {
      console.error('Failed to remove project:', err);
      setError('Failed to remove project');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData?.profile?.name) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <h2 className="text-xl font-bold uppercase mb-4">Loading Profile...</h2>
              <p>Please wait while we load your profile data.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive text-destructive-foreground border-4 border-destructive p-4 mb-6">
            <p className="font-bold text-sm uppercase mb-2">Error</p>
            <p className="text-sm">{error}</p>
            <BrutalistButton
              variant="destructive"
              size="default"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </BrutalistButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl luxury-glow">
              <User className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">Profile</h1>
              {(!isApiAvailable() || error?.includes('Development Mode') || error?.includes('API not available')) && (
                <p className="text-sm text-white/70 mt-1">
                  🔧 Development Mode: Profile data is saved locally
                </p>
              )}
            </div>
          </div>
          <BrutalistButton
            variant={isEditing ? 'success' : 'primary'}
            onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
            disabled={loading}
          >
            {loading ? 'Loading...' : isEditing ? 'Save Changes' : 'Edit Profile'}
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
                    value={profileData?.profile?.name || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                    placeholder="Full Name"
                  />
                  <BrutalistInput
                    value={profileData?.profile?.title || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, title: e.target.value }
                    }))}
                    placeholder="Job Title"
                  />
                  <BrutalistInput
                    value={profileData?.profile?.email || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    placeholder="Email"
                  />
                  <BrutalistInput
                    value={profileData?.profile?.location || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, location: e.target.value }
                    }))}
                    placeholder="Location"
                  />
                  <BrutalistInput
                    value={profileData?.profile?.phone || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    placeholder="Phone"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="mb-2">{profileData?.profile?.name || 'User'}</h2>
                  <p className="text-xl font-bold mb-4">{profileData?.profile?.title || 'Role'}</p>
                  <div className="space-y-2 text-left">
                    <p className="font-bold">{profileData?.profile?.email || ''}</p>
                    <p className="font-bold">{profileData?.profile?.location || 'Address'}</p>
                    <p className="font-bold">{profileData?.profile?.phone || 'Number'}</p>
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
                {profileData?.experiences?.map((exp) => (
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
                {profileData?.education?.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-success pl-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <BrutalistInput
                          value={edu.degree}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            education: prev.education.map(ed => 
                              ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                            )
                          }))}
                          placeholder="Degree"
                        />
                        <BrutalistInput
                          value={edu.school}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            education: prev.education.map(ed => 
                              ed.id === edu.id ? { ...ed, school: e.target.value } : ed
                            )
                          }))}
                          placeholder="School"
                        />
                        <BrutalistInput
                          value={edu.dates}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            education: prev.education.map(ed => 
                              ed.id === edu.id ? { ...ed, dates: e.target.value } : ed
                            )
                          }))}
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
                {profileData?.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-accent text-accent-foreground border-4 border-accent font-bold uppercase flex items-center gap-2"
                  >
                    {skill}
                    {isEditing && (
                      <button 
                        className="text-xl hover:text-destructive"
                        onClick={() => handleRemoveSkill(skill)}
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
                {profileData?.achievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex justify-between items-center border-b-4 border-success-foreground pb-3 last:border-0"
                  >
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <BrutalistInput
                          value={achievement.title}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            achievements: prev.achievements.map(ach => 
                              ach.id === achievement.id ? { ...ach, title: e.target.value } : ach
                            )
                          }))}
                          placeholder="Achievement title"
                        />
                        <BrutalistInput
                          value={achievement.date}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            achievements: prev.achievements.map(ach => 
                              ach.id === achievement.id ? { ...ach, date: e.target.value } : ach
                            )
                          }))}
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

            <BrutalistCard>
              <h2 className="mb-8 text-white">
                <span className="text-2xl font-semibold">Projects</span>
              </h2>
              <div className="space-y-6">
                {profileData?.projects?.map((project, index) => (
                  <div key={project.id} className="luxury-glass-card p-6 mb-6">
                    {index > 0 && <div className="border-t border-white/20 mb-6"></div>}
                    {isEditing ? (
                      <div className="space-y-3">
                        <BrutalistInput
                          value={project.name}
                          onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                          placeholder="Project Name"
                        />
                        <textarea
                          className="w-full px-4 py-3 luxury-glass-input text-white font-medium focus:border-violet-500 focus:outline-none placeholder:text-white/50"
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
                            className="w-full px-4 py-3 luxury-glass-input text-white font-medium focus:border-violet-500 focus:outline-none"
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
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-semibold text-white">{project.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 text-sm font-medium rounded-xl ${
                              project.status === 'Completed' 
                                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                                : project.status === 'In Progress'
                                ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30'
                                : 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-sm font-medium text-white/70">{project.date}</span>
                          </div>
                        </div>
                        <p className="font-medium mb-4 text-white/80 text-lg leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-violet-500/20 text-violet-100 border border-violet-500/30 font-medium text-sm rounded-xl"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="luxury-glass-button px-6 py-3 text-white hover:bg-white/20 transition-all"
                            >
                              GitHub →
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="luxury-glass-button px-6 py-3 text-white hover:bg-white/20 transition-all"
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
                  <div className="luxury-glass-card p-6 space-y-4">
                    <h4 className="font-semibold text-white text-lg">Add New Project</h4>
                    <BrutalistInput
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Project Name"
                    />
                    <textarea
                      className="w-full px-4 py-3 luxury-glass-input text-white font-medium focus:border-violet-500 focus:outline-none placeholder:text-white/50"
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
                        className="w-full px-4 py-3 luxury-glass-input text-white font-medium focus:border-violet-500 focus:outline-none"
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
