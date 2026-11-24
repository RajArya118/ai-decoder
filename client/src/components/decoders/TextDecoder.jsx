import React, { useState } from 'react';
import { Terminal, Send, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import ExplanationCard from './ExplanationCard';

const SAMPLE_TEXTS = [
  {
    label: 'Base64 Obfuscation',
    text: 'SGVsbG8gQWdlbnQhIFRoZSBhY2Nlc3MgY29kZSBpcyA3NzEtQ1lCRVItMjAyNi4gRG8gbm90IHNoYXJlLg=='
  },
  {
    label: 'ROT13 Cipher',
    text: 'Gur frperg cnffjbeq vf "NAGV-TENIVGL-2026". Qb abg funer guvf jvgu hantgubevmrq crefbany.'
  },
  {
    label: 'Cryptic Legal Jargon',
    text: 'Pursuant to Section 8(a), the indemnitor shall hold harmless and exonerate the indemnitee from all liabilities arising ab initio hereunder without derogation.'
  }
];

export default function TextDecoder({ onAskChat, onBookmark }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('standard');
  const [autoDetect, setAutoDetect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDecode = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.decodeText({ input, mode, autoDetect });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Decoding failed');
      }
    } catch (err) {
      setError(err.message || 'Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>AI Text & Semantic Decoder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Decipher obscure, obfuscated, foreign, ciphered, or dense jargon into crystal-clear plain text.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Try Sample:</span>
          {SAMPLE_TEXTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(sample.text);
                setResult(null);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleDecode} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>INPUT TEXT PAYLOAD</span>
            <span>{input.length} characters</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste cryptic text, encoded ciphers, legal jargon, or unknown strings here..."
            className="w-full h-36 p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-y"
          />
        </div>

        {/* Configuration Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <span>EXPLANATION DEPTH:</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="standard">Standard Analytical</option>
                <option value="eli5">Explain Like I'm 5 (Simple)</option>
                <option value="cybersecurity">Cyber Threat & Integrity</option>
                <option value="linguistic">Linguistic Breakdown</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Auto-detect Encoded Ciphers</span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  setResult(null);
                  setError(null);
                }}
                className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-cyan-glow flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>DECODING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>DECODE & EXPLAIN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
          Error: {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <ExplanationCard
          result={result}
          onAskChat={onAskChat}
          onBookmark={onBookmark}
        />
      )}
    </div>
  );
}
