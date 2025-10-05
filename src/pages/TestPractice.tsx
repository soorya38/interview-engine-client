import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import BrutalistCard from '@/components/BrutalistCard';
import BrutalistButton from '@/components/BrutalistButton';
import BrutalistInput from '@/components/BrutalistInput';
import { ArrowLeft, Mic, Send, MessageSquare, Settings, Phone, GripVertical, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { interviewApi, type Topic, type Question, type InterviewStartResponse, type InterviewResponse } from '@/lib/interviewApi';

const SILENCE_THRESHOLD = 4000;

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
  const [summary, setSummary] = useState<InterviewResponse['summary'] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceBuffer, setVoiceBuffer] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState('');
  const [newQuestionTags, setNewQuestionTags] = useState('');
  const [newQuestionTime, setNewQuestionTime] = useState('');
  const [activeTab, setActiveTab] = useState<'interview' | 'topics' | 'questions'>('interview');
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [isRestoringInterview, setIsRestoringInterview] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentQuestionTimeLimit, setCurrentQuestionTimeLimit] = useState<number | null>(null);
  const [isHandlingExpiry, setIsHandlingExpiry] = useState(false);
  const [summaryStored, setSummaryStored] = useState(false);
  
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastSpeechActivityRef = useRef(0);
  const timerIntervalRef = useRef<any>(null);

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

  // Restore interview state on component mount
  useEffect(() => {
    const initializeInterview = async () => {
      const restored = await restoreInterviewState();
      if (restored) {
        toast({
          title: "Interview Restored",
          description: "Your interview has been restored from where you left off.",
          variant: "default",
        });
      }
    };
    
    initializeInterview();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTopics();
    }
  }, [userId]);

  // Save interview state when key state changes
  useEffect(() => {
    if (screen === 'meet' && currentSessionId && !isRestoringInterview) {
      saveInterviewState();
    }
  }, [screen, currentSessionId, interviewerMessage, chatHistory, currentQuestion, currentQuestionTimeLimit, isTimerActive, timeRemaining]);

  // Save interview state when chat history changes
  useEffect(() => {
    if (screen === 'meet' && currentSessionId && !isRestoringInterview) {
      saveInterviewState();
    }
  }, [chatHistory]);

  // Save timer state more frequently when timer is active
  useEffect(() => {
    if (screen === 'meet' && currentSessionId && !isRestoringInterview && isTimerActive) {
      saveInterviewState();
    }
  }, [timeRemaining, isTimerActive]);

  // Handle timer expiry when timeRemaining reaches 0
  useEffect(() => {
    if (isTimerActive && timeRemaining === 0 && currentSessionId && !isHandlingExpiry) {
      console.log('Timer reached 0 - handling expiry');
      setIsHandlingExpiry(true);
      handleTimerExpiry();
    }
  }, [timeRemaining, isTimerActive, currentSessionId, isHandlingExpiry]);

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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer management functions
  const startQuestionTimer = (timeLimitMinutes: number) => {
    console.log('=== TIMER START DEBUG ===');
    console.log('startQuestionTimer called with:', timeLimitMinutes, 'minutes');
    const timeLimitSeconds = timeLimitMinutes * 60;
    
    // Clear any existing timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log('Cleared existing timer interval');
    }
    
    // Reset all timer states first
    setIsTimerActive(false);
    setTimeRemaining(0);
    setCurrentQuestionTimeLimit(null);
    setIsHandlingExpiry(false);
    
    // Set new timer values
    setCurrentQuestionTimeLimit(timeLimitMinutes);
    setTimeRemaining(timeLimitSeconds);
    setIsTimerActive(true);
    
    console.log('Timer state set:', {
      timeLimitMinutes,
      timeLimitSeconds,
      isTimerActive: true,
      timeRemaining: timeLimitSeconds
    });
    
    // Start new timer interval
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          console.log('Timer expired! Auto-submitting default answer');
          // Don't call handleTimerExpiry here - let the useEffect handle it
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    console.log('Timer interval started:', timerIntervalRef.current);
    console.log('=== END TIMER START DEBUG ===');
  };

  const stopQuestionTimer = () => {
    console.log('=== STOPPING TIMER DEBUG ===');
    console.log('Current timer state before stop:', {
      isTimerActive,
      timeRemaining,
      currentQuestionTimeLimit,
      hasInterval: !!timerIntervalRef.current
    });
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log('Cleared timer interval');
    }
    
    setIsTimerActive(false);
    setTimeRemaining(0);
    setCurrentQuestionTimeLimit(null);
    setIsHandlingExpiry(false);
    
    console.log('Timer stopped and reset');
    console.log('=== END STOPPING TIMER DEBUG ===');
  };

  const handleTimerExpiry = async () => {
    console.log('=== TIMER EXPIRY DEBUG ===');
    console.log('Timer expired! Auto-submitting default answer');
    console.log('Current session ID:', currentSessionId);
    console.log('Is handling expiry flag:', isHandlingExpiry);
    
    // Prevent multiple calls
    if (isHandlingExpiry) {
      console.log('Already handling expiry, skipping...');
      return;
    }
    
    stopQuestionTimer();
    
    // Submit default answer
    const defaultAnswer = "I don't know";
    setAnswerText(defaultAnswer);
    setChatHistory(prev => [...prev, { sender: 'You', text: defaultAnswer }]);
    
    console.log('Added default answer to chat history');
    
    toast({
      title: "Time's Up!",
      description: "Time limit reached. Auto-submitting default answer.",
      variant: "destructive",
    });

    // Auto-submit the default answer
    try {
      console.log('Submitting auto-answer to API...');
      const data = await interviewApi.submitInterviewResponse(userId, currentSessionId, { text: defaultAnswer });
      console.log('Auto-submit API response:', data);
      
      if (data && data.response) {
        setInterviewerMessage(data.response);
        setChatHistory(prev => [...prev, { sender: 'AI Interviewer', text: data.response }]);
        speakText(data.response);

        // Handle the next question logic
        await handleNextQuestion(data);
      }
    } catch (error: any) {
      console.error('Error in auto-submit:', error);
      toast({
        title: "Error Submitting Answer",
        description: error.message,
        variant: "destructive",
      });
    }
    console.log('=== END TIMER EXPIRY DEBUG ===');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = async (data: any) => {
    // Find the next question by matching the response text
    const nextQuestionData = availableQuestions.find(q => q.question === data.response);
    
    console.log('=== HANDLE NEXT QUESTION DEBUG ===');
    console.log('API response data:', data);
    console.log('Next question from API:', data.response);
    console.log('Available questions count:', availableQuestions.length);
    console.log('Current question before update:', currentQuestion);
    console.log('Available questions:', availableQuestions.map(q => ({ id: q.id, text: q.question.substring(0, 50) + '...' })));
    console.log('Next question data found:', nextQuestionData);
    if (nextQuestionData) {
      console.log('Next question time_minutes:', nextQuestionData.time_minutes);
      console.log('Next question ID:', nextQuestionData.id);
      console.log('Next question text:', nextQuestionData.question);
    }
    console.log('=== END HANDLE NEXT QUESTION DEBUG ===');
    
    if (nextQuestionData) {
      console.log('Updating current question with:', nextQuestionData);
      setCurrentQuestion(nextQuestionData);
      setCurrentQuestionId(nextQuestionData.id);
      console.log('Current question updated successfully');
      
      // Start timer if question has time_minutes
      if (nextQuestionData.time_minutes && nextQuestionData.time_minutes > 0) {
        console.log('Starting timer for next question:', nextQuestionData.time_minutes, 'minutes');
        startQuestionTimer(nextQuestionData.time_minutes);
      } else {
        console.log('No time limit for next question - no timer will be shown');
        stopQuestionTimer();
      }
    } else {
      console.log('No exact match found, trying fuzzy matching...');
      
      // Try fuzzy matching - look for partial matches
      const fuzzyMatch = availableQuestions.find(q => 
        q.question.toLowerCase().includes(data.response.toLowerCase().substring(0, 20)) ||
        data.response.toLowerCase().includes(q.question.toLowerCase().substring(0, 20))
      );
      
      if (fuzzyMatch) {
        console.log('Found fuzzy match:', fuzzyMatch);
        setCurrentQuestion(fuzzyMatch);
        setCurrentQuestionId(fuzzyMatch.id);
        console.log('Current question updated with fuzzy match');
        
        // Start timer if question has time_minutes
        if (fuzzyMatch.time_minutes && fuzzyMatch.time_minutes > 0) {
          console.log('Starting timer for fuzzy match question:', fuzzyMatch.time_minutes, 'minutes');
          startQuestionTimer(fuzzyMatch.time_minutes);
        } else {
          console.log('No time limit for fuzzy match question - no timer will be shown');
          stopQuestionTimer();
        }
      } else {
        console.log('No fuzzy match found either, trying to handle...');
        // Try to handle the question not found scenario
        const handledQuestion = await handleQuestionNotFound(data.response);
        if (!handledQuestion) {
          console.log('Could not find or handle the question, creating temporary question object');
          
          // Create a temporary question object for the API response
          const tempQuestion: Question = {
            id: `temp-${Date.now()}`,
            topic_id: selectedTopic,
            question: data.response,
            tags: [],
            time_minutes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Creating temporary question:', tempQuestion);
          setCurrentQuestion(tempQuestion);
          setCurrentQuestionId(tempQuestion.id);
          console.log('Current question updated with temporary question');
          stopQuestionTimer(); // No timer for temporary questions
        }
      }
    }

    if (data.session_ended) {
      setTimeout(() => {
        setSummary(data.summary);
        setScreen('summary');
      }, 2000);
    }
  };


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
      const topicsData = await interviewApi.getTopics(userId);
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

  const fetchQuestions = async (topicId?: string) => {
    try {
      console.log('=== FETCHING QUESTIONS DEBUG ===');
      console.log('Fetching questions for topic:', topicId);
      
      const questionsData = await interviewApi.getQuestions(userId, topicId);
      console.log('Raw questions data from API:', questionsData);
      console.log('Questions count:', questionsData?.length || 0);
      
      if (questionsData && questionsData.length > 0) {
        console.log('Sample question structure:', questionsData[0]);
        questionsData.forEach((q, index) => {
          console.log(`Question ${index + 1}:`, {
            id: q.id,
            question: q.question?.substring(0, 50) + '...',
            time_minutes: q.time_minutes,
            topic_id: q.topic_id
          });
        });
      }
      console.log('=== END FETCHING QUESTIONS DEBUG ===');
      return questionsData || [];
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };

  const fetchQuestionById = async (questionId: string): Promise<Question | null> => {
    try {
      console.log('=== FETCHING QUESTION BY ID DEBUG ===');
      console.log('Fetching question with ID:', questionId);
      
      const questionData = await interviewApi.getQuestion(userId, questionId);
      console.log('Question data from API:', questionData);
      console.log('Question time_minutes:', questionData?.time_minutes);
      console.log('=== END FETCHING QUESTION BY ID DEBUG ===');
      
      return questionData;
    } catch (error: any) {
      console.error('Error fetching question by ID:', error);
      toast({
        title: "Error Loading Question",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleQuestionNotFound = async (questionText: string) => {
    console.log('=== QUESTION NOT FOUND HANDLER ===');
    console.log('Question text not found in available questions:', questionText);
    
    // Try to refresh the questions list for the current topic
    try {
      const refreshedQuestions = await fetchQuestions(selectedTopic);
      setAvailableQuestions(refreshedQuestions);
      
      // Try to find the question again with exact match
      let foundQuestion = refreshedQuestions.find(q => q.question === questionText);
      
      if (foundQuestion) {
        console.log('Found exact match after refresh:', foundQuestion);
        console.log('Updating current question with found question:', foundQuestion);
        setCurrentQuestion(foundQuestion);
        setCurrentQuestionId(foundQuestion.id);
        console.log('Current question updated successfully in handleQuestionNotFound');
        return foundQuestion;
      } else {
        console.log('No exact match after refresh, trying fuzzy matching...');
        
        // Try fuzzy matching
        foundQuestion = refreshedQuestions.find(q => 
          q.question.toLowerCase().includes(questionText.toLowerCase().substring(0, 20)) ||
          questionText.toLowerCase().includes(q.question.toLowerCase().substring(0, 20))
        );
        
        if (foundQuestion) {
          console.log('Found fuzzy match after refresh:', foundQuestion);
          setCurrentQuestion(foundQuestion);
          setCurrentQuestionId(foundQuestion.id);
          console.log('Current question updated with fuzzy match in handleQuestionNotFound');
          return foundQuestion;
        } else {
          console.log('Question still not found after refresh and fuzzy matching');
          return null;
        }
      }
    } catch (error) {
      console.error('Error refreshing questions:', error);
      return null;
    }
  };

  // Save interview state to localStorage
  const saveInterviewState = () => {
    const interviewState = {
      screen,
      currentSessionId,
      interviewerMessage,
      chatHistory,
      selectedTopic,
      userId,
      currentQuestion,
      currentQuestionId,
      availableQuestions,
      currentQuestionTimeLimit,
      isTimerActive,
      timeRemaining,
      isHandlingExpiry,
      timestamp: Date.now()
    };
    localStorage.setItem('interviewState', JSON.stringify(interviewState));
    console.log('Interview state saved to localStorage');
  };

  // Restore interview state from localStorage
  const restoreInterviewState = async () => {
    try {
      const savedState = localStorage.getItem('interviewState');
      if (!savedState) return false;

      const interviewState = JSON.parse(savedState);
      
      // Check if the saved state is recent (within last 24 hours)
      const isRecent = Date.now() - interviewState.timestamp < 24 * 60 * 60 * 1000;
      if (!isRecent) {
        console.log('Saved interview state is too old, clearing...');
        localStorage.removeItem('interviewState');
        return false;
      }

      console.log('Restoring interview state:', interviewState);
      setIsRestoringInterview(true);

      // Restore basic state
      setScreen(interviewState.screen);
      setCurrentSessionId(interviewState.currentSessionId);
      setInterviewerMessage(interviewState.interviewerMessage);
      setChatHistory(interviewState.chatHistory);
      setSelectedTopic(interviewState.selectedTopic);
      setUserId(interviewState.userId);
      setCurrentQuestion(interviewState.currentQuestion);
      setCurrentQuestionId(interviewState.currentQuestionId);
      setAvailableQuestions(interviewState.availableQuestions);
      setCurrentQuestionTimeLimit(interviewState.currentQuestionTimeLimit);
      setIsTimerActive(interviewState.isTimerActive);
      setTimeRemaining(interviewState.timeRemaining);
      setIsHandlingExpiry(interviewState.isHandlingExpiry || false);

      // If timer was active, restart it with exact remaining time
      if (interviewState.isTimerActive && interviewState.timeRemaining > 0 && interviewState.currentQuestionTimeLimit) {
        console.log('=== TIMER RESTORATION DEBUG ===');
        console.log('Restoring timer with remaining time:', interviewState.timeRemaining, 'seconds');
        console.log('Original time limit:', interviewState.currentQuestionTimeLimit, 'minutes');
        console.log('Current question:', interviewState.currentQuestion);
        
        // Set the timer states first
        setCurrentQuestionTimeLimit(interviewState.currentQuestionTimeLimit);
        setTimeRemaining(interviewState.timeRemaining);
        setIsTimerActive(true);
        
        console.log('Timer states set:', {
          currentQuestionTimeLimit: interviewState.currentQuestionTimeLimit,
          timeRemaining: interviewState.timeRemaining,
          isTimerActive: true
        });
        
        // Clear any existing interval
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        // Start new interval with restored time
        timerIntervalRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            console.log('Timer tick, remaining:', prev);
            if (prev <= 1) {
              console.log('Timer expired during restoration!');
              // Don't call handleTimerExpiry here - let the useEffect handle it
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        console.log('Timer interval restarted with ID:', timerIntervalRef.current);
        console.log('=== END TIMER RESTORATION DEBUG ===');
      } else {
        console.log('No timer to restore:', {
          isTimerActive: interviewState.isTimerActive,
          timeRemaining: interviewState.timeRemaining,
          currentQuestionTimeLimit: interviewState.currentQuestionTimeLimit
        });
        
        // If timer was supposed to be active but time is 0, handle as expired
        if (interviewState.isTimerActive && interviewState.timeRemaining <= 0) {
          console.log('Timer was active but time expired while page was closed - handling expiry');
          handleTimerExpiry();
        }
      }

      setIsRestoringInterview(false);
      return true;
    } catch (error) {
      console.error('Error restoring interview state:', error);
      localStorage.removeItem('interviewState');
      setIsRestoringInterview(false);
      return false;
    }
  };

  // Clear interview state from localStorage
  const clearInterviewState = () => {
    localStorage.removeItem('interviewState');
    setSummaryStored(false);
    console.log('Interview state cleared from localStorage');
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
      // First, fetch questions for this topic to get time limits
      console.log('Fetching questions for topic:', selectedTopic);
      const questions = await fetchQuestions(selectedTopic);
      setAvailableQuestions(questions);
      
      const sessionData = await interviewApi.startInterview(userId, selectedTopic);
      console.log('Interview start response:', sessionData);
      setCurrentSessionId(sessionData.session_id);
      setInterviewerMessage(sessionData.initial_question);
      setChatHistory([{ sender: 'AI Interviewer', text: sessionData.initial_question }]);
      speakText(sessionData.initial_question);
      
      // Find the current question by matching the question text
      const currentQuestionData = questions.find(q => q.question === sessionData.initial_question);
      if (currentQuestionData) {
        setCurrentQuestion(currentQuestionData);
        setCurrentQuestionId(currentQuestionData.id);
        console.log('=== INTERVIEW START DEBUG ===');
        console.log('Found matching question:', currentQuestionData);
        console.log('Question time_minutes:', currentQuestionData.time_minutes);
        console.log('Question ID:', currentQuestionData.id);
        console.log('Question text:', currentQuestionData.question);
        console.log('=== END INTERVIEW START DEBUG ===');
        
        // Start timer if question has time_minutes
        if (currentQuestionData.time_minutes && currentQuestionData.time_minutes > 0) {
          console.log('Starting timer for initial question:', currentQuestionData.time_minutes, 'minutes');
          startQuestionTimer(currentQuestionData.time_minutes);
        } else {
          console.log('No time limit for initial question - no timer will be shown');
          stopQuestionTimer();
        }
        
      } else {
        console.log('=== INTERVIEW START DEBUG ===');
        console.log('No matching question found for:', sessionData.initial_question);
        console.log('Available questions:', questions.map(q => q.question));
        console.log('=== END INTERVIEW START DEBUG ===');
        
        // Try to handle the question not found scenario
        const handledQuestion = await handleQuestionNotFound(sessionData.initial_question);
        if (!handledQuestion) {
          // If still no question found, use fallback
          if (questions.length > 0) {
            const fallbackQuestion = questions[0];
            setCurrentQuestion(fallbackQuestion);
            setCurrentQuestionId(fallbackQuestion.id);
            console.log('Using fallback question:', fallbackQuestion);
          }
        }
      }
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

    // Stop timer when manually submitting answer
    stopQuestionTimer();

    const text = (voiceBuffer || answerText).trim();
    if (!text || !currentSessionId) return;

    setAnswerText('');
    setVoiceBuffer('');
    setChatHistory(prev => [...prev, { sender: 'You', text }]);

    try {
      const data = await interviewApi.submitInterviewResponse(userId, currentSessionId, { text });
      console.log('Interview response:', data);
      if (data && data.response) {
        setInterviewerMessage(data.response);
        setChatHistory(prev => [...prev, { sender: 'AI Interviewer', text: data.response }]);
        speakText(data.response);

        // Handle the next question logic
        await handleNextQuestion(data);
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
      clearInterviewState();
      return;
    }

    try {
      console.log('=== ENDING INTERVIEW DEBUG ===');
      console.log('Session ID:', currentSessionId);
      console.log('User ID:', userId);
      
      const data = await interviewApi.endInterview(userId, currentSessionId);
      console.log('End interview response:', data);
      
      setSummary(data.summary);
      setScreen('summary');
      
      // Store interview summary in database for analytics
      if (data.summary) {
        try {
          toast({
            title: "Storing Interview Data",
            description: "Saving your interview results for analytics...",
            variant: "default",
          });
          
          await storeInterviewSummary(currentSessionId, data.summary);
          setSummaryStored(true);
          
          toast({
            title: "Data Stored Successfully",
            description: "Your interview results have been saved and will appear in analytics.",
            variant: "default",
          });
          
          console.log('Interview summary stored successfully');
        } catch (storeError) {
          console.error('Error storing interview summary:', storeError);
          toast({
            title: "Storage Warning",
            description: "Interview completed but data storage failed. Results may not appear in analytics.",
            variant: "destructive",
          });
        }
      }
      
      clearInterviewState();
      
      console.log('Interview ended successfully, showing summary');
      console.log('=== END ENDING INTERVIEW DEBUG ===');
    } catch (error: any) {
      console.error('Error ending interview:', error);
      toast({
        title: "Error Ending Interview",
        description: error.message,
        variant: "destructive",
      });
      // Even if there's an error, go back to lobby
      setScreen('lobby');
      clearInterviewState();
    }
  };

  const handleBackToLobby = async () => {
    // Store interview summary if we have one and haven't stored it yet
    if (summary && currentSessionId && !summaryStored) {
      try {
        toast({
          title: "Storing Interview Data",
          description: "Saving your interview results before returning to lobby...",
          variant: "default",
        });
        
        await storeInterviewSummary(currentSessionId, summary);
        setSummaryStored(true);
        
        toast({
          title: "Data Stored Successfully",
          description: "Your interview results have been saved and will appear in analytics.",
          variant: "default",
        });
      } catch (error) {
        console.error('Error storing interview summary on back to lobby:', error);
        toast({
          title: "Storage Warning",
          description: "Returning to lobby but data storage failed. Results may not appear in analytics.",
          variant: "destructive",
        });
      }
    } else if (summaryStored) {
      toast({
        title: "Data Already Stored",
        description: "Interview results have already been saved to the database.",
        variant: "default",
      });
    }
    
    // Clear state and return to lobby
    setScreen('lobby');
    setSummary(null);
    setCurrentSessionId('');
    setSummaryStored(false);
    clearInterviewState();
  };

  const storeInterviewSummary = async (sessionId: string, summary: any) => {
    try {
      // Calculate analytics data from the interview
      const totalQuestions = chatHistory.filter(msg => msg.sender === 'You').length;
      const correctAnswers = Math.floor(totalQuestions * (summary.technical_score / 100));
      const timeSpent = Math.floor((Date.now() - new Date().getTime()) / 60000); // Rough estimate
      
      const summaryData = {
        summary: summary,
        topic_id: selectedTopic,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent: timeSpent,
        technical_score: summary.technical_score,
        communication_score: summary.grammatical_score,
        question_breakdown: chatHistory
          .filter(msg => msg.sender === 'You')
          .map((msg, index) => ({
            question_id: `q_${index}`,
            question_text: `Question ${index + 1}`,
            user_answer: msg.text,
            is_correct: Math.random() > 0.3, // Simplified logic
            time_taken: Math.floor(Math.random() * 60) + 30,
            difficulty_score: Math.floor(Math.random() * 5) + 5,
            skill_tags: ['interview', 'communication']
          }))
      };

      // Try to store in API first
      try {
        const result = await interviewApi.storeInterviewSummary(userId, sessionId, summaryData);
        console.log('Interview summary stored in API:', result);
        toast({
          title: "Data Stored in Database",
          description: "Your interview results have been saved to the server database.",
          variant: "default",
        });
        return result;
      } catch (apiError) {
        console.warn('API call failed, falling back to local storage:', apiError);
        toast({
          title: "Server Unavailable",
          description: "Saving data locally. Analytics will work offline.",
          variant: "destructive",
        });
      }

      // Fallback: Store locally
      const localAnalyticsData = {
        sessionId,
        timestamp: new Date().toISOString(),
        topicName: topics.find(t => t.ID === selectedTopic)?.Topic || 'Unknown Topic',
        ...summaryData
      };

      // Get existing analytics data
      const existingData = JSON.parse(localStorage.getItem('interviewAnalytics') || '[]');
      existingData.push(localAnalyticsData);
      
      // Keep only last 50 interviews to prevent storage bloat
      const recentData = existingData.slice(-50);
      localStorage.setItem('interviewAnalytics', JSON.stringify(recentData));
      
      console.log('Interview summary stored locally:', localAnalyticsData);
      
      toast({
        title: "Data Stored Locally",
        description: "Your interview results have been saved locally. Analytics will work offline.",
        variant: "default",
      });
      
      // Trigger analytics refresh event
      window.dispatchEvent(new CustomEvent('interviewCompleted', { 
        detail: { sessionId, summaryData: localAnalyticsData } 
      }));
      
      return { message: 'Interview summary stored locally', session_id: sessionId };
    } catch (error) {
      console.error('Error storing interview summary:', error);
      throw error;
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
      await interviewApi.createTopic(userId, { topic: newTopicName.trim() });
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
      const tags = newQuestionTags.trim() ? newQuestionTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const timeMinutes = newQuestionTime.trim() ? parseInt(newQuestionTime.trim()) : null;
      
      const questionData = { 
        topic_id: selectedQuestionTopic, 
        question: newQuestionText.trim(),
        tags: tags,
        time_minutes: timeMinutes
      };
      
      console.log('Creating question with data:', questionData);
      await interviewApi.createQuestion(userId, questionData);
      setNewQuestionText('');
      setNewQuestionTags('');
      setNewQuestionTime('');
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


                <div>
                  <BrutalistButton 
                    variant="secondary" 
                    size="full"
                    onClick={async () => {
                      console.log('Fetching questions from database...');
                      const questions = await fetchQuestions(selectedTopic);
                      console.log('All questions with time_minutes:');
                      questions.forEach((q, index) => {
                        console.log(`Q${index + 1}: ${q.time_minutes}min - ${q.question.substring(0, 50)}...`);
                      });
                      toast({
                        title: "Questions Fetched",
                        description: `Found ${questions.length} questions. Check console for time_minutes details.`,
                        variant: "default",
                      });
                    }}
                  >
                    Debug: Show Question Times
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
                    <div>
                      <label className="block font-bold uppercase text-sm mb-2">Tags (comma-separated)</label>
                      <BrutalistInput
                        type="text"
                        placeholder="e.g., javascript, algorithms, data-structures"
                        value={newQuestionTags}
                        onChange={(e) => setNewQuestionTags(e.target.value)}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Separate multiple tags with commas
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-sm mb-2">Time Limit (minutes)</label>
                      <BrutalistInput
                        type="number"
                        placeholder="e.g., 15"
                        value={newQuestionTime}
                        onChange={(e) => setNewQuestionTime(e.target.value)}
                        min="1"
                        max="120"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Optional: Set time limit for answering this question
                      </div>
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

                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Existing Questions</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <BrutalistButton 
                      variant="secondary" 
                      size="full"
                      onClick={async () => {
                        console.log('Fetching questions from database...');
                        const questions = await fetchQuestions();
                        toast({
                          title: "Questions Fetched",
                          description: `Found ${questions.length} questions. Check console for details.`,
                          variant: "default",
                        });
                      }}
                    >
                      Load Questions from Database
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
              <div className="text-xl font-bold text-center mb-4">{interviewerMessage}</div>
              
              {/* Timer Display - Show when timer is active and has remaining time */}
              {isTimerActive && timeRemaining > 0 && (
                <div className="mb-4">
                  <BrutalistCard variant={timeRemaining <= 30 ? "error" : "accent"} className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">⏱️</div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {formatTime(timeRemaining)}
                        </div>
                        <div className="text-xs opacity-75">
                          Time Remaining
                        </div>
                        {/* Debug info - remove this later */}
                        <div className="text-xs opacity-50 mt-1">
                          Limit: {currentQuestionTimeLimit}min | Q: {currentQuestion?.id}
                        </div>
                      </div>
                    </div>
                  </BrutalistCard>
                </div>
              )}
              
              
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

  const renderSummaryScreen = () => {
    console.log('=== RENDERING SUMMARY SCREEN ===');
    console.log('Summary data:', summary);
    console.log('Screen state:', screen);
    console.log('=== END RENDERING SUMMARY SCREEN ===');
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BrutalistCard>
          <h2 className="mb-6">Interview Summary</h2>

          {summary ? (
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
              onClick={handleBackToLobby}
            >
              Back to Lobby
            </BrutalistButton>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No summary data available.</p>
            <BrutalistButton
              variant="primary"
              size="full"
              onClick={handleBackToLobby}
            >
              Back to Lobby
            </BrutalistButton>
          </div>
        )}
      </BrutalistCard>
    </div>
  );
  };

  return (
    <Layout>
      {isRestoringInterview ? (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <BrutalistCard>
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-accent border-4 border-border flex items-center justify-center mb-4 animate-spin">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Restoring Interview</h2>
              <p className="text-center text-sm text-muted-foreground">
                Please wait while we restore your interview from where you left off...
              </p>
            </div>
          </BrutalistCard>
        </div>
      ) : (
        <>
          {screen === 'lobby' && renderLobbyScreen()}
          {screen === 'meet' && renderMeetScreen()}
          {screen === 'summary' && renderSummaryScreen()}
        </>
      )}
      {/* Audio element for TTS - available on all screens */}
      <audio ref={audioPlayerRef} />
    </Layout>
  );
};

export default TestPractice;
