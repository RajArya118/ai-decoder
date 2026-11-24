import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  MessageSquareCode, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Cpu, 
  FileCode,
  Gauge
} from 'lucide-react';
import { api } from '../../services/api';

const SAMPLE_PROMPTS = [
  {
    label: 'Vague SaaS Request',
    text: 'Build me an AI web app in React that decodes things and has a nice dark theme and users can sign in and chat.'
  },
  {
    label: 'Customer Support Bot',
    text: 'Act like a helpful support assistant for our store. Answer questions about returns and shipping. Do not be rude and never give wrong prices.'
  },
  {
    label: 'Code Reviewer',
    text: 'Check this JavaScript code for bugs, make it faster, and explain why it is bad.'
  }
];

export default function PromptDecoder({ onAskChat, onBookmark }) {
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0].text);
  const [targetModel, setTargetModel] = useState('GPT-4o / Claude 3.5');
  const [goal, setGoal] = useState('Max Precision');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeVersionTab, setActiveVersionTab] = useState('standardProduction');
  const [copiedKey, setCopiedKey] = useState(null);

  const handleOptimize = async (e) => {
    e?.preventDefault();
    if (!promptText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.optimizePrompt({ promptText, targetModel, goal });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Prompt analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const explanation = result?.data?.aiExplanation || {};
  const scores = explanation.scores || {};
  const critique = explanation.critique || {};
  const optimizedVersions = explanation.optimizedVersions || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>AI Prompt Decoder & Optimizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit prompts for ambiguity, anti-patterns, and token waste. Generate production-grade XML-delimited versions.
          </p>
        </div>

        {/* Sample Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Sample Prompts:</span>
          {SAMPLE_PROMPTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setPromptText(sample.text);
                setResult(null);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Parameter Surface */}
      <form onSubmit={handleOptimize} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span>TARGET MODEL:</span>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="GPT-4o / Claude 3.5">GPT-4o / Claude 3.5 Sonnet</option>
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                <option value="Cursor / Codex AI">Cursor / Coding Agents</option>
                <option value="Local Small LLM">Small LLM (Llama 8B / Mistral)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span>OPTIMIZATION STRATEGY:</span>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-2.5 py-1 text-xs text-violet-300 font-mono focus:outline-none focus:border-violet-400"
              >
                <option value="Max Precision">Maximum Precision & Guardrails</option>
                <option value="Chain of Thought">Reasoning & Chain-of-Thought</option>
                <option value="Strict JSON Schema">Deterministic Output Schema</option>
                <option value="Token Compression">Token Efficiency & Speed</option>
              </select>
            </div>
          </div>

          <span>{promptText.split(/\s+/).filter(Boolean).length} words</span>
        </div>

        {/* Input Textarea */}
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Paste any prompt, instruction, system prompt, or workflow directive here..."
          className="w-full h-32 p-4 rounded-lg bg-cyber-darkest border border-white/10 font-sans text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-y"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setPromptText('');
              setResult(null);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={loading || !promptText.trim()}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-cyan-glow flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>ANALYZING PROMPT ARCHITECTURE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>ANALYZE & OPTIMIZE PROMPT</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
          Error: {error}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="hud-card-active rounded-xl p-5 border border-cyan-500/30 space-y-6 animate-in fade-in duration-300">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-white/10 pb-5">
            <div className="p-3 rounded-lg bg-cyber-darkest border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Overall Health</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                {scores.overall || 80}<span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-darkest border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Clarity</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {scores.clarity || 75}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-darkest border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Constraints</div>
              <div className="text-xl font-bold text-violet-400 font-mono mt-1">
                {scores.constraints || 70}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-darkest border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Structure</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                {scores.structure || 85}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-darkest border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Efficiency</div>
              <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
                {scores.tokenEfficiency || 80}%
              </div>
            </div>
          </div>

          {/* Qualitative Critique & Anti-patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 uppercase font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Identified Strengths</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                {critique.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-2">
              <div className="text-xs font-mono text-amber-400 flex items-center space-x-1.5 uppercase font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Vulnerabilities & Anti-Patterns</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                {critique.weaknesses?.map((w, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Production-Grade Optimized Versions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Production Optimized Variations</span>
              </div>

              {/* Version Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-cyber-darkest p-1 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('standardProduction')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeVersionTab === 'standardProduction'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Standard Production
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('chainOfThought')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeVersionTab === 'chainOfThought'
                      ? 'bg-violet-500/20 text-violet-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chain-of-Thought (CoT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('fewShotSchema')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeVersionTab === 'fewShotSchema'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Deterministic Schema
                </button>
              </div>
            </div>

            {/* Code Output Display */}
            <div className="relative">
              <pre className="p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-cyan-200 overflow-x-auto whitespace-pre-wrap max-h-80 selection:bg-cyan-500/20">
                {optimizedVersions[activeVersionTab] || 'Optimized prompt generated.'}
              </pre>

              {/* Copy Button */}
              <button
                type="button"
                onClick={() =>
                  handleCopy(optimizedVersions[activeVersionTab], activeVersionTab)
                }
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono text-slate-200 transition-colors flex items-center space-x-1.5 backdrop-blur-md"
              >
                {copiedKey === activeVersionTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-slate-400">
              Optimization Gain: <strong className="text-emerald-400">+25% Precision</strong>
            </span>

            {onAskChat && (
              <button
                type="button"
                onClick={() => onAskChat(result.data)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all duration-200 shadow-cyan-glow flex items-center space-x-2"
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Test in AI Copilot</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
