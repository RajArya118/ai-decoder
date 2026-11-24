import React from 'react';
import { Cpu, ShieldCheck, Activity, MessageSquareCode, User, LogOut } from 'lucide-react';

export default function HUDHeader({ 
  healthData, 
  activeTab, 
  onToggleChat, 
  chatOpen, 
  user, 
  onOpenAuth, 
  onLogout,
  onOpenArchitecture
}) {
  return (
    <header className="h-16 border-b border-cyber-border/60 bg-cyber-dark/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Active System */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyber-cyan shadow-cyan-glow">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-white">AI DECODER</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO v3.2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
              MULTIMODAL INTELLIGENCE & DECRYPTION PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry Status Indicators */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Architecture & Roadmap Matrix Button */}
        <button
          onClick={onOpenArchitecture}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyber-surface/80 hover:bg-cyber-surface text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-colors shadow-emerald-glow"
          title="Open Web Dev Roadmap 2026 Architecture Explorer"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>ROADMAP 2026</span>
        </button>

        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-cyber-card/80 px-3 py-1.5 rounded-md border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI ENGINE:</span>
          <span className="text-cyan-300">
            {healthData?.aiEngine?.mode || 'Intelligent Neural Simulation'}
          </span>
        </div>

        {/* AI Copilot Quick Drawer Trigger */}
        <button
          onClick={onToggleChat}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 border ${
            chatOpen
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-cyan-glow font-semibold'
              : 'bg-cyber-surface/90 hover:bg-cyber-surface text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
          }`}
          title="Open AI Copilot Chat"
        >
          <MessageSquareCode className="w-4 h-4" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>

        {/* User Account / Guest */}
        {user ? (
          <div className="flex items-center space-x-2 bg-cyber-card px-3 py-1 rounded-md border border-white/10 text-xs font-mono">
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-slate-200">{user.name}</span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
}
