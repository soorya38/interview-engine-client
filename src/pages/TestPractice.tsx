import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { ArrowLeft, Mic, Send, MessageSquare, Settings, Phone, GripVertical, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost/api';
const SILENCE_THRESHOLD = 4000;

interface Topic {
  ID: string;
  Topic: string;
}

interface Summary {
  technical_score: number;
  grammatical_score: number;
  strong_points: string[];
  weak_points: string[];
  practice_points: string[];
  contextual_relevant: boolean;
  off_topic_count: number;
}

const TestPractice = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [screen, setScreen] = useState<'lobby' | 'meet' | 'summary'>('lobby');
  const [userId, setUserId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('en-US-Standard-B');
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [interviewerMessage, setInterviewerMessage] = useState('Waiting to start...');
  const [answerText, setAnswerText] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceBuffer, setVoiceBuffer] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState('');
  const [activeTab, setActiveTab] = useState<'interview' | 'topics' | 'questions'>('interview');
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastSpeechActivityRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.sub) {
      setUserId(user.sub);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      fetchTopics();
    }
  }, [userId]);

  useEffect(() => {
    if (topics.length > 0 && !selectedQuestionTopic) {
      setSelectedQuestionTopic(topics[0].ID);
    }
  }, [topics, selectedQuestionTopic]);

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsSpeaking(true);
      setVoiceBuffer('');
      lastSpeechActivityRef.current = Date.now();
      startSilenceDetection();
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsSpeaking(false);
      stopSilenceDetection();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings.",
          variant: "destructive",
        });
      }
      setIsRecording(false);
      setIsSpeaking(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        lastSpeechActivityRef.current = Date.now();
        setIsSpeaking(true);
        
        const commandFound = handleVoiceCommand(finalTranscript.toLowerCase().trim());
        if (!commandFound) {
          setVoiceBuffer(prev => prev + finalTranscript);
          setAnswerText(prev => (prev + ' ' + finalTranscript).trim());
        }
      }
    };

    recognitionRef.current = recognition;
  };

  const startSilenceDetection = () => {
    const checkSilence = () => {
      const silenceDuration = Date.now() - lastSpeechActivityRef.current;
      
      if (silenceDuration > SILENCE_THRESHOLD && voiceBuffer.trim()) {
        setIsSpeaking(false);
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
        setTimeout(() => {
          handleSendAnswer();
        }, 100);
        return;
      }
      
      if (isRecording) {
        silenceTimerRef.current = setTimeout(checkSilence, 500);
      }
    };
    
    silenceTimerRef.current = setTimeout(checkSilence, 500);
  };

  const stopSilenceDetection = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const handleVoiceCommand = (transcript: string): boolean => {
    const commands: { [key: string]: () => void } = {
      "send answer": () => handleSendAnswer(),
      "submit answer": () => handleSendAnswer(),
      "stop listening": () => recognitionRef.current?.stop(),
      "open chat": () => { setShowSettings(false); setShowChat(true); },
      "close chat": () => setShowChat(false),
      "open settings": () => { setShowChat(false); setShowSettings(true); },
      "close settings": () => setShowSettings(false),
      "end interview": () => handleEndInterview(),
      "hang up": () => handleEndInterview(),
    };
    
    for (const phrase in commands) {
      if (transcript.includes(phrase)) {
        commands[phrase]();
        return true;
      }
    }
    return false;
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      stopSilenceDetection();
      setVoiceBuffer('');
      lastSpeechActivityRef.current = Date.now();
      setAnswerText('');
      recognitionRef.current?.start();
    }
  };

  const apiCall = async (endpoint: string, method = 'GET', body: any = null, extraHeaders: any = {}) => {
    const headers: any = {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
      'ngrok-skip-browser-warning': 'true',
      ...extraHeaders,
    };
    
    const config: RequestInit = { method, headers };
    if (body) config.body = JSON.stringify(body);
    
    try {
      config.headers = {
        ...(config.headers || {}),
        "X-User-ID": userId, // 👈 set your userId here
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (response.status === 204) return null;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('API Call Failed:', error);
      throw error;
    }
  };

  const initializeAudio = async () => {
    if (audioInitialized || !audioPlayerRef.current) return;
    
    try {
      // Try to play a silent audio to initialize the audio context
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
      await silentAudio.play();
      silentAudio.pause();
      setAudioInitialized(true);
      console.log('Audio context initialized');
    } catch (error) {
      console.log('Audio initialization failed, will try on first user interaction:', error);
    }
  };

  const speakText = async (text: string) => {
    if (!apiKey || !text) {
      console.log('TTS skipped - missing API key or text:', { apiKey: !!apiKey, text: !!text });
      return;
    }
    
    // Initialize audio if not done yet
    if (!audioInitialized) {
      await initializeAudio();
    }
    
    console.log('Starting TTS for text:', text.substring(0, 50) + '...');
    
    const requestBody = {
      input: { text },
      voice: {
        languageCode: selectedVoice.substring(0, 5),
        name: selectedVoice,
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
    
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API error:', response.status, errorText);
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('TTS API response received:', !!data.audioContent);
      
      if (data.audioContent && audioPlayerRef.current) {
        console.log('Setting audio source and playing...');
        audioPlayerRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        
        // Add event listeners for debugging
        audioPlayerRef.current.onloadstart = () => console.log('Audio loading started');
        audioPlayerRef.current.oncanplay = () => console.log('Audio can play');
        audioPlayerRef.current.onplay = () => console.log('Audio started playing');
        audioPlayerRef.current.onerror = (e) => console.error('Audio error:', e);
        
        const playPromise = audioPlayerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio play promise resolved');
          }).catch((error) => {
            console.error('Audio play failed:', error);
            toast({
              title: "Audio Playback Failed",
              description: "Unable to play audio. Check your browser's autoplay settings.",
              variant: "destructive",
            });
          });
        }
      } else {
        console.error('TTS failed - missing audio content or player ref');
      }
    } catch (error) {
      console.error('TTS Failed:', error);
      toast({
        title: "Text-to-Speech Error",
        description: error instanceof Error ? error.message : 'Unknown TTS error',
        variant: "destructive",
      });
    }
  };

  const fetchTopics = async () => {
    try {
      const topicsData = await apiCall('/topics');
      setTopics(topicsData || []);
      if (topicsData && topicsData.length > 0) {
        setSelectedTopic(topicsData[0].ID);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Topics",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartInterview = async () => {
    if (!userId || !selectedTopic) {
      toast({
        title: "Missing Information",
        description: "Please set a User ID and select a topic.",
        variant: "destructive",
      });
      return;
    }

    // Initialize audio on user interaction
    await initializeAudio();

    setScreen('meet');
    setChatHistory([]);
    setAnswerText('');
    setInterviewerMessage('Starting interview...');

    try {
      const sessionData = await apiCall('/interview/start', 'POST', null, { 'X-Topic-ID': selectedTopic });
      setCurrentSessionId(sessionData.session_id);
      setInterviewerMessage(sessionData.initial_question);
      setChatHistory([{ sender: 'AI Interviewer', text: sessionData.initial_question }]);
      speakText(sessionData.initial_question);
    } catch (error: any) {
      toast({
        title: "Error Starting Interview",
        description: error.message,
        variant: "destructive",
      });
      setInterviewerMessage(`Error: ${error.message}`);
    }
  };

  const handleSendAnswer = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const text = (voiceBuffer || answerText).trim();
    if (!text || !currentSessionId) return;

    setAnswerText('');
    setVoiceBuffer('');
    setChatHistory(prev => [...prev, { sender: 'You', text }]);

    try {
      const data = await apiCall(`/interview/${currentSessionId}`, 'POST', { text });
      if (data && data.response) {
        setInterviewerMessage(data.response);
        setChatHistory(prev => [...prev, { sender: 'AI Interviewer', text: data.response }]);
        speakText(data.response);

        if (data.session_ended) {
          setTimeout(() => {
            setSummary(data.summary);
            setScreen('summary');
          }, 2000);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error Sending Answer",
        description: error.message,
        variant: "destructive",
      });
      setInterviewerMessage(`Error: ${error.message}`);
    }
  };

  const handleEndInterview = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    }

    if (!currentSessionId) {
      setScreen('lobby');
      return;
    }

    try {
      const data = await apiCall(`/interview/end/${currentSessionId}`, 'POST');
      setSummary(data.summary);
      setScreen('summary');
    } catch (error: any) {
      toast({
        title: "Error Ending Interview",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTopic = async () => {
    if (!userId || !newTopicName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please set a User ID and enter a topic name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiCall('/topics', 'POST', { topic: newTopicName.trim() });
      setNewTopicName('');
      toast({
        title: "Topic Created",
        description: "Topic created successfully!",
        variant: "default",
      });
      fetchTopics();
    } catch (error: any) {
      toast({
        title: "Error Creating Topic",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuestion = async () => {
    if (!userId || !selectedQuestionTopic || !newQuestionText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a topic and enter question text.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiCall('/questions', 'POST', { 
        topic_id: selectedQuestionTopic, 
        question: newQuestionText.trim() 
      });
      setNewQuestionText('');
      toast({
        title: "Question Created",
        description: "Question created successfully!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderLobbyScreen = () => (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Practice</h1>
        <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
          <ArrowLeft className="mr-2" size={16} />
          Back
        </BrutalistButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BrutalistCard>
            <div className="flex items-center gap-2 mb-6">
              <button
                className={`px-4 py-2 border-2 font-bold uppercase text-sm ${
                  activeTab === 'interview' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border bg-background text-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('interview')}
              >
                Interview
              </button>
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

            {activeTab === 'interview' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">User ID</label>
                  <BrutalistInput
                    type="text"
                    placeholder="Auto-populated from your account"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={!!user?.sub}
                    className={user?.sub ? 'bg-muted cursor-not-allowed' : ''}
                  />
                  {user?.sub && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Automatically set from your Zitadel account
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Topic</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={topics.length === 0}
                  >
                    {topics.length === 0 ? (
                      <option>Set User ID to load topics...</option>
                    ) : (
                      topics.map((topic) => (
                        <option key={topic.ID} value={topic.ID}>
                          {topic.Topic}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Google Cloud API Key</label>
                  <BrutalistInput
                    type="password"
                    placeholder="Required for speech"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Interviewer Voice</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                  >
                    <optgroup label="English (US)">
                      <option value="en-US-Standard-B">US Male (Standard)</option>
                      <option value="en-US-Standard-C">US Female (Standard)</option>
                    </optgroup>
                    <optgroup label="English (UK)">
                      <option value="en-GB-Standard-B">UK Male (Standard)</option>
                      <option value="en-GB-Standard-C">UK Female (Standard)</option>
                    </optgroup>
                    <optgroup label="English (Australia)">
                      <option value="en-AU-Standard-B">AU Male (Standard)</option>
                      <option value="en-AU-Standard-C">AU Female (Standard)</option>
                    </optgroup>
                    <optgroup label="English (India)">
                      <option value="en-IN-Standard-B">Indian Male (Standard)</option>
                      <option value="en-IN-Standard-A">Indian Female (Standard)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <BrutalistButton 
                    variant="secondary" 
                    size="full"
                    onClick={() => {
                      if (!apiKey) {
                        toast({
                          title: "API Key Required",
                          description: "Please enter your Google Cloud API key first.",
                          variant: "destructive",
                        });
                        return;
                      }
                      speakText("Hello! This is a test of the text-to-speech functionality. If you can hear this, the TTS is working correctly.");
                    }}
                    disabled={!apiKey}
                  >
                    Test Voice
                  </BrutalistButton>
                </div>

                <BrutalistButton variant="primary" size="full" onClick={handleStartInterview}>
                  Start Interview
                </BrutalistButton>
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Create New Topic</label>
                  <div className="flex gap-2">
                    <BrutalistInput
                      type="text"
                      placeholder="Enter topic name"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="flex-1"
                    />
                    <BrutalistButton 
                      variant="secondary" 
                      onClick={handleCreateTopic}
                      disabled={!newTopicName.trim()}
                    >
                      <Plus size={16} />
                    </BrutalistButton>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Existing Topics</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {topics.map((topic) => (
                      <div key={topic.ID} className="p-3 border-2 border-border bg-background">
                        <div className="font-bold text-foreground">{topic.Topic || 'Unnamed Topic'}</div>
                      </div>
                    ))}
                    {topics.length === 0 && (
                      <div className="p-3 border-2 border-border bg-muted text-center text-muted-foreground">
                        No topics found. Create one above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Create New Question</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold uppercase text-sm mb-2">Topic</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                        value={selectedQuestionTopic}
                        onChange={(e) => setSelectedQuestionTopic(e.target.value)}
                        disabled={topics.length === 0}
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
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="min-h-[100px] border-2 border-border resize-none"
                      />
                    </div>
                    <BrutalistButton 
                      variant="primary" 
                      onClick={handleCreateQuestion}
                      disabled={!selectedQuestionTopic || !newQuestionText.trim()}
                    >
                      <Plus className="mr-2" size={16} />
                      Create Question
                    </BrutalistButton>
                  </div>
                </div>
              </div>
            )}
          </BrutalistCard>
        </div>

        <div className="lg:col-span-1">
          <BrutalistCard>
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 bg-accent border-4 border-border flex items-center justify-center mb-6">
                <span className="text-6xl">🤖</span>
              </div>
              <h2 className="text-center mb-4">AI Interviewer</h2>
              <p className="text-center text-sm text-muted-foreground">
                Practice your interview skills with our AI-powered interviewer. 
                Get real-time feedback and improve your performance.
              </p>
            </div>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );

  const renderMeetScreen = () => (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full flex items-center justify-center p-8">
          <BrutalistCard className="max-w-4xl w-full">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-accent border-4 border-border flex items-center justify-center mb-6">
                <span className="text-5xl">🤖</span>
              </div>
              <div className="text-xl font-bold text-center">{interviewerMessage}</div>
            </div>
          </BrutalistCard>
        </div>

        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50">
          <BrutalistCard className={`${isSpeaking ? 'border-accent' : ''}`}>
            <div className="flex items-center gap-2 mb-2 cursor-move">
              <GripVertical size={20} className="text-muted-foreground" />
              <div className="font-bold uppercase text-sm">Your Response</div>
            </div>
            <Textarea
              placeholder="Type or use the mic to reply..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAnswer();
                }
              }}
              className="min-h-[100px] border-2 border-border resize-none"
            />
            <div className="text-xs text-muted-foreground mt-2">
              Try: "send answer", "open chat", "end interview"
            </div>
          </BrutalistCard>
        </div>

        {showChat && (
          <div className="fixed right-0 top-0 h-full w-96 bg-secondary border-l-4 border-border z-40 overflow-hidden flex flex-col">
            <div className="p-4 border-b-4 border-border flex justify-between items-center">
              <h3 className="font-bold uppercase">In-call messages</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="border-2 border-border bg-background p-3">
                  <div className="font-bold text-sm mb-1">{msg.sender}</div>
                  <div className="text-sm">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed right-0 top-0 h-full w-96 bg-secondary border-l-4 border-border z-40 overflow-hidden flex flex-col">
            <div className="p-4 border-b-4 border-border flex justify-between items-center">
              <h3 className="font-bold uppercase">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Google Cloud API Key</label>
                <BrutalistInput
                  type="password"
                  placeholder="Required for speech"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Interviewer Voice</label>
                <select
                  className="w-full px-4 py-3 border-2 border-border bg-input text-primary font-medium focus:border-accent focus:outline-none"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <optgroup label="English (US)">
                    <option value="en-US-Standard-B">US Male (Standard)</option>
                    <option value="en-US-Standard-C">US Female (Standard)</option>
                  </optgroup>
                  <optgroup label="English (UK)">
                    <option value="en-GB-Standard-B">UK Male (Standard)</option>
                    <option value="en-GB-Standard-C">UK Female (Standard)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-secondary border-t-4 border-border p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <BrutalistButton variant="secondary" onClick={() => window.location.href = '/'}>
              <ArrowLeft size={16} />
            </BrutalistButton>
            <span className="font-bold">{currentTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <BrutalistButton
              variant={isRecording ? 'destructive' : 'accent'}
              onClick={toggleVoiceRecording}
            >
              <Mic size={20} />
            </BrutalistButton>
            <BrutalistButton variant="primary" onClick={handleSendAnswer}>
              <Send size={20} />
            </BrutalistButton>
            <BrutalistButton variant="destructive" onClick={handleEndInterview}>
              <Phone size={20} />
            </BrutalistButton>
          </div>

          <div className="flex items-center gap-2">
            <BrutalistButton variant="secondary" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={20} />
            </BrutalistButton>
            <BrutalistButton variant="secondary" onClick={() => setShowChat(!showChat)}>
              <MessageSquare size={20} />
            </BrutalistButton>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderSummaryScreen = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BrutalistCard>
        <h2 className="mb-6">Interview Summary</h2>

        {summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <BrutalistCard variant="success">
                <div className="text-sm font-bold uppercase mb-2">Technical Score</div>
                <div className="text-4xl font-bold">{summary.technical_score}/100</div>
              </BrutalistCard>
              <BrutalistCard variant="accent">
                <div className="text-sm font-bold uppercase mb-2">Grammar Score</div>
                <div className="text-4xl font-bold">{summary.grammatical_score}/100</div>
              </BrutalistCard>
            </div>

            <div>
              <h3 className="mb-3">Strong Points</h3>
              {summary.strong_points && summary.strong_points.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {summary.strong_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>None noted.</p>
              )}
            </div>

            <div>
              <h3 className="mb-3">Areas for Improvement</h3>
              {summary.weak_points && summary.weak_points.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {summary.weak_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>None noted.</p>
              )}
            </div>

            <div>
              <h3 className="mb-3">Practice Recommendations</h3>
              {summary.practice_points && summary.practice_points.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {summary.practice_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>None noted.</p>
              )}
            </div>

            <div className="p-4 bg-secondary border-2 border-border">
              <div className="text-sm">
                <strong>Interview Stats:</strong>{' '}
                {summary.contextual_relevant ? 'Responses were relevant' : 'Some responses were off-topic'}
                {summary.off_topic_count > 0 && ` (${summary.off_topic_count} off-topic responses)`}
              </div>
            </div>

            <BrutalistButton
              variant="primary"
              size="full"
              onClick={() => {
                setScreen('lobby');
                setSummary(null);
                setCurrentSessionId('');
              }}
            >
              Back to Lobby
            </BrutalistButton>
          </div>
        )}
      </BrutalistCard>
    </div>
  );

  return (
    <Layout>
      {screen === 'lobby' && renderLobbyScreen()}
      {screen === 'meet' && renderMeetScreen()}
      {screen === 'summary' && renderSummaryScreen()}
      {/* Audio element for TTS - available on all screens */}
      <audio ref={audioPlayerRef} />
    </Layout>
  );
};

export default TestPractice;
