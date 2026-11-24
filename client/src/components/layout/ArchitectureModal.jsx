import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Key, 
  Layers, 
  CheckCircle2, 
  Terminal,
  Activity
} from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('logic'); // 'logic', 'database', 'roles'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="hud-card p-6 rounded-2xl border border-cyan-500/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <Activity className="w-4 h-4" />
            <span>WEB DEV ROADMAP 2026 ARCHITECTURAL MATRIX</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">
            System Design, Relational Database & RBAC Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Comprehensive answers and live implementation details for the 3 core full-stack questions.
          </p>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => setActiveTab('logic')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                activeTab === 'logic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-cyan-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>1. How Does the Logic Work?</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                activeTab === 'database'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-emerald-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>2. Where is Data Stored?</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                activeTab === 'roles'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold shadow-violet-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. How Do Roles Work? (RBAC)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HOW DOES THE LOGIC WORK? */}
        {activeTab === 'logic' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 font-mono">
                The Request-Response Cycle & Dual-Engine Pipeline
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Every client action flows through an authenticated 8-stage pipeline combining zero-latency deterministic conversion with multimodal LLM reasoning.
              </p>
            </div>

            {/* Step-by-Step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">STAGE 1: GATEWAY</div>
                <div className="text-slate-300 font-sans text-[11px]">
                  Request hits Express router; <code>helmet</code> injects CSP headers and <code>rateLimiter</code> guards against brute-force (120 req/15m).
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">STAGE 2: AUTH / RBAC</div>
                <div className="text-slate-300 font-sans text-[11px]">
                  <code>authMiddleware</code> verifies Bearer JWT or <code>X-API-Key</code>. Attaches resolved user role (<code>user</code>, <code>analyst</code>, <code>admin</code>).
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">STAGE 3: DISPATCH</div>
                <div className="text-slate-300 font-sans text-[11px]">
                  Payload routed: Deterministic transformations (Base64, Hex, JWT, ROT13) execute in <strong>0ms</strong>; AI audits stream asynchronously.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">STAGE 4: PERSIST</div>
                <div className="text-slate-300 font-sans text-[11px]">
                  Record persisted to PostgreSQL / MongoDB / LocalStore with execution duration telemetry and returned to client.
                </div>
              </div>
            </div>

            {/* Architecture Code Snippet */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400">MIDDLEWARE CHAIN IMPLEMENTATION (server.js)</div>
              <pre className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
{`app.use(helmet());
app.use(cors());
app.use(requestLogger);             // Telemetry timer
app.use(optionalAuth);              // Decodes JWT or API Key
app.use('/api/decode', decoderLimiter, decodeRoutes);
app.use('/api/admin', requireAuth, requireRole(['admin']), adminRoutes);`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: WHERE IS DATA STORED? (RELATIONAL DATABASE & SQL) */}
        {activeTab === 'database' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <h3 className="text-sm font-bold text-emerald-300 font-mono">
                PostgreSQL Relational Schema: Tables, Foreign Keys & Joins
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Data is normalized across relational SQL tables with UUID Primary Keys, Foreign Key cascade rules, and compound indexes.
              </p>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-cyber-darkest border border-emerald-500/30 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>TABLE: users</span>
                  <span className="text-[10px] text-slate-400">PK: id (UUID)</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 font-sans">
                  <li>• <code>id</code>: UUID Primary Key</li>
                  <li>• <code>email</code>: UNIQUE NOT NULL</li>
                  <li>• <code>password_hash</code>: Bcrypt</li>
                  <li>• <code>role</code>: CHECK (user, analyst, admin)</li>
                  <li>• <code>api_key</code>: UNIQUE</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-cyber-darkest border border-emerald-500/30 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>TABLE: decode_records</span>
                  <span className="text-[10px] text-slate-400">FK: user_id</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 font-sans">
                  <li>• <code>id</code>: UUID Primary Key</li>
                  <li>• <code>user_id</code>: REFERENCES users(id)</li>
                  <li>• <code>decoder_type</code>: text, code, qr...</li>
                  <li>• <code>raw_input</code> / <code>decoded_output</code></li>
                  <li>• <code>ai_breakdown</code>: JSONB</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-cyber-darkest border border-emerald-500/30 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>TABLE: chat_messages</span>
                  <span className="text-[10px] text-slate-400">FK: decode_id</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 font-sans">
                  <li>• <code>id</code>: UUID Primary Key</li>
                  <li>• <code>decode_id</code>: REFERENCES decode_records</li>
                  <li>• <code>role</code>: user | assistant</li>
                  <li>• <code>content</code>: TEXT</li>
                </ul>
              </div>
            </div>

            {/* SQL Join Example */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400">RELATIONAL SQL JOIN QUERY (Roadmap 2026 Query Demonstration)</div>
              <pre className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto">
{`SELECT 
  d.id, d.decoder_type, d.decoded_output, d.execution_time_ms,
  u.name AS operator_name, u.email AS operator_email, u.role
FROM decode_records d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.is_bookmarked = TRUE
ORDER BY d.created_at DESC;`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: HOW DO YOU PROVIDE DIFFERENT ROLES? (RBAC) */}
        {activeTab === 'roles' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-2">
              <h3 className="text-sm font-bold text-violet-300 font-mono">
                Role-Based Access Control (RBAC): User vs Analyst vs Admin
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Roles are stored in the database, cryptographically signed into the JWT payload, and enforced by backend middleware guards.
              </p>
            </div>

            {/* Role Comparison Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-cyber-darkest text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Feature / Capability</th>
                    <th className="p-2.5 text-cyan-300">User</th>
                    <th className="p-2.5 text-emerald-300">Security Analyst</th>
                    <th className="p-2.5 text-violet-300">Chief Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-sans">
                  <tr>
                    <td className="p-2.5 font-mono text-slate-300">Run Decoders (Text, Code, QR, Cipher, Vision, Prompt)</td>
                    <td className="p-2.5 text-emerald-400">✓ Unlimited</td>
                    <td className="p-2.5 text-emerald-400">✓ Unlimited</td>
                    <td className="p-2.5 text-emerald-400">✓ Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-slate-300">Save to Vault & Export Markdown / JSON</td>
                    <td className="p-2.5 text-emerald-400">✓ Own records</td>
                    <td className="p-2.5 text-emerald-400">✓ Organization</td>
                    <td className="p-2.5 text-emerald-400">✓ Full access</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-slate-300">Developer API Key Access (X-API-Key)</td>
                    <td className="p-2.5 text-slate-500">✗</td>
                    <td className="p-2.5 text-emerald-400">✓ Personal Key</td>
                    <td className="p-2.5 text-emerald-400">✓ Master Keys</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-slate-300">Admin Telemetry (/api/admin/stats)</td>
                    <td className="p-2.5 text-slate-500">✗ Blocked (403)</td>
                    <td className="p-2.5 text-slate-500">✗ Blocked (403)</td>
                    <td className="p-2.5 text-violet-400">✓ Full Access</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Code Snippet for Role Guard */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400">ROLE GUARD MIDDLEWARE (authMiddleware.js)</div>
              <pre className="p-3.5 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-violet-300 overflow-x-auto">
{`export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: \`Forbidden: Requires one of [\${allowedRoles.join(', ')}]\` 
      });
    }
    next();
  };
};`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
