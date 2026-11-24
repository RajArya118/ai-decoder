import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Bookmark, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  MessageSquareCode, 
  Clock, 
  Zap,
  Cpu
} from 'lucide-react';

export default function ExplanationCard({ 
  result, 
  onAskChat, 
  onBookmark, 
  isBookmarked 
}) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const data = result.data || result;
  const explanation = data.aiExplanation || {};
  const security = explanation.securityAudit || '';
  const isDanger = /danger|warning|alert|malicious|threat/i.test(security);
  const isCaution = /caution|suspicious|unknown/i.test(security) && !isDanger;

  const handleCopy = () => {
    const textToCopy = data.decodedOutput || JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hud-card-active rounded-xl p-5 border border-cyan-500/30 space-y-5 animate-in fade-in duration-300">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/40">
            {explanation.detectedFormat || data.decoderType?.toUpperCase() || 'DECODED ARTIFACT'}
          </span>
          {explanation.complexity && (
            <span className="px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 font-mono text-xs border border-violet-500/30 flex items-center space-x-1">
              <Cpu className="w-3 h-3 mr-1" />
              <span>{explanation.complexity}</span>
            </span>
          )}
          {result.executionTimeMs !== undefined && (
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{result.executionTimeMs}ms</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onBookmark && (
            <button
              onClick={() => onBookmark(data.id || data._id)}
              className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title="Save to Vault"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Bookmark</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1"
            title="Copy decoded result"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Result'}</span>
          </button>

          {onAskChat && (
            <button
              onClick={() => onAskChat(data)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all duration-200 shadow-cyan-glow flex items-center space-x-1.5"
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Ask AI Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Threat Banner */}
      {security && (
        <div
          className={`p-3.5 rounded-lg border flex items-start space-x-3 text-xs font-mono ${
            isDanger
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : isCaution
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {isDanger ? (
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : isCaution ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold uppercase tracking-wider mb-0.5">
              SECURITY AUDIT: {isDanger ? 'THREAT DETECTED' : isCaution ? 'CAUTION' : 'VERIFIED SAFE'}
            </div>
            <div className="text-[11px] leading-relaxed text-slate-300 font-sans">{security}</div>
          </div>
        </div>
      )}

      {/* Decoded Content Block */}
      {data.decodedOutput && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Decoded Output Payload</span>
          </div>
          <pre className="p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64 whitespace-pre-wrap selection:bg-emerald-500/20">
            {data.decodedOutput}
          </pre>
        </div>
      )}

      {/* AI Explanation Summary */}
      {explanation.summary && (
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            AI Semantic Explanation
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-cyber-surface/40 p-3.5 rounded-lg border border-white/5">
            {explanation.summary}
          </p>
        </div>
      )}

      {/* Step-by-Step Breakdown */}
      {explanation.breakdown && explanation.breakdown.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Key Insights & Technical Observations
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {explanation.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-cyber-surface/50 border border-white/5 text-xs text-slate-300 font-sans flex items-start space-x-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono text-[10px] shrink-0 border border-cyan-500/30">
                  {idx + 1}
                </span>
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
