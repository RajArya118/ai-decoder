import React from 'react';
import { 
  Terminal, 
  Code2, 
  Binary, 
  QrCode, 
  ScanEye, 
  Archive, 
  Sparkles,
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'text', label: 'AI Text Decoder', icon: Terminal, desc: 'Analyze & translate obscure text' },
  { id: 'prompt', label: 'Prompt Optimizer', icon: Sparkles, desc: 'Audit, score & optimize AI prompts' },
  { id: 'code', label: 'Code & AST Explainer', icon: Code2, desc: 'Inspect algorithms, complexity & security' },
  { id: 'cipher', label: 'Cipher & Encodings', icon: Binary, desc: 'Base64, Hex, Binary, JWT, ROT13' },
  { id: 'qr', label: 'QR & Barcode Scanner', icon: QrCode, desc: 'Camera stream & image payload audit' },
  { id: 'image', label: 'Multimodal Vision', icon: ScanEye, desc: 'OCR & visual diagram decomposition' },
  { id: 'history', label: 'History Vault', icon: Archive, desc: 'Search, bookmark & export records' },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-64 border-r border-cyber-border/50 bg-cyber-dark/60 backdrop-blur-md flex flex-col justify-between shrink-0 p-4">
      <div>
        <div className="text-[11px] font-mono tracking-wider text-slate-400 px-3 pb-3 uppercase flex items-center justify-between">
          <span>Decoders & Engines</span>
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-surface/60 border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-cyan-glow" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="overflow-hidden">
                  <div className={`text-xs font-medium font-mono ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-sans">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cyberpunk Status Box */}
      <div className="hud-card p-3.5 rounded-xl border border-white/5 space-y-2 mt-4">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>ZERO-LATENCY HUD</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Deterministic conversions execute instantaneously. AI evaluations stream asynchronously.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5">
          <span>SEC LEVEL: MAX</span>
          <span className="text-emerald-400">100% AIRGAPPED</span>
        </div>
      </div>
    </aside>
  );
}
