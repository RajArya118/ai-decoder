import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Upload, Sparkles, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';
import ExplanationCard from './ExplanationCard';

const SAMPLE_QRS = [
  {
    label: 'WiFi Config QR',
    payload: 'WIFI:T:WPA;S:CyberNet_5G;P:UltraSecretPass2026;H:false;;'
  },
  {
    label: 'Crypto Wallet QR',
    payload: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F?value=1.5e18'
  },
  {
    label: 'Suspicious Short URL',
    payload: 'http://bit.ly/3xMaliciousRedirectPayload?auth_bypass=1'
  }
];

export default function QRDecoder({ onAskChat, onBookmark }) {
  const [activeMode, setActiveMode] = useState('input'); // 'input', 'file', 'camera'
  const [payload, setPayload] = useState(SAMPLE_QRS[0].payload);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scannerRef = useRef(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (scannerRef.current && cameraActive) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  const handleStartCamera = async () => {
    setError(null);
    try {
      setCameraActive(true);
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setPayload(decodedText);
          handleStopCamera();
          triggerAudit(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError('Camera access error: ' + err.message);
      setCameraActive(false);
    }
  };

  const handleStopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {}
    }
    setCameraActive(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      setPayload(decodedText);
      await triggerAudit(decodedText);
    } catch (err) {
      setError('Could not read QR code from image: ' + (err.message || 'Ensure clear QR image'));
    } finally {
      setLoading(false);
    }
  };

  const triggerAudit = async (qrPayload) => {
    const textToScan = qrPayload || payload;
    if (!textToScan.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.decodeQR({ payload: textToScan, format: 'QR Code' });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Audit failed');
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
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
            <QrCode className="w-5 h-5 text-amber-400" />
            <span>QR & Barcode Security Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Scan QR codes via live camera, image upload, or inspect extracted payloads for security threats.
          </p>
        </div>

        {/* Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Sample Payloads:</span>
          {SAMPLE_QRS.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setPayload(sample.payload);
                setResult(null);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            setActiveMode('input');
            handleStopCamera();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeMode === 'input'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Payload Inspector
        </button>
        <button
          onClick={() => {
            setActiveMode('camera');
            handleStartCamera();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
            activeMode === 'camera'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Webcam Stream</span>
        </button>
        <button
          onClick={() => {
            setActiveMode('file');
            handleStopCamera();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
            activeMode === 'file'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Image QR Upload</span>
        </button>
      </div>

      {/* Camera Pane */}
      {activeMode === 'camera' && (
        <div className="hud-card p-5 rounded-xl border border-amber-500/30 text-center space-y-4">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            Live Scanner Feed
          </div>
          <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-amber-500/30" />
          <p className="text-xs text-slate-400 font-sans">
            Point camera at QR code. Scanned payload will be evaluated automatically.
          </p>
          <button
            onClick={handleStopCamera}
            className="px-4 py-1.5 rounded-md bg-white/10 text-xs font-mono text-slate-300 hover:bg-white/20 transition-colors"
          >
            Close Camera
          </button>
        </div>
      )}

      {/* File Upload Pane */}
      {activeMode === 'file' && (
        <div className="hud-card p-8 rounded-xl border border-dashed border-amber-500/30 text-center space-y-4">
          <div id="qr-file-reader" className="hidden" />
          <Upload className="w-10 h-10 text-amber-400 mx-auto" />
          <div>
            <div className="text-sm font-semibold text-white">Upload QR Code Image</div>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP formats accepted</p>
          </div>
          <label className="inline-block px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono cursor-pointer transition-colors">
            Select File
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Direct Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); triggerAudit(); }} className="hud-card p-5 rounded-xl border border-white/10 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>QR / BARCODE PAYLOAD CONTENT</span>
            <span>{payload.length} chars</span>
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Scanned payload content or raw QR string..."
            className="w-full h-28 p-4 rounded-lg bg-cyber-darkest border border-white/10 font-mono text-xs text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setPayload('');
              setResult(null);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={loading || !payload.trim()}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs font-mono tracking-wider transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>AUDITING PAYLOAD...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>SCAN & RUN SECURITY AUDIT</span>
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
