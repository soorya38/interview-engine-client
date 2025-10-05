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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent border-4 border-border flex items-center justify-center mb-4 animate-spin mx-auto">
                <Database size={32} className="animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2">Loading Admin Panel</h2>
              <p className="text-muted-foreground">Fetching topics and questions...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-xl font-bold uppercase">Manage Topics & Questions</p>
          </div>
          <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </BrutalistButton>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <BrutalistCard>
            <div className="text-center p-4">
              <Database size={32} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{topics.length}</div>
              <div className="text-sm font-bold uppercase">Topics</div>
            </div>
          </BrutalistCard>
          <BrutalistCard>
            <div className="text-center p-4">
              <Settings size={32} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-sm font-bold uppercase">Questions</div>
            </div>
          </BrutalistCard>
          <BrutalistCard>
            <div className="text-center p-4">
              <Shield size={32} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">Admin</div>
              <div className="text-sm font-bold uppercase">Access Level</div>
            </div>
          </BrutalistCard>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 border-2 font-bold uppercase text-sm ${
              activeTab === 'topics' 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
          </button>
          <button
            className={`px-4 py-2 border-2 font-bold uppercase text-sm ${
              activeTab === 'questions' 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
        </div>

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            {/* Create Topic */}
            <BrutalistCard>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Create New Topic</h3>
                <div className="flex gap-2">
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
              </div>
            </BrutalistCard>

            {/* Topics List */}
            <BrutalistCard>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Existing Topics</h3>
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div key={topic.ID} className="p-3 border-2 border-border bg-background">
                      <div className="font-bold text-foreground">{topic.Topic}</div>
                      <div className="text-xs text-muted-foreground">ID: {topic.ID}</div>
                    </div>
                  ))}
                  {topics.length === 0 && (
                    <div className="p-3 border-2 border-border bg-muted text-center text-muted-foreground">
                      No topics found. Create one above.
                    </div>
                  )}
                </div>
              </div>
            </BrutalistCard>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Create Question */}
            <BrutalistCard>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Create New Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold uppercase text-sm mb-2">Topic</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
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
                    <label className="block font-bold uppercase text-sm mb-2">Question Text</label>
                    <Textarea
                      placeholder="Enter the question text..."
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[100px] border-2 border-border resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase text-sm mb-2">Tags (comma-separated)</label>
                      <BrutalistInput
                        type="text"
                        placeholder="e.g., javascript, algorithms, data-structures"
                        value={newQuestion.tags}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-sm mb-2">Time Limit (minutes)</label>
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
              </div>
            </BrutalistCard>

            {/* Questions List */}
            <BrutalistCard>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Existing Questions</h3>
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div key={question.id} className="p-4 border-2 border-border bg-background">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-foreground mb-1">{question.question}</div>
                          <div className="text-sm text-muted-foreground">
                            Topic: {topics.find(t => t.ID === question.topic_id)?.Topic || 'Unknown'}
                          </div>
                          {question.tags && question.tags.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Tags: {question.tags.join(', ')}
                            </div>
                          )}
                          {question.time_minutes && (
                            <div className="text-xs text-muted-foreground">
                              Time Limit: {question.time_minutes} minutes
                            </div>
                          )}
                        </div>
                        <BrutalistButton
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </BrutalistButton>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="p-4 border-2 border-border bg-muted text-center text-muted-foreground">
                      No questions found. Create one above.
                    </div>
                  )}
                </div>
              </div>
            </BrutalistCard>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
