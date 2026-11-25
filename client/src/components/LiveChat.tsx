import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles, ArrowRight, Lightbulb, AlertTriangle, Volume2, VolumeX, Mic, MicOff, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import {
  createSpeechOutput,
  createSpeechRecognition,
  disposeSpeechRecognition,
  trySpeechOperation,
  type SpeechOutput,
  type SpeechRecognition,
} from '@/lib/speech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  isProactive?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface QuickAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

interface UserProfile {
  name: string;
  role: string;
  department?: string;
  recentActivity?: string[];
  complianceScore?: number;
  pendingTasks?: number;
}

interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

// Voice command shortcuts for hands-free navigation
const voiceCommands: Record<string, { action: string; response: string; path?: string }> = {
  'go to dashboard': { action: 'navigate', path: '/dashboard', response: 'Navigating to Dashboard.' },
  'show dashboard': { action: 'navigate', path: '/dashboard', response: 'Opening Dashboard.' },
  'open dashboard': { action: 'navigate', path: '/dashboard', response: 'Opening Dashboard.' },
  'go to policies': { action: 'navigate', path: '/policies', response: 'Navigating to Policies.' },
  'show policies': { action: 'navigate', path: '/policies', response: 'Opening Policies page.' },
  'open policies': { action: 'navigate', path: '/policies', response: 'Opening Policies page.' },
  'go to compliance': { action: 'navigate', path: '/compliance', response: 'Navigating to Compliance Monitoring.' },
  'show compliance': { action: 'navigate', path: '/compliance', response: 'Opening Compliance page.' },
  'check compliance': { action: 'navigate', path: '/compliance', response: 'Opening Compliance Monitoring.' },
  'go to reports': { action: 'navigate', path: '/reports', response: 'Navigating to Reports.' },
  'show reports': { action: 'navigate', path: '/reports', response: 'Opening Reports page.' },
  'generate report': { action: 'navigate', path: '/reports', response: 'Opening Reports page to generate a report.' },
  'go to executive summary': { action: 'navigate', path: '/executive-summary', response: 'Navigating to Executive Summary.' },
  'show executive summary': { action: 'navigate', path: '/executive-summary', response: 'Opening Executive Summary.' },
  'go to delegation': { action: 'navigate', path: '/delegation', response: 'Navigating to Delegation of Authority.' },
  'show delegations': { action: 'navigate', path: '/delegation', response: 'Opening Delegation of Authority.' },
  'go to regulatory updates': { action: 'navigate', path: '/regulatory-updates', response: 'Navigating to Regulatory Updates.' },
  'show regulatory updates': { action: 'navigate', path: '/regulatory-updates', response: 'Opening Regulatory Updates.' },
  'check regulations': { action: 'navigate', path: '/regulatory-updates', response: 'Opening Regulatory Updates.' },
  'go to timeline': { action: 'navigate', path: '/regulatory-timeline', response: 'Navigating to Regulatory Timeline.' },
  'show timeline': { action: 'navigate', path: '/regulatory-timeline', response: 'Opening Regulatory Timeline.' },
  'go to audit trail': { action: 'navigate', path: '/audit-trail', response: 'Navigating to Audit Trail.' },
  'show audit trail': { action: 'navigate', path: '/audit-trail', response: 'Opening Audit Trail.' },
  'go to ai recommendations': { action: 'navigate', path: '/ai-recommendations', response: 'Navigating to AI Recommendations.' },
  'show recommendations': { action: 'navigate', path: '/ai-recommendations', response: 'Opening AI Recommendations.' },
  'go home': { action: 'navigate', path: '/', response: 'Navigating to Home page.' },
  'go to home': { action: 'navigate', path: '/', response: 'Navigating to Home page.' },
  'export pdf': { action: 'export', response: 'I\'ll help you export a PDF. Please go to Reports or Executive Summary to export.' },
  'help': { action: 'help', response: 'Available voice commands: "Go to [page name]" to navigate, "Show [feature]" to open features. Try saying "Go to compliance" or "Show reports".' },
  'what can you do': { action: 'help', response: 'I can help you navigate using voice commands. Say "Go to dashboard", "Show compliance", "Check regulations", or "Generate report". I can also answer questions about RegulaSync.' },
};

