import React, { useState } from 'react';
import { Code2, Sparkles, RefreshCw, Bug, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../../services/api';
import ExplanationCard from './ExplanationCard';

const SAMPLE_CODES = [
  {
    label: 'Python Algorithm',
    lang: 'python',
    code: `def quick_select(nums, k):
    pivot = nums[len(nums) // 2]
    left = [x for x in nums if x > pivot]
    mid = [x for x in nums if x == pivot]
    right = [x for x in nums if x < pivot]
    
    if k <= len(left):
        return quick_select(left, k)
    elif k <= len(left) + len(mid):
        return mid[0]
    else:
        return quick_select(right, k - len(left) - len(mid))`
  },
  {
    label: 'Vulnerable SQL Auth',
    lang: 'javascript',
    code: `// Express Route Handler
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // DANGEROUS: Unsanitized concatenation leads to SQLi
  const query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
  const result = await db.raw(query);
  res.json(result);
});`
  },
  {
    label: 'React Debounce Hook',
    lang: 'typescript',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`
  }
];

export default function CodeDecoder({ onAskChat, onBookmark }) {
  const [code, setCode] = useState(SAMPLE_CODES[0].code);
  const [language, setLanguage] = useState(SAMPLE_CODES[0].lang);
  const [mode, setMode] = useState('explain');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDecode = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.decodeCode({ code, language, mode });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Code analysis failed');
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
            <Code2 className="w-5 h-5 text-violet-400" />
            <span>Code & AST Vulnerability Decoder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect source code, compute computational complexity, audit security flaws, and explain logic step by step.
          </p>
        </div>

        {/* Samples */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Sample Snippet:</span>
          {SAMPLE_CODES.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setCode(sample.code);
                setLanguage(sample.lang);
                setResult(null);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-violet-500/10 text-slate-300 hover:text-violet-300 border border-white/10 hover:border-violet-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Frame */}
      <form onSubmit={handleDecode} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        {/* Language & Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span>LANGUAGE:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-2.5 py-1 text-xs text-violet-300 font-mono focus:outline-none focus:border-violet-400"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML / CSS</option>
                <option value="sql">SQL Query</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="cpp">C / C++</option>
                <option value="bash">Bash / Shell</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span>FOCUS MODE:</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-cyber-surface border border-white/10 rounded-md px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="explain">Deep Code Walkthrough</option>
                <option value="security">Security & Vulnerability Audit</option>
                <option value="complexity">Time & Space Complexity</option>
                <option value="refactor">Bug Detection & Clean Code</option>
              </select>
            </div>
          </div>

          <span>{code.split('\n').length} lines</span>
        </div>

        {/* Code Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste function, script, or snippet here..."
          className="w-full h-48 p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-violet-200 placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all resize-y"
          spellCheck="false"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setCode('');
              setResult(null);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear Editor
          </button>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-violet-glow flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>ANALYZING AST...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>ANALYZE & DECODE</span>
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
