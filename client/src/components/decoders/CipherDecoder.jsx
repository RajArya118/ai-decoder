import React, { useState } from 'react';
import { Binary, ArrowRightLeft, Sparkles, RefreshCw, Key, Shield } from 'lucide-react';
import { api } from '../../services/api';
import ExplanationCard from './ExplanationCard';

const CIPHER_SAMPLES = [
  {
    type: 'jwt',
    label: 'Sample JWT Token',
    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIEN5YmVyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzg0ODU2OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  },
  {
    type: 'url',
    label: 'Tracking URL with UTM',
    input: 'https%3A%2F%2Fsecure.intel-node.io%2Fauth%2Fcallback%3Ftoken%3Dxyz987%26redirect%3D%252Fdashboard%253Fref%253Dcyber'
  },
  {
    type: 'hex',
    label: 'Hex Byte Sequence',
    input: '4149204445434f444552202d204e6578742d47656e2043796265722053616153'
  },
  {
    type: 'binary',
    label: '8-Bit Binary Stream',
    input: '01010011 01000101 01000011 01010101 01010010 01000101'
  }
];

export default function CipherDecoder({ onAskChat, onBookmark }) {
  const [input, setInput] = useState(CIPHER_SAMPLES[0].input);
  const [cipherType, setCipherType] = useState('jwt');
  const [action, setAction] = useState('decode');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExecute = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.decodeCipher({ input, cipherType, action });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Cipher conversion failed');
      }
    } catch (err) {
      setError(err.message || 'Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Binary className="w-5 h-5 text-emerald-400" />
            <span>Cipher & Encoding Laboratory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant deterministic transformation & AI evaluation for Base64, Hex, Binary, JWT, URL, ROT13, and Morse.
          </p>
        </div>

        {/* Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Presets:</span>
          {CIPHER_SAMPLES.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(sample.input);
                setCipherType(sample.type);
                setAction('decode');
                setResult(null);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Surface */}
      <form onSubmit={handleExecute} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        {/* Type & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <span>ALGORITHM / ENCODING:</span>
              <select
                value={cipherType}
                onChange={(e) => setCipherType(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
              >
                <option value="base64">Base64</option>
                <option value="jwt">JWT (JSON Web Token)</option>
                <option value="url">URL Percent-Encoding</option>
                <option value="hex">Hexadecimal (0x...)</option>
                <option value="binary">8-Bit Binary</option>
                <option value="rot13">ROT13 / Caesar 13</option>
                <option value="morse">Morse Code</option>
                <option value="auto">Auto-Detect Algorithm</option>
              </select>
            </div>

            {cipherType !== 'jwt' && (
              <div className="flex items-center space-x-1 bg-cyber-darkest p-1 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAction('decode')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    action === 'decode'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  DECODE
                </button>
                <button
                  type="button"
                  onClick={() => setAction('encode')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    action === 'encode'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ENCODE
                </button>
              </div>
            )}
          </div>

          <span className="text-xs font-mono text-slate-400">
            {input.length} characters
          </span>
        </div>

        {/* Input Textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter ${cipherType.toUpperCase()} string to ${action}...`}
          className="w-full h-32 p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-y"
          spellCheck="false"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setInput('');
              setResult(null);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-emerald-glow flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>{action === 'decode' ? 'DECODE & AUDIT' : 'ENCODE PAYLOAD'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
          Error: {error}
        </div>
      )}

      {/* Results */}
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