const botResponses: Record<string, string> = {
  'hello': 'Hello! Welcome to RegulaSync. How can I help you today?',
  'hi': 'Hi there! I\'m here to help you with any questions about RegulaSync.',
  'demo': 'I\'d be happy to help you explore our demo! You can access the full platform demo by clicking "Start Demo" on the landing page. Would you like me to guide you through specific features?',
  'pricing': 'Proposed Q2 2027 pricing is £90 per user/month for Core, £175 per user/month for Professional, and £350 per user/month for Enterprise. Early-access availability, any trial and commercial terms must be confirmed in writing. This pre-launch prototype is not an activated paid-service offer. Would you like more details?',
  'features': 'The RegulaSync prototype demonstrates AI-assisted policy analysis, regulatory monitoring, compliance alerts, delegation of authority management and audit-log workflows. Production capabilities and integrations are subject to validation. Which feature would you like to explore?',
  'compliance': 'The prototype illustrates comparing policies with UK regulatory requirements (FCA, PRA, ICO) and suggesting updates. Sample scores and alerts are not a legal assessment or assurance of compliance; regulatory coverage and production monitoring require validation and human review.',
  'contact': 'You can reach our team at bhousen@regulasync.co.uk to discuss a demo or proposed early access for Q2 2027.',
  'regulations': 'RegulaSync proposes coverage of UK regulatory bodies including FCA, PRA, ICO and Bank of England. The prototype illustrates regulatory-update and policy-matching workflows; live feeds, coverage and matching accuracy must be validated before production use.',
  'security': 'This is an assessment prototype, not evidence of production security assurance. Hosting, encryption, access controls and any certification status must be verified before production use. Please see the Security page for the current qualification of security claims.',
  'policy': 'I can help you with policy management! You can create new policies, review existing ones, or use our AI to generate policy drafts. What would you like to do?',
  'delegation': 'Delegation of Authority helps you manage who can approve what. You can set spending limits, approval chains, and track all delegations in one place.',
  'report': 'The prototype demonstrates Executive Summaries, Compliance Reports and Custom Reports, with PDF export workflows. Sample outputs are illustrative, require human review and do not provide audit or regulatory assurance.',
  'audit': 'The prototype demonstrates audit-log workflows for policy updates, delegations, compliance events and user actions. Sample records do not establish complete event coverage, immutability or suitability as regulatory evidence; production controls and assurance require validation.',
  'help': 'I\'m here to help! I can assist with: navigating the platform, understanding features, compliance questions, or connecting you with our team.',
  'default': 'Thank you for your question. Let me help you with that. You can also explore our Help Center or contact our team for personalized assistance.'
};

