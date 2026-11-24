import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../../services/api';

const QUICK_PROMPTS = [
  'Is this payload safe to execute or visit?',
  'How do I patch this vulnerability?',
  'Convert this code to TypeScript',
  'Explain how this encryption works'
];

export default function ChatSidecar({ 
  isOpen, 
  onClose, 
  activeRecord 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history when activeRecord changes
  useEffect(() => {
    if (!activeRecord) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I am your AI DECODER Copilot. Select any decoded artifact or ask me general questions about ciphers, algorithms, and security!'
        }
      ]);
      return;
    }

    const decodeId = activeRecord.id || activeRecord._id;
    if (decodeId) {
      api.getMessages(decodeId).then((res) => {
        if (res.success && res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: `Loaded context for [${activeRecord.decoderType?.toUpperCase()}]. I'm ready to answer follow-up questions about this decoded artifact!`
            }
          ]);
        }
      }).catch(() => {
        setMessages([
          {
            role: 'assistant',
            content: `Connected to [${activeRecord.decoderType?.toUpperCase()}] context. Ask me anything!`
          }
        ]);
      });
    }
  }, [activeRecord]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const decodeId = activeRecord?.id || activeRecord?._id || 'general';
      const data = await api.sendMessage({
        decodeId,
        message: text
      });

      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Apologies, could not process query.' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error: ' + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-cyber-dark/95 backdrop-blur-xl border-l border-cyan-500/30 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-cyber-surface/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono text-white flex items-center space-x-1.5">
              <span>AI COPILOT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
              {activeRecord ? `Context: ${activeRecord.decoderType?.toUpperCase()}` : 'General Assistant'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Artifact Pill */}
      {activeRecord && (
        <div className="px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300">
          <span className="truncate max-w-[280px]">
            Artifact: {(activeRecord.decodedOutput || activeRecord.rawInput || '').slice(0, 32)}...
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[9px] uppercase border border-cyan-500/40">
            Linked
          </span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono ${
                  isUser
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed font-sans relative group ${
                  isUser
                    ? 'bg-violet-950/60 text-slate-100 border border-violet-500/30'
                    : 'bg-cyber-surface/90 text-slate-200 border border-white/10'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(msg.content, idx)}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/40 text-slate-400 hover:text-white"
                  title="Copy message"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI Reasoning in progress...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            className="text-[10px] font-mono whitespace-nowrap px-2.5 py-1 rounded bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-all shrink-0"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-white/10 bg-cyber-darkest flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Copilot about this decode..."
          className="flex-1 bg-cyber-surface border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
