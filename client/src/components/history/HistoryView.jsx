import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Search, 
  Bookmark, 
  Trash2, 
  Download, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export default function HistoryView({ onSelectRecord, onAskChat }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({
        type: selectedType,
        search,
        bookmarkedOnly: bookmarkedOnly ? 'true' : 'false'
      });
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedType, bookmarkedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleToggleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.toggleBookmark(id);
      if (res.success) {
        setItems((prev) =>
          prev.map((item) =>
            (item.id === id || item._id === id)
              ? { ...item, isBookmarked: !item.isBookmarked }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this record from your vault?')) return;
    try {
      const res = await api.deleteHistoryItem(id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format) => {
    window.open(`/api/history/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Archive className="w-5 h-5 text-cyan-400" />
            <span>Decoding Vault & History Records</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Indexed archive of all previous decoding operations with search, filtering, and 1-click export.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('markdown')}
            className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-white/10 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
            title="Export Vault as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .MD</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-white/10 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
            title="Export Vault as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .JSON</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="hud-card p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inputs, outputs, or summaries..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-cyber-darkest border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-cyber-surface border border-white/10 rounded-md px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Types</option>
            <option value="text">Text Decodes</option>
            <option value="code">Code Audits</option>
            <option value="cipher">Ciphers & Encodings</option>
            <option value="qr">QR / Barcodes</option>
            <option value="image">Vision OCR</option>
            <option value="prompt">Prompt Optimizations</option>
          </select>

          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`px-3 py-1.5 rounded-md border transition-colors flex items-center space-x-1 ${
              bookmarkedOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* Item List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-mono text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>QUERYING VAULT...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-xl border border-white/5 space-y-2">
          <Archive className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No records found in Vault</div>
          <p className="text-xs text-slate-500">
            Execute a decode operation above to automatically archive records here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const id = item.id || item._id;
            const explanation = item.aiExplanation || {};
            return (
              <div
                key={id}
                onClick={() => onSelectRecord(item)}
                className="hud-card hover:hud-card-active p-4 rounded-xl border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all duration-200 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-500/40 uppercase">
                      {item.decoderType}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {explanation.detectedFormat || 'Unknown Format'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleToggleBookmark(id, e)}
                      className={`p-1.5 rounded transition-colors ${
                        item.isBookmarked
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(id, e)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content preview */}
                <div className="text-xs font-sans text-slate-300 line-clamp-2">
                  <span className="text-cyan-400 font-mono font-medium mr-1.5">Summary:</span>
                  {explanation.summary || item.decodedOutput}
                </div>

                {/* Raw Input snippet */}
                <div className="p-2 rounded bg-cyber-darkest border border-white/5 font-mono text-[11px] text-slate-400 truncate">
                  Input: {item.rawInput}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