// Context-aware suggestions based on current page and user role
const getPageContextSuggestions = (pathname: string, userProfile: UserProfile) => {
  const isAdmin = userProfile.role === 'admin';
  const isCompliance = userProfile.department?.toLowerCase().includes('compliance');
  
  const pageContexts: Record<string, { message: string; suggestions: string[] }> = {
    '/dashboard': {
      message: `Welcome back, ${userProfile.name.split(' ')[0]}! ${userProfile.pendingTasks && userProfile.pendingTasks > 0 ? `This sample profile shows ${userProfile.pendingTasks} pending tasks.` : 'Here\'s what you can do:'}`,
      suggestions: isAdmin 
        ? ['Review team compliance', 'Check pending approvals', 'View system alerts', 'Generate executive report']
        : ['Review your tasks', 'Check compliance status', 'View AI recommendations', 'Update your policies']
    },
    '/policies': {
      message: `Policy Management - ${isAdmin ? 'You can manage all organizational policies here.' : 'View and manage your department\'s policies.'}`,
      suggestions: isAdmin
        ? ['Create organization policy', 'Review pending approvals', 'Bulk update policies', 'Export all policies']
        : ['Create new policy', 'Review my policies', 'Request policy change', 'View policy history']
    },
    '/compliance': {
      message: `Compliance Overview - ${userProfile.complianceScore ? `The illustrative sample score is ${userProfile.complianceScore}%, not an assessment of your compliance.` : 'Explore compliance-monitoring workflows here.'}`,
      suggestions: isCompliance
        ? ['Run compliance audit', 'Generate compliance report', 'Review all departments', 'Set compliance targets']
        : ['Check my compliance', 'View department score', 'See improvement tips', 'Report compliance issue']
    },
    '/regulatory-updates': {
      message: 'Stay informed about regulatory changes that affect your organization.',
      suggestions: ['Filter by my areas', 'View critical updates', 'Check policy impact', 'Subscribe to alerts']
    },
    '/delegation': {
      message: isAdmin ? 'Manage delegation of authority across your organization.' : 'View and request delegations.',
      suggestions: isAdmin
        ? ['Create delegation', 'Review all delegations', 'Check expiring soon', 'Audit delegation usage']
        : ['Request delegation', 'View my delegations', 'Check my limits', 'Delegation history']
    },
    '/reports': {
      message: 'Generate and view compliance reports.',
      suggestions: ['Create custom report', 'Export to PDF', 'Schedule report', 'View saved reports']
    },
    '/executive-summary': {
      message: 'Executive Overview - Key metrics and insights for leadership.',
      suggestions: ['Export as PDF', 'Share with board', 'View trends', 'Compare periods']
    },
    '/regulatory-timeline': {
      message: 'Track important regulatory deadlines and milestones.',
      suggestions: ['View this month', 'Set reminders', 'Filter by priority', 'Export calendar']
    },
    '/audit-trail': {
      message: isAdmin ? 'Explore prototype audit-log workflows; complete event coverage and audit assurance are not established.' : 'Explore the prototype activity-history view.',
      suggestions: isAdmin
        ? ['Search all logs', 'Export audit report', 'Filter by user', 'Compliance audit']
        : ['View my activity', 'Recent changes', 'Export my logs', 'Activity summary']
    },
    '/ai-recommendations': {
      message: 'AI-powered insights tailored to your compliance needs.',
      suggestions: ['View priority items', 'Implement suggestion', 'Dismiss recommendation', 'Request analysis']
    },
    'default': {
      message: `Hello ${userProfile.name.split(' ')[0]}! How can I assist you today?`,
      suggestions: ['Explore features', 'Check compliance', 'View reports', 'Get help']
    }
  };

  // Check for exact match first
  if (pageContexts[pathname]) {
    return pageContexts[pathname];
  }
  
  // Check for partial match
  for (const [path, context] of Object.entries(pageContexts)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return context;
    }
  }
  
  return pageContexts.default;
};

// Proactive alerts based on user context
const getProactiveAlerts = (userProfile: UserProfile): Message[] => {
  const alerts: Message[] = [];
  
  // Check compliance score
  if (userProfile.complianceScore && userProfile.complianceScore < 90) {
    alerts.push({
      id: 'alert-compliance',
      text: `⚠️ This sample profile shows an illustrative compliance score of ${userProfile.complianceScore}%, not a verified assessment. Explore example improvement areas.`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Show improvement areas', 'Generate action plan', 'View detailed breakdown'],
      isProactive: true,
      priority: userProfile.complianceScore < 80 ? 'high' : 'medium'
    });
  }
  
  // Check pending tasks
  if (userProfile.pendingTasks && userProfile.pendingTasks > 5) {
    alerts.push({
      id: 'alert-tasks',
      text: `📋 This sample profile shows ${userProfile.pendingTasks} pending tasks. Would you like to explore task-prioritization workflows?`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Prioritize tasks', 'View all tasks', 'Delegate tasks'],
      isProactive: true,
      priority: 'medium'
    });
  }
  
  return alerts;
};

