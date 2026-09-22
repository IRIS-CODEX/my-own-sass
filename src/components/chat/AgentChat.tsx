import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Zap,
  Brain,
  Database,
  Code,
  Send,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldAlert,
  Play,
  OctagonAlert,
  Terminal,
  Search,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Mic,
  Volume2,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  Loader2,
  ExternalLink,
  Square
} from 'lucide-react';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useChatStore } from '../../stores/useChatStore';
import { useAppStore } from '../../stores/useAppStore';
import { usePoliciesStore } from '../../stores/usePoliciesStore';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';
import { Agent, AgentArchetype, AutonomyMode } from '../../types';
import { AgentMemoryBank } from './AgentMemoryBank';

export const AgentChat: React.FC = () => {
  const { agents, setAutonomyMode, toggleKillSwitch, provisionDefaultFleet } = useAgentsStore();
  const {
    activeAgentId,
    setActiveAgentId,
    getMessages,
    sendMessage,
    clearChat,
    isThinking,
    thinkingStage
  } = useChatStore();

  const { activeChatAgentId, setActiveNav, addToast } = useAppStore();
  const { promptRules } = usePoliciesStore();
  const { pendingActions, approveAction } = useLiveStreamStore();

  const [inputMessage, setInputMessage] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [showMemoryBank, setShowMemoryBank] = useState(false);
  const [collapsedThoughts, setCollapsedThoughts] = useState<Record<string, boolean>>({});

  // Multimodal Voice & Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const lastSpokenMsgIdRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Helper to clean markdown for natural TTS audio reading
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/🛡️|⚠️|✅|❌|•/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  // Sync if appStore requested a specific agent
  useEffect(() => {
    if (activeChatAgentId && agents.some((a) => a.id === activeChatAgentId)) {
      setActiveAgentId(activeChatAgentId);
    }
  }, [activeChatAgentId, agents, setActiveAgentId]);

  // Fallback to first agent if active agent is invalid
  useEffect(() => {
    if (!agents.some((a) => a.id === activeAgentId) && agents.length > 0) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId, setActiveAgentId]);

  const currentAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const messages = currentAgent ? getMessages(currentAgent.id) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Auto-speak in Live Voice Mode when a new agent message arrives
  useEffect(() => {
    if (!isLiveVoiceMode || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'agent' && lastMsg.id !== lastSpokenMsgIdRef.current && !isThinking) {
      lastSpokenMsgIdRef.current = lastMsg.id;
      handleSpeakMessage(lastMsg.id, lastMsg.content);
    }
  }, [messages, isLiveVoiceMode, isThinking]);

  // Handler: Start audio recording & real-time transcription
  const handleStartRecording = async () => {
    let interimTextCaptured = '';
    try {
      // 1. Initialize Web Speech API for real-time live dictation if available
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) {
              interimTextCaptured = transcript;
              setInputMessage(transcript);
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('Live speech recognition warning:', err);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition start failed, relying on media recorder:', recErr);
        }
      }

      // 2. Initialize MediaRecorder with adaptive MIME type for Gemini 3.5 Transcribe
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }
        }

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          stream.getTracks().forEach((t) => t.stop());

          // If speech recognition already provided accurate text, we don't need additional cloud transcription
          if (interimTextCaptured.trim().length > 3) {
            if (isLiveVoiceMode) {
              handleSend(interimTextCaptured.trim());
            }
            return;
          }

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = (reader.result as string) || '';
            setIsTranscribing(true);
            try {
              const res = await fetch('/api/gemini/transcribe-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioData: base64Data,
                  mimeType,
                  model: 'gemini-3.5-transcribe',
                }),
              });
              const data = await res.json();
              if (res.ok && data.transcription) {
                const finalStr = data.transcription;
                setInputMessage((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
                addToast({ title: 'Voice Transcribed', description: 'Speech captured cleanly.', type: 'success' });
                if (isLiveVoiceMode) {
                  handleSend(finalStr);
                }
              }
            } catch (err) {
              console.error('Transcription error:', err);
            } finally {
              setIsTranscribing(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        addToast({ title: 'Listening...', description: 'Speak clearly into your microphone.', type: 'info' });
      } else {
        setIsRecording(true);
      }
    } catch (e) {
      console.error('Microphone error:', e);
      addToast({ title: 'Microphone Notice', description: 'Could not access microphone.', type: 'error' });
    }
  };

  const handleStopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Handler: Speech Synthesis (TTS Read-Aloud with natural speech)
  const handleSpeakMessage = async (msgId: string, text: string) => {
    if (currentlySpeakingMsgId === msgId) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setCurrentlySpeakingMsgId(null);
      return;
    }

    setCurrentlySpeakingMsgId(msgId);
    const spokenText = cleanTextForSpeech(text).slice(0, 1000);

    const fallbackToSpeechSynthesis = () => {
      if (!window.speechSynthesis) {
        setCurrentlySpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setCurrentlySpeakingMsgId(null);
      utterance.onerror = () => setCurrentlySpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    };

    try {
      const res = await fetch('/api/gemini/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: spokenText.slice(0, 600),
          voice: 'Kore',
          model: 'gemini-3.1-flash-tts-preview',
        }),
      });

      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          fallbackToSpeechSynthesis();
          return;
        }

        const audioCtx = new AudioContextClass({ sampleRate: 24000 });
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const pcm16 = new Int16Array(bytes.buffer);
        const audioBuffer = audioCtx.createBuffer(1, pcm16.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcm16.length; i++) {
          channelData[i] = pcm16[i] / 32768.0;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setCurrentlySpeakingMsgId(null);
        source.start();
      } else {
        fallbackToSpeechSynthesis();
      }
    } catch (e) {
      fallbackToSpeechSynthesis();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !currentAgent || isThinking) return;

    setInputMessage('');
    await sendMessage(currentAgent.id, text, currentAgent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleThought = (msgId: string) => {
    setCollapsedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const getAgentIcon = (archetype?: AgentArchetype, iconName?: string) => {
    if (iconName === 'Zap' || archetype === 'OUTREACH') return Zap;
    if (iconName === 'Brain' || archetype === 'RESEARCHER') return Brain;
    if (iconName === 'Database' || archetype === 'DB_REPORTER') return Database;
    if (iconName === 'Code' || archetype === 'CODING') return Code;
    return Bot;
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
    a.description.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const isCurrentAgentPaused = currentAgent?.autonomyMode === 'PAUSED';

  const activeAgentRules = currentAgent
    ? promptRules.filter((r) => r.isEnabled && (r.agentId === 'ALL' || r.agentId === currentAgent.id))
    : [];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] overflow-hidden shadow-xs">
      {/* Left Column: Agent Selector */}
      <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-[#e5e0d5] dark:border-[#33302b] flex flex-col bg-[#faf8f5] dark:bg-[#181715]">
        {/* Header & Search */}
        <div className="p-3.5 border-b border-[#e5e0d5] dark:border-[#33302b] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                Active Agents
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                {agents.length}
              </span>
            </div>

            <button
              onClick={() => setActiveNav('studio')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Create new agent"
            >
              <Sparkles className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#878278] dark:text-[#7d7970]" />
            <input
              type="text"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder:text-[#878278] dark:placeholder:text-[#7d7970] focus:outline-hidden focus:border-[#d97706] transition-colors font-medium shadow-xs"
            />
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredAgents.map((agent) => {
            const isSelected = agent.id === activeAgentId;
            const Icon = getAgentIcon(agent.archetype, agent.avatarIcon);
            const isPaused = agent.autonomyMode === 'PAUSED';

            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  inputRef.current?.focus();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#211f1c] border-[#e5e0d5] dark:border-[#33302b] shadow-xs text-[#1f1e1b] dark:text-[#f5f3ef]'
                    : 'border-transparent hover:bg-[#f4f1ea] dark:hover:bg-[#211f1c] text-[#5c5850] dark:text-[#b8b4aa]'
                }`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    isPaused
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : isSelected
                      ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] font-bold shadow-xs'
                      : 'bg-white dark:bg-[#282622] text-[#878278] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {agent.name}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isPaused ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] truncate mt-0.5 font-medium">
                    {agent.description}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20 font-bold">
                      {agent.model}
                    </span>
                    <span className="text-[#878278] dark:text-[#7d7970] font-bold">
                      {agent.autonomyMode}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="p-6 text-center text-xs text-[#878278] dark:text-[#7d7970] space-y-1.5 font-medium">
              <p>No agents found.</p>
              <button
                onClick={() => setActiveNav('studio')}
                className="text-[#d97706] dark:text-[#f59e0b] font-bold hover:underline cursor-pointer"
              >
                Build new agent
              </button>
            </div>
          )}
        </div>

        {/* Footer Shortcut */}
        <div className="p-2.5 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715]">
          <button
            onClick={() => setActiveNav('agents')}
            className="w-full py-1.5 px-3 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold hover:bg-[#f4f1ea] dark:hover:bg-[#282622] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Manage All Agents</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
          </button>
        </div>
      </div>

      {/* Right Column: Chat Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#211f1c]">
        {!currentAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 flex items-center justify-center shadow-xs">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">No Autonomous Agents Ready</h3>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed font-medium">
                Initialize the standard fleet or write a prompt in the Agent Studio to create and chat with autonomous agents under active governance.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await provisionDefaultFleet();
                  addToast({ title: 'Agent Fleet Initialized', description: 'Sample agents created and ready for testing.', type: 'success' });
                }}
                className="px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Provision Starter Fleet</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNav('studio')}
                className="px-4 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold hover:bg-[#faf8f5] dark:hover:bg-[#181715] transition-colors cursor-pointer shadow-xs"
              >
                Create in Studio
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Chat Header */}
            <div className="px-4 py-3 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/80 dark:bg-[#181715]/80 backdrop-blur-md flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                className: `w-5 h-5 flex-shrink-0 ${
                  isCurrentAgentPaused ? 'text-rose-500' : 'text-[#d97706] dark:text-[#f59e0b]'
                }`
              })}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef] truncate">
                    {currentAgent.name}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20 font-bold">
                    {currentAgent.model}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isCurrentAgentPaused
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isCurrentAgentPaused ? 'HALTED' : 'READY'}
                  </span>
                </div>
                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] truncate font-medium">
                  {currentAgent.description}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Autonomy Mode Selector */}
              <select
                value={currentAgent.autonomyMode}
                onChange={(e) => setAutonomyMode(currentAgent.id, e.target.value as AutonomyMode)}
                className="hidden sm:block bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-mono cursor-pointer shadow-xs"
                title="Runtime autonomy mode"
              >
                <option value="FULL_AUTO">Full Auto</option>
                <option value="SEMI_AUTO">Semi-Auto (HITL)</option>
                <option value="READ_ONLY">Read-Only</option>
                <option value="PAUSED">Kill-Switch</option>
              </select>

              {/* Kill Switch Toggle */}
              <button
                onClick={() => toggleKillSwitch(currentAgent.id)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isCurrentAgentPaused
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
                title={isCurrentAgentPaused ? 'Resume Agent' : 'Emergency Halt'}
              >
                {isCurrentAgentPaused ? <Play className="w-3.5 h-3.5" /> : <OctagonAlert className="w-3.5 h-3.5" />}
              </button>

              {/* Live Voice Mode Toggle */}
              <button
                onClick={() => {
                  const nextMode = !isLiveVoiceMode;
                  setIsLiveVoiceMode(nextMode);
                  if (nextMode) {
                    addToast({
                      title: 'Live Voice Mode: ON',
                      description: 'The agent will automatically speak responses and listen hands-free.',
                      type: 'success',
                    });
                  } else {
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    setCurrentlySpeakingMsgId(null);
                    addToast({
                      title: 'Live Voice Mode: OFF',
                      description: 'Voice chat switched to standard text mode.',
                      type: 'info',
                    });
                  }
                }}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isLiveVoiceMode
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
                }`}
                title="Toggle Hands-Free Live Voice Conversation Mode"
              >
                <Mic className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Live Voice</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded-full font-bold ${isLiveVoiceMode ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {isLiveVoiceMode ? 'LIVE' : 'OFF'}
                </span>
              </button>

              {/* Memory Bank Toggle */}
              <button
                onClick={() => {
                  setShowMemoryBank(!showMemoryBank);
                  if (showSystemPrompt) setShowSystemPrompt(false);
                  if (showRulesDrawer) setShowRulesDrawer(false);
                }}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  showMemoryBank
                    ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] border-[#d97706] dark:border-[#f59e0b]'
                    : 'border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
                }`}
                title="Google Cloud SQL Long-Term Memory Bank"
              >
                <Brain className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                <span className="hidden sm:inline">Memory</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  SQL
                </span>
              </button>

              {/* Inspect Rules & Prompt */}
              <button
                onClick={() => {
                  setShowRulesDrawer(!showRulesDrawer);
                  if (showSystemPrompt) setShowSystemPrompt(false);
                  if (showMemoryBank) setShowMemoryBank(false);
                }}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  showRulesDrawer
                    ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] border-[#d97706] dark:border-[#f59e0b]'
                    : 'border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
                }`}
                title="Active Governed Rules"
              >
                <Shield className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                <span className="hidden sm:inline">Rules</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] font-bold">
                  {activeAgentRules.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowSystemPrompt(!showSystemPrompt);
                  if (showRulesDrawer) setShowRulesDrawer(false);
                }}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  showSystemPrompt
                    ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] border-[#d97706] dark:border-[#f59e0b]'
                    : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
                }`}
                title="System Prompt & Config"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Clear messages */}
              <button
                onClick={() => {
                  clearChat(currentAgent.id);
                  addToast({ title: 'Chat Cleared', description: 'Conversation reset.', type: 'info' });
                }}
                className="p-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-colors cursor-pointer shadow-xs"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        {/* Collapsible System Prompt Drawer */}
        {showSystemPrompt && currentAgent && (
          <div className="p-3.5 bg-[#faf8f5] dark:bg-[#181715] border-b border-[#e5e0d5] dark:border-[#33302b] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider font-mono text-[#d97706] dark:text-[#f59e0b] text-[10px]">
                System Prompt ({currentAgent.framework})
              </span>
              <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono font-bold">
                Daily Budget: ${currentAgent.dailyBudgetUsd} USD
              </span>
            </div>
            <pre className="p-2.5 bg-white dark:bg-[#211f1c] rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] font-mono text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">
              {currentAgent.systemPrompt}
            </pre>
            {currentAgent.tools && currentAgent.tools.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[#878278] dark:text-[#7d7970] text-[10px] font-mono font-bold">Tools:</span>
                {currentAgent.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] font-mono text-[10px] border border-amber-500/20 font-bold"
                  >
                    {tool}()
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Governed Rules Drawer */}
        {showRulesDrawer && currentAgent && (
          <div className="p-3.5 bg-[#faf8f5] dark:bg-[#181715] border-b border-[#e5e0d5] dark:border-[#33302b] text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                <span className="font-bold uppercase tracking-wider font-mono text-[#1f1e1b] dark:text-[#f5f3ef] text-[11px]">
                  Active Governance Policies ({activeAgentRules.length})
                </span>
              </div>
              <button
                onClick={() => setActiveNav('policies')}
                className="text-[11px] font-bold text-[#d97706] dark:text-[#f59e0b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit in Policy Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeAgentRules.length === 0 ? (
              <p className="text-[#878278] dark:text-[#7d7970] text-xs italic font-medium">
                No custom prompt rules currently targeting this agent. Autonomous parameters adhere to standard Traffic Light matrix.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeAgentRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] text-xs">
                        {rule.ruleName}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          rule.riskLevel === 'RED'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : rule.riskLevel === 'YELLOW'
                            ? 'bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {rule.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">
                      <span>Tool: <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">{rule.targetTool || 'All Tools'}</strong></span>
                      <span>•</span>
                      <span className="truncate font-semibold text-[#5c5850] dark:text-[#b8b4aa]">{rule.conditionExpression || 'Always Active'}</span>
                    </div>
                    <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] line-clamp-2 italic bg-[#faf8f5] dark:bg-[#181715] p-1.5 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] font-medium">
                      "{rule.systemInstructionAddition}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paused Warning Banner */}
        {isCurrentAgentPaused && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Agent halted. Outgoing tool calls suspended.</span>
            </div>
            <button
              onClick={() => toggleKillSwitch(currentAgent.id)}
              className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Resume
            </button>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Welcome Screen when conversation is empty */}
          {messages.length === 0 && currentAgent && (
            <div className="max-w-lg mx-auto py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center mx-auto shadow-xs font-bold">
                {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                  className: 'w-6 h-6'
                })}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {currentAgent.name}
                </h3>
                <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 max-w-sm mx-auto font-medium">
                  {currentAgent.welcomeMessage || currentAgent.description}
                </p>
              </div>

              {/* Starter Prompts */}
              {currentAgent.suggestedPrompts && currentAgent.suggestedPrompts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono block">
                    Suggested Questions
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-left">
                    {currentAgent.suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] transition-all flex items-center justify-between group cursor-pointer shadow-xs font-semibold"
                      >
                        <span className="line-clamp-1">{prompt}</span>
                        <Send className="w-3 h-3 text-[#878278] dark:text-[#7d7970] group-hover:text-[#d97706] dark:group-hover:text-[#f59e0b] transition-colors ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThoughtCollapsed = collapsedThoughts[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                      className: 'w-3.5 h-3.5'
                    })}
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Internal Reasoning Steps */}
                  {!isUser && msg.thoughts && msg.thoughts.length > 0 && (
                    <div className="rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] overflow-hidden text-[11px]">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-[#1f1e1b] dark:text-[#f5f3ef] font-mono cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-1.5 font-bold">
                          <Brain className="w-3 h-3 text-[#d97706] dark:text-[#f59e0b]" />
                          <span>Reasoning ({msg.thoughts.length} steps)</span>
                        </span>
                        {isThoughtCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-[#878278]" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-[#878278]" />
                        )}
                      </button>

                      {!isThoughtCollapsed && (
                        <div className="px-2.5 pb-2 pt-1 border-t border-[#e5e0d5] dark:border-[#33302b] font-mono space-y-1 text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                          {msg.thoughts.map((t, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-[#d97706] dark:text-[#f59e0b] font-bold text-[10px]">{i + 1}.</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Execution Card */}
                  {!isUser && msg.toolCall && (
                    <div className="p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono space-y-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                          <Terminal className="w-3 h-3 text-[#d97706] dark:text-[#f59e0b]" />
                          <span>Tool: {msg.toolCall.toolName}()</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            msg.toolCall.riskLevel === 'YELLOW'
                              ? 'bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {msg.toolCall.riskLevel} {msg.toolCall.intercepted ? '(GATED)' : '(AUTO)'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                        <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">Input:</strong> {JSON.stringify(msg.toolCall.params)}
                      </div>

                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] pt-1 border-t border-[#e5e0d5] dark:border-[#33302b] font-medium">
                        <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">Output:</strong> {msg.toolCall.result}
                      </div>

                      {msg.toolCall.riskLevel === 'YELLOW' && msg.toolCall.intercepted && (
                        <div className="pt-2 border-t border-[#e5e0d5] dark:border-[#33302b] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#b45309] dark:text-[#fbbf24] font-sans font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Awaiting Supervisor Approval</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const pending = pendingActions.find((a) => a.toolName === msg.toolCall?.toolName);
                                if (pending) {
                                  approveAction(pending.actionId);
                                  addToast({
                                    title: 'Tool Call Authorized',
                                    description: `Tool ${pending.toolName} unblocked and executed successfully.`,
                                    type: 'success'
                                  });
                                } else {
                                  addToast({
                                    title: 'Tool Authorized',
                                    description: 'Human-in-the-loop authorization granted.',
                                    type: 'success'
                                  });
                                }
                              }}
                              className="px-2.5 py-1 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-[11px] font-sans rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>1-Tap Authorize</span>
                            </button>
                            <button
                              onClick={() => setActiveNav('live-stream')}
                              className="px-2.5 py-1 bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] text-[11px] font-sans font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <span>Control Tower</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs relative group ${
                      isUser
                        ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] font-medium'
                        : 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] font-medium'
                    }`}
                  >
                    {msg.content}

                    {/* Media Render (Image, Audio, Video) */}
                    {msg.mediaUrl && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] shadow-xs">
                        {msg.mediaType === 'image' && (
                          <div className="relative group/img">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/80 dark:bg-[#211f1c]/80 text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
                              <span className="flex items-center gap-1.5 font-bold text-[#d97706] dark:text-[#f59e0b]">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Gemini Synthesized Image</span>
                              </span>
                              <a
                                href={msg.mediaUrl}
                                download={`agent-generated-${Date.now()}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded bg-white dark:bg-[#282622] hover:bg-[#f4f1ea] border border-[#e5e0d5] dark:border-[#33302b] font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>Save / Open</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <div className="p-2 flex items-center justify-center bg-black/5 dark:bg-black/20">
                              <img
                                src={msg.mediaUrl}
                                alt="Agent Generated Output"
                                referrerPolicy="no-referrer"
                                className="w-full max-h-96 object-contain rounded-xl shadow-xs transition-transform duration-300"
                              />
                            </div>
                          </div>
                        )}
                        {msg.mediaType === 'audio' && (
                          <div className="p-3.5 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                              <Music className="w-4 h-4" />
                              <span>Synthesized Audio Track</span>
                            </div>
                            <audio controls src={msg.mediaUrl} className="w-full" />
                          </div>
                        )}
                        {msg.mediaType === 'video' && (
                          <video controls src={msg.mediaUrl} className="w-full max-h-72 rounded-xl" />
                        )}
                      </div>
                    )}

                    {/* Assistant Voice TTS Action */}
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] text-[10px] font-bold cursor-pointer transition-all"
                        title="Read aloud with Gemini voice"
                      >
                        <Volume2 className={`w-3 h-3 ${currentlySpeakingMsgId === msg.id ? 'text-[#d97706] animate-pulse' : ''}`} />
                        <span>{currentlySpeakingMsgId === msg.id ? 'Speaking...' : 'Listen Voice'}</span>
                      </button>
                    )}
                  </div>

                  {/* Telemetry Footer */}
                  <div
                    className={`flex items-center gap-2 text-[10px] font-mono text-[#878278] dark:text-[#7d7970] px-1 font-semibold ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.metrics && (
                      <>
                        <span>•</span>
                        <span>{msg.metrics.latencyMs}ms</span>
                        <span>•</span>
                        <span>{msg.metrics.tokensUsed} toks</span>
                        <span>•</span>
                        <span>${msg.metrics.costUsd.toFixed(5)}</span>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] shadow-xs">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking animation */}
          {isThinking && (
            <div className="flex gap-3 text-xs justify-start items-start">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs text-[#5c5850] dark:text-[#b8b4aa] space-y-1 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] dark:bg-[#f59e0b] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] dark:bg-[#f59e0b] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] dark:bg-[#f59e0b] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] text-xs">
                    {currentAgent?.name} is thinking...
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970] font-semibold">
                  {thinkingStage}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715]">
          {/* Quick Multimodal Action Chips */}
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
            <button
              onClick={() => setInputMessage('Generate an illustration for our product launch')}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-medium text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <ImageIcon className="w-3 h-3 text-[#d97706]" />
              <span>Image</span>
            </button>
            <button
              onClick={() => setInputMessage('Search current web facts about ')}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-medium text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <Search className="w-3 h-3 text-emerald-600" />
              <span>Search Web</span>
            </button>
            <button
              onClick={() => setInputMessage('Search Google Maps places for top cafes in Paris')}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-medium text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-red-500" />
              <span>Maps</span>
            </button>
            <button
              onClick={() => setInputMessage('Compose a soothing ambient background synth track')}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-medium text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <Music className="w-3 h-3 text-purple-500" />
              <span>Music</span>
            </button>
          </div>

          <div className="relative rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] focus-within:border-[#d97706] transition-all shadow-xs">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              rows={2}
              placeholder={
                isCurrentAgentPaused
                  ? 'Agent paused. Resume above to chat...'
                  : `Message ${currentAgent?.name || 'Agent'}... (Press Enter)`
              }
              className="w-full bg-transparent p-3 pr-20 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder:text-[#878278] dark:placeholder:text-[#7d7970] focus:outline-hidden resize-none font-medium"
            />

            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {/* Mic / Voice Recording Button */}
              <button
                type="button"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isThinking || isTranscribing}
                className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : isTranscribing
                    ? 'bg-amber-500/10 text-[#d97706] border-amber-500/30'
                    : 'bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border-[#e5e0d5] dark:border-[#33302b]'
                }`}
                title={isRecording ? 'Stop recording & transcribe' : 'Speak to agent (Voice transcription)'}
              >
                {isTranscribing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
                ) : isRecording ? (
                  <Square className="w-3.5 h-3.5 fill-white" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isThinking}
                className="p-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] disabled:opacity-30 text-white dark:text-[#181715] font-bold transition-all shadow-xs cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#878278] dark:text-[#7d7970] font-mono font-semibold">
            <span>
              Governed Key: <strong className="text-[#d97706] dark:text-[#f59e0b] font-bold">al_live_scoped</strong>
            </span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Memory Bank Panel (Google Cloud SQL) */}
      {showMemoryBank && currentAgent && (
        <AgentMemoryBank agent={currentAgent} onClose={() => setShowMemoryBank(false)} />
      )}
    </div>
  );
};
