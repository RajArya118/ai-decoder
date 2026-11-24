import React, { useState } from 'react';
import { ScanEye, Upload, Sparkles, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../../services/api';
import ExplanationCard from './ExplanationCard';

export default function ImageDecoder({ onAskChat, onBookmark }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('Extract visible text (OCR), analyze diagram structures, and audit security');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleDecode = async (e) => {
    e?.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('prompt', prompt);

      const data = await api.decodeImage(formData);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Image analysis failed');
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
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ScanEye className="w-5 h-5 text-cyan-400" />
          <span>Multimodal Vision & OCR Decoder</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Extract text from images, dissect system architectures, and perform vision-based security analysis.
        </p>
      </div>

      {/* Upload & Inspect Form */}
      <form onSubmit={handleDecode} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        {/* Dropzone */}
        {!previewUrl ? (
          <label className="border-2 border-dashed border-cyber-border hover:border-cyan-400/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cyber-darkest/40">
            <Upload className="w-10 h-10 text-cyan-400/70 mb-2" />
            <div className="text-sm font-semibold text-white">Click or drag image here</div>
            <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP, GIF up to 10MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-cyber-darkest border border-white/10 p-3 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="w-32 h-32 object-cover rounded-lg border border-white/10 shrink-0"
            />
            <div className="flex-1 space-y-1 text-xs font-mono text-slate-300">
              <div className="text-white font-semibold">{selectedFile?.name}</div>
              <div className="text-slate-400">
                Size: {(selectedFile?.size / 1024).toFixed(1)} KB | Type: {selectedFile?.type}
              </div>
              <div className="text-cyan-400 flex items-center space-x-1 pt-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Ready for Multimodal Vision Decoding</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors self-start sm:self-center"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Prompt */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5">
            VISION FOCUS DIRECTIVE
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. Extract code snippets, explain database architecture, or OCR text..."
            className="w-full px-3.5 py-2 rounded-lg bg-cyber-darkest border border-white/10 font-sans text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={handleClear}
            disabled={!selectedFile}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-cyan-glow flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>ANALYZING VISION MATRIX...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>ANALYZE IMAGE</span>
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