function getBotResponse(message: string, userProfile: UserProfile): { text: string; suggestions?: string[] } {
  const lowerMessage = message.toLowerCase();
  const firstName = userProfile.name.split(' ')[0];
  
  // Personalized responses
  if (lowerMessage.includes('my compliance') || lowerMessage.includes('my score')) {
    return {
      text: `${firstName}, this sample profile shows an illustrative score of ${userProfile.complianceScore || 94}%, not a verified assessment of your compliance. ${userProfile.complianceScore && userProfile.complianceScore >= 90 ? 'Explore the example score breakdown.' : 'Explore example improvement areas.'}`,
      suggestions: ['View breakdown', 'Improvement tips', 'Compare to target']
    };
  }
  
  if (lowerMessage.includes('my tasks') || lowerMessage.includes('pending')) {
    return {
      text: `This sample profile shows ${userProfile.pendingTasks || 12} pending tasks, with example policy-review and compliance-update priorities. These are prototype examples, not verified tasks for your organisation.`,
      suggestions: ['Show urgent tasks', 'View all tasks', 'Mark complete']
    };
  }
  
  for (const [keyword, response] of Object.entries(botResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return { text: response };
    }
  }
  
  return { text: botResponses.default };
}

export default function LiveChat() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasShownProactive, setHasShownProactive] = useState(false);
  const [showProactivePopup, setShowProactivePopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Voice state
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoSpeak: false,
    voice: null,
    rate: 1,
    pitch: 1
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechOutputRef = useRef<SpeechOutput | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);

  // Create user profile - always use Demo User in production mode
  const savedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  const userProfile: UserProfile = {
    name: savedUserName || 'Demo User',
    role: 'user',
    department: 'Compliance',
    complianceScore: 94,
    pendingTasks: 12,
    recentActivity: ['Reviewed AML Policy', 'Updated delegation limits', 'Generated Q4 report']
  };

  // Initialize speech synthesis voices
  useEffect(() => {
    const output = createSpeechOutput();
    speechOutputRef.current = output;
    setCanSpeak(!!output);
    if (!output) return;

    const loadVoices = () => {
      if (speechOutputRef.current !== output) return;
      const voices = output.getVoices();
      setAvailableVoices(voices);
      // Prefer UK English voice
      const ukVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
      if (ukVoice) {
        setVoiceSettings(prev => prev.voice ? prev : { ...prev, voice: ukVoice });
      }
    };
    
    loadVoices();
    const unsubscribe = output.subscribeVoices(loadVoices);
    
    return () => {
      speechOutputRef.current = null;
      unsubscribe();
      output.cancel();
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    setCanListen(false);
    const recognition = createSpeechRecognition();
    if (!recognition) return;
    const initialized = trySpeechOperation(() => {
      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition) return;
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);
        
        // If final result, submit
        if (event.results[0].isFinal) {
          setIsListening(false);
        }
      };
      
      recognition.onerror = (event) => {
        if (recognitionRef.current !== recognition) return;
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return;
        setIsListening(false);
      };
    });
    if (!initialized) {
      disposeSpeechRecognition(recognition);
      return;
    }
    recognitionRef.current = recognition;
    setCanListen(true);
    
    return () => {
      recognitionRef.current = null;
      disposeSpeechRecognition(recognition);
    };
  }, []);

  // Text-to-speech function
  const speak = useCallback((text: string) => {
    const output = speechOutputRef.current;
    if (!output || !voiceSettings.enabled || !text) return;
    setIsSpeaking(false);
    const started = output.speak(text, {
      voice: voiceSettings.voice,
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
    if (!started) {
      output.cancel();
      speechOutputRef.current = null;
      setIsSpeaking(false);
      setCanSpeak(false);
    }
  }, [voiceSettings]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    const output = speechOutputRef.current;
    if (output && !output.cancel()) {
      speechOutputRef.current = null;
      setCanSpeak(false);
    }
    setIsSpeaking(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    // Stop any ongoing speech first
    if (!isListening) stopSpeaking();
    const succeeded = trySpeechOperation(() => {
      if (isListening) recognition.stop();
      else recognition.start();
    });
    setIsListening(succeeded && !isListening);
    if (!succeeded) {
      recognitionRef.current = null;
      disposeSpeechRecognition(recognition);
      setCanListen(false);
    }
  }, [isListening, stopSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show proactive popup after 5 seconds on the page
  useEffect(() => {
    if (!hasShownProactive && !isOpen) {
      proactiveTimerRef.current = setTimeout(() => {
        setShowProactivePopup(true);
        setHasShownProactive(true);
      }, 5000);
    }

    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }, [hasShownProactive, isOpen]);

  // Update quick actions based on current page and user profile
  useEffect(() => {
    const context = getPageContextSuggestions(location, userProfile);
    setQuickActions(context.suggestions.slice(0, 4).map(s => ({ label: s, action: s })));
  }, [location, userProfile.role]);

  // Initialize chat with context-aware welcome message and proactive alerts
  const initializeChat = () => {
    const context = getPageContextSuggestions(location, userProfile);
    const proactiveAlerts = getProactiveAlerts(userProfile);
    
    const welcomeMessage = `Hello, ${userProfile.name.split(' ')[0]}! ${context.message} This is a pre-launch prototype; profile scores and tasks are sample data, and AI outputs require human review.`;
    
    const initialMessages: Message[] = [
      {
        id: '1',
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: context.suggestions
      }
    ];
    
    // Add proactive alerts if any
    if (proactiveAlerts.length > 0) {
      initialMessages.push(...proactiveAlerts);
    }
    
    setMessages(initialMessages);
    
    // Speak welcome message if auto-speak is enabled
    if (voiceSettings.autoSpeak) {
      setTimeout(() => speak(welcomeMessage), 500);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowProactivePopup(false);
    if (messages.length === 0) {
      initializeChat();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Generate response
    setTimeout(() => {
      const response = getBotResponse(suggestion, userProfile);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Auto-speak response
      if (voiceSettings.autoSpeak) {
        speak(response.text);
      }
    }, 800 + Math.random() * 500);
  };

  const aiChatMutation = trpc.aiChat.chat.useMutation();

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue.toLowerCase().trim();
    setInputValue('');
    
    // Check for voice commands first
    const matchedCommand = Object.entries(voiceCommands).find(([cmd]) => 
      messageText.includes(cmd) || messageText === cmd
    );
    
    if (matchedCommand) {
      const [, command] = matchedCommand;
      setIsTyping(true);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: command.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: ['Help', 'Go to dashboard', 'Show compliance']
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Speak the response
        if (voiceSettings.enabled) {
          speak(command.response);
        }
        
        // Execute navigation if applicable
        if (command.action === 'navigate' && command.path) {
          setTimeout(() => {
            setLocation(command.path!);
          }, 1000);
        }
      }, 500);
      return;
    }
    
    setIsTyping(true);

    // Build conversation history for context
    const conversationHistory = messages
      .filter(m => !m.isProactive)
      .map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text
      }));

    try {
      // Call real LLM backend
      const result = await aiChatMutation.mutateAsync({
        message: messageText,
        context: {
          currentPage: location,
          userRole: userProfile.role,
          pendingTasks: userProfile.pendingTasks,
          complianceScore: userProfile.complianceScore,
        },
        conversationHistory,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: getContextSuggestions(messageText)
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak response
      if (voiceSettings.autoSpeak) {
        speak(result.response);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      // Fallback to local response
      const response = getBotResponse(messageText, userProfile);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (voiceSettings.autoSpeak) {
        speak(response.text);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Get context-aware suggestions based on user message
  const getContextSuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
      return ['Create new policy', 'View all policies', 'AI policy draft'];
    }
    if (lowerMessage.includes('compliance') || lowerMessage.includes('compliant')) {
      return ['View compliance score', 'Check pending reviews', 'Generate report'];
    }
    if (lowerMessage.includes('report')) {
      return ['Executive summary', 'Custom report', 'Export PDF'];
    }
    if (lowerMessage.includes('regulation') || lowerMessage.includes('fca') || lowerMessage.includes('pra')) {
      return ['View regulatory updates', 'Check timeline', 'Set alerts'];
    }
    return ['View dashboard', 'Check compliance', 'Generate report'];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get proactive message based on page and user
  const getProactiveMessage = () => {
    const firstName = userProfile.name.split(' ')[0];
    
    if (location.includes('/compliance') && userProfile.complianceScore && userProfile.complianceScore < 95) {
      return `Hi ${firstName}! Want to explore example improvement tips for the prototype's sample compliance score?`;
    }
    
    if (location.includes('/policies')) {
      return `Hi ${firstName}! Need help managing policies? I can assist with creation, review, or AI drafting.`;
    }
    
    if (location.includes('/dashboard')) {
      return `Hi ${firstName}! I can help you navigate the dashboard and prioritize your tasks.`;
    }
    
    return `Hi ${firstName}! Need help navigating RegulaSync? I'm here to assist.`;
  };

  if (!isOpen) {
    return (
      <>
        {/* Proactive popup */}
        {showProactivePopup && (
          <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
              <button
                onClick={() => setShowProactivePopup(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#1a2b4a] to-[#2a3b5a] rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#c9a227]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getProactiveMessage()}</p>
                  <Button
                    onClick={handleOpen}
                    size="sm"
                    className="mt-3 bg-[#c9a227] hover:bg-[#b8922a] text-white text-xs"
                  >
                    Chat with me <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#1a2b4a] to-[#2a3b5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#c9a227] rounded-full animate-pulse" />
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
           Chat with RegulaSync Assistant
          </span>
        </button>
      </>
    );
  }

  return (
    <div 
      className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col max-w-[calc(100vw-24px)] max-h-[calc(100dvh-24px)] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[560px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a2b4a] to-[#2a3b5a] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-white" />
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <Volume2 className="w-2.5 h-2.5 text-white animate-pulse" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">RegulaSync Assistant</h3>
            <p className="text-white/70 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : `Prototype • ${userProfile.name.split(' ')[0]}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Voice toggle */}
          {canSpeak && (
            <button
              onClick={() => {
                if (voiceSettings.enabled) stopSpeaking();
                setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }));
              }}
              className={`p-2 rounded-lg transition-colors ${voiceSettings.enabled ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/50'}`}
              aria-label={voiceSettings.enabled ? 'Disable voice' : 'Enable voice'}
              title={voiceSettings.enabled ? 'Voice enabled' : 'Voice disabled'}
            >
              {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => {
              stopSpeaking();
              const recognition = recognitionRef.current;
              if (recognition && isListening && !trySpeechOperation(() => recognition.stop())) {
                recognitionRef.current = null;
                disposeSpeechRecognition(recognition);
                setCanListen(false);
              }
              setIsListening(false);
              setIsOpen(false);
            }}
            className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors ml-1"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[340px] space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-[#c9a227] text-white' 
                      : message.isProactive 
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}>
                    {message.sender === 'user' ? <User className="w-4 h-4" /> : 
                     message.isProactive ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl relative group ${
                    message.sender === 'user'
                      ? 'bg-[#1a2b4a] text-white rounded-br-md'
                      : message.isProactive
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-bl-md border border-amber-200 dark:border-amber-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.sender === 'user' ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Speak button for bot messages */}
                      {message.sender === 'bot' && canSpeak && voiceSettings.enabled && (
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speak(message.text)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                            message.isProactive ? 'hover:bg-amber-200 dark:hover:bg-amber-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Suggestion chips */}
                {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-10">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 bg-[#1a2b4a]/10 hover:bg-[#1a2b4a]/20 text-[#1a2b4a] dark:bg-[#c9a227]/20 dark:hover:bg-[#c9a227]/30 dark:text-[#c9a227] rounded-full transition-colors flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && quickActions.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Suggested for you
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(action.label)}
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#1a2b4a]/10 to-[#2a3b5a]/10 hover:from-[#1a2b4a]/20 hover:to-[#2a3b5a]/20 text-[#1a2b4a] dark:text-white rounded-full transition-colors border border-[#1a2b4a]/20"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {/* Microphone button */}
              {canListen && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak your message'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? 'Listening...' : `Ask me anything, ${userProfile.name.split(' ')[0]}...`}
                className={`flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isListening ? 'border-red-500' : ''}`}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-[#1a2b4a] hover:bg-[#2a3b5a] text-white px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {canSpeak ? `${voiceSettings.enabled ? '🔊 Voice enabled' : '🔇 Voice disabled'} • ` : ''}Powered by RegulaSync AI
              </p>
              {canSpeak && (
                <button
                  onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                  className={`text-xs px-2 py-1 rounded ${
                    voiceSettings.autoSpeak
                      ? 'bg-[#c9a227]/20 text-[#c9a227]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                  title={voiceSettings.autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
                >
                  {voiceSettings.autoSpeak ? '🗣️ Auto' : '🔇 Manual'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
