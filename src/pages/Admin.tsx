import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { interviewApi, type Topic, type Question } from '@/lib/interviewApi';
import { ArrowLeft, Plus, Database, Settings, Users, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const Admin = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'topics' | 'questions'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Topic management
  const [newTopicName, setNewTopicName] = useState('');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  
  // Question management
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    topic_id: '',
    tags: '',
    time_minutes: ''
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState('');

  useEffect(() => {
    if (user?.sub) {
      fetchData();
    }
  }, [user?.sub]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicsData, questionsData] = await Promise.all([
        interviewApi.getTopics(user?.sub || ''),
        interviewApi.getQuestions(user?.sub || '')
      ]);
      setTopics(topicsData || []);
      setQuestions(questionsData || []);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await interviewApi.createTopic(user?.sub || '', { topic: newTopicName.trim() });
      setNewTopicName('');
      toast({
        title: "Topic Created",
        description: "Topic created successfully!",
        variant: "default",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Creating Topic",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.text.trim() || !newQuestion.topic_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tags = newQuestion.tags.trim() ? newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const timeMinutes = newQuestion.time_minutes.trim() ? parseInt(newQuestion.time_minutes.trim()) : null;
      
      await interviewApi.createQuestion(user?.sub || '', {
        topic_id: newQuestion.topic_id,
        question: newQuestion.text.trim(),
        tags: tags,
        time_minutes: timeMinutes
      });
      
      setNewQuestion({
        text: '',
        topic_id: '',
        tags: '',
        time_minutes: ''
      });
      
      toast({
        title: "Question Created",
        description: "Question created successfully!",
        variant: "default",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Creating Question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await interviewApi.deleteQuestion(user?.sub || '', questionId);
      toast({
        title: "Question Deleted",
        description: "Question deleted successfully!",
        variant: "default",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Deleting Question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Database size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Loading Admin Panel</h2>
              <p className="text-muted-foreground font-medium">Fetching topics and questions...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">⚙️</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold">Admin Panel</h1>
              <p className="text-2xl font-medium text-muted-foreground">Manage Topics & Questions</p>
            </div>
          </div>
          <BrutalistButton variant="outline" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </BrutalistButton>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <BrutalistCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Database size={24} className="text-white" />
              </div>
              <div className="text-3xl font-semibold mb-2">{topics.length}</div>
              <div className="text-sm font-medium">Topics</div>
            </div>
          </BrutalistCard>
          <BrutalistCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-success/70 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Settings size={24} className="text-white" />
              </div>
              <div className="text-3xl font-semibold mb-2">{questions.length}</div>
              <div className="text-sm font-medium">Questions</div>
            </div>
          </BrutalistCard>
          <BrutalistCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-3xl font-semibold mb-2">Admin</div>
              <div className="text-sm font-medium">Access Level</div>
            </div>
          </BrutalistCard>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            className={`glass-button px-6 py-3 font-medium text-sm ${
              activeTab === 'topics' 
                ? 'bg-primary/20 text-primary-foreground border-primary/30' 
                : 'hover:bg-white/20'
            }`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
          </button>
          <button
            className={`glass-button px-6 py-3 font-medium text-sm ${
              activeTab === 'questions' 
                ? 'bg-primary/20 text-primary-foreground border-primary/30' 
                : 'hover:bg-white/20'
            }`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
        </div>

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-8">
            {/* Create Topic */}
            <BrutalistCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-primary border-2 border-black"></div>
                <h3 className="text-xl font-black uppercase tracking-wide">Create New Topic</h3>
              </div>
              <div className="flex gap-3">
                <BrutalistInput
                  type="text"
                  placeholder="Enter topic name"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1"
                />
                <BrutalistButton 
                  variant="primary" 
                  onClick={handleCreateTopic}
                  disabled={!newTopicName.trim()}
                >
                  <Plus size={16} />
                </BrutalistButton>
              </div>
            </BrutalistCard>

            {/* Topics List */}
            <BrutalistCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-success border-2 border-black"></div>
                <h3 className="text-xl font-black uppercase tracking-wide">Existing Topics</h3>
              </div>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div key={topic.ID} className="p-4 border-3 border-black bg-background">
                    <div className="font-black text-foreground text-lg">{topic.Topic}</div>
                    <div className="text-sm text-muted-foreground font-medium">ID: {topic.ID}</div>
                  </div>
                ))}
                {topics.length === 0 && (
                  <div className="p-6 border-3 border-black bg-muted text-center text-muted-foreground">
                    <div className="text-lg font-medium">No topics found. Create one above.</div>
                  </div>
                )}
              </div>
            </BrutalistCard>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-8">
            {/* Create Question */}
            <BrutalistCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-accent border-2 border-black"></div>
                <h3 className="text-xl font-black uppercase tracking-wide">Create New Question</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block font-black uppercase text-sm mb-3 tracking-wide">Topic</label>
                  <select
                    className="w-full px-4 py-3 border-3 border-black bg-input text-foreground font-bold focus:border-accent focus:outline-none"
                    value={newQuestion.topic_id}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, topic_id: e.target.value }))}
                  >
                    <option value="">Select a topic...</option>
                    {topics.map((topic) => (
                      <option key={topic.ID} value={topic.ID}>
                        {topic.Topic}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-black uppercase text-sm mb-3 tracking-wide">Question Text</label>
                  <Textarea
                    placeholder="Enter the question text..."
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    className="min-h-[120px] border-3 border-black resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-black uppercase text-sm mb-3 tracking-wide">Tags (comma-separated)</label>
                    <BrutalistInput
                      type="text"
                      placeholder="e.g., javascript, algorithms, data-structures"
                      value={newQuestion.tags}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase text-sm mb-3 tracking-wide">Time Limit (minutes)</label>
                    <BrutalistInput
                      type="number"
                      placeholder="e.g., 15"
                      value={newQuestion.time_minutes}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, time_minutes: e.target.value }))}
                      min="1"
                      max="120"
                    />
                  </div>
                </div>
                
                <BrutalistButton 
                  variant="primary" 
                  onClick={handleCreateQuestion}
                  disabled={!newQuestion.text.trim() || !newQuestion.topic_id}
                >
                  <Plus className="mr-2" size={16} />
                  Create Question
                </BrutalistButton>
              </div>
            </BrutalistCard>

            {/* Questions List */}
            <BrutalistCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-destructive border-2 border-black"></div>
                <h3 className="text-xl font-black uppercase tracking-wide">Existing Questions</h3>
              </div>
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="p-6 border-3 border-black bg-background">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-black text-foreground text-lg mb-2">{question.question}</div>
                        <div className="text-sm text-muted-foreground font-medium mb-2">
                          Topic: {topics.find(t => t.ID === question.topic_id)?.Topic || 'Unknown'}
                        </div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="text-sm text-muted-foreground font-medium mb-1">
                            Tags: {question.tags.join(', ')}
                          </div>
                        )}
                        {question.time_minutes && (
                          <div className="text-sm text-muted-foreground font-medium">
                            Time Limit: {question.time_minutes} minutes
                          </div>
                        )}
                      </div>
                      <BrutalistButton
                        variant="destructive"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        Delete
                      </BrutalistButton>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="p-6 border-3 border-black bg-muted text-center text-muted-foreground">
                    <div className="text-lg font-medium">No questions found. Create one above.</div>
                  </div>
                )}
              </div>
            </BrutalistCard>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
