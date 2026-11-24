import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login(email, password);
      } else {
        res = await api.register(name, email, password);
      }

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="hud-card p-6 rounded-2xl border border-cyan-500/30 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-2 shadow-cyan-glow">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">
            {isLogin ? 'OPERATOR AUTHENTICATION' : 'INITIALIZE PROFILE'}
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            {isLogin
              ? 'Access saved history, custom decoding presets, and saved sessions.'
              : 'Create an account to persist your decrypted records in cloud vault.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">OPERATOR NAME</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Agent Sarah"
                  className="w-full pl-9 pr-3 py-2 bg-cyber-darkest border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">EMAIL IDENTIFIER</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@ai-decoder.io"
                className="w-full pl-9 pr-3 py-2 bg-cyber-darkest border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">PASSPHRASE</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-cyber-darkest border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-cyan-glow flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>{isLogin ? 'SIGN IN TO VAULT' : 'REGISTER OPERATOR'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-cyan-300 font-mono transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
