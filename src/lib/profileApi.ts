import apiClient from './apiClient';

// Types based on the OpenAPI specification
export interface ProfileInfo {
  name: string;
  title: string;
  email: string;
  location: string;
  phone: string;
}

export interface Experience {
  id?: number;
  role: string;
  company: string;
  dates: string;
  description: string;
}

export interface Education {
  id?: number;
  degree: string;
  school: string;
  dates: string;
}

export interface Achievement {
  id?: number;
  title: string;
  date: string;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  date: string;
}

export interface Profile {
  profile: ProfileInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  achievements: Achievement[];
  projects: Project[];
}

export interface ProfileUpdateRequest {
  profile: ProfileInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  achievements: Achievement[];
  projects: Project[];
}

export interface ExperienceCreateRequest {
  role: string;
  company: string;
  dates?: string;
  description?: string;
}

export interface EducationCreateRequest {
  degree: string;
  school: string;
  dates?: string;
}

export interface AchievementCreateRequest {
  title: string;
  date?: string;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status?: 'Completed' | 'In Progress' | 'Planned';
  date?: string;
}

export interface ResumeGenerationRequest {
  format?: 'pdf' | 'docx' | 'html';
  template?: 'modern' | 'classic' | 'creative' | 'minimal';
}

export interface ResumeGenerationResponse {
  downloadUrl: string;
  expiresAt: string;
}

// Profile API functions
export const profileApi = {
  // Get complete user profile
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  // Update complete user profile
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<Profile> => {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  },

  // Experience endpoints
  getExperiences: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/profile/experiences');
    return response.data;
  },

  addExperience: async (experience: ExperienceCreateRequest): Promise<Experience> => {
    const response = await apiClient.post('/profile/experiences', experience);
    return response.data;
  },

  getExperience: async (experienceId: number): Promise<Experience> => {
    const response = await apiClient.get(`/profile/experiences/${experienceId}`);
    return response.data;
  },

  updateExperience: async (experienceId: number, experience: ExperienceCreateRequest): Promise<Experience> => {
    const response = await apiClient.put(`/profile/experiences/${experienceId}`, experience);
    return response.data;
  },

  deleteExperience: async (experienceId: number): Promise<void> => {
    await apiClient.delete(`/profile/experiences/${experienceId}`);
  },

  // Education endpoints
  getEducation: async (): Promise<Education[]> => {
    const response = await apiClient.get('/profile/education');
    return response.data;
  },

  addEducation: async (education: EducationCreateRequest): Promise<Education> => {
    const response = await apiClient.post('/profile/education', education);
    return response.data;
  },

  updateEducation: async (educationId: number, education: EducationCreateRequest): Promise<Education> => {
    const response = await apiClient.put(`/profile/education/${educationId}`, education);
    return response.data;
  },

  deleteEducation: async (educationId: number): Promise<void> => {
    await apiClient.delete(`/profile/education/${educationId}`);
  },

  // Skills endpoints
  getSkills: async (): Promise<string[]> => {
    const response = await apiClient.get('/profile/skills');
    return response.data;
  },

  addSkill: async (skill: string): Promise<{ message: string; skills: string[] }> => {
    const response = await apiClient.post('/profile/skills', { skill });
    return response.data;
  },

  removeSkill: async (skill: string): Promise<{ message: string; skills: string[] }> => {
    const response = await apiClient.delete(`/profile/skills/${encodeURIComponent(skill)}`);
    return response.data;
  },

  // Achievements endpoints
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await apiClient.get('/profile/achievements');
    return response.data;
  },

  addAchievement: async (achievement: AchievementCreateRequest): Promise<Achievement> => {
    const response = await apiClient.post('/profile/achievements', achievement);
    return response.data;
  },

  updateAchievement: async (achievementId: number, achievement: AchievementCreateRequest): Promise<Achievement> => {
    const response = await apiClient.put(`/profile/achievements/${achievementId}`, achievement);
    return response.data;
  },

  deleteAchievement: async (achievementId: number): Promise<void> => {
    await apiClient.delete(`/profile/achievements/${achievementId}`);
  },

  // Projects endpoints
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/profile/projects');
    return response.data;
  },

  addProject: async (project: ProjectCreateRequest): Promise<Project> => {
    const response = await apiClient.post('/profile/projects', project);
    return response.data;
  },

  getProject: async (projectId: number): Promise<Project> => {
    const response = await apiClient.get(`/profile/projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId: number, project: ProjectCreateRequest): Promise<Project> => {
    const response = await apiClient.put(`/profile/projects/${projectId}`, project);
    return response.data;
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/profile/projects/${projectId}`);
  },

  // Resume generation
  generateResume: async (options?: ResumeGenerationRequest): Promise<ResumeGenerationResponse> => {
    const response = await apiClient.post('/profile/generate-resume', options);
    return response.data;
  },
};
