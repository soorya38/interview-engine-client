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
      const result = await profileApi.generateResume();
      // Open the download URL in a new tab
      window.open(result.downloadUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate resume:', err);
      setError('Failed to generate resume');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1>Profile</h1>
            {(!isApiAvailable() || error?.includes('Development Mode') || error?.includes('API not available')) && (
              <p className="text-sm text-muted-foreground mt-1">
                🔧 Development Mode: Profile data is saved locally
              </p>
            )}
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

            <BrutalistCard className="bg-white border-white">
              <h2 className="mb-6 flex items-center gap-2">
                <FolderOpen size={32} />
                Projects
              </h2>
              <div className="space-y-6">
                {profileData?.projects?.map((project, index) => (
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
