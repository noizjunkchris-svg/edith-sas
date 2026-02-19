
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Zap, FlipHorizontal, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { analyzeProductImage } from '../services/geminiService';
import { Product, ScanStatus } from '../types';

interface ScannerProps {
  onProductDetected: (product: Partial<Product>) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onProductDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const constraints = { 
        video: { 
          facingMode, 
          width: { ideal: 1920 }, // On demande le max
          height: { ideal: 1080 },
          focusMode: 'continuous'
        } as any 
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setStatus('scanning');
        
        const track = newStream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
        setHasTorch(!!(capabilities as any).torch);
      }
    } catch (err) {
      setError("Accès caméra refusé.");
      setStatus('error');
    }
  };

  useEffect(() => { 
    startCamera(); 
    return () => stream?.getTracks().forEach(t => t.stop()); 
  }, [facingMode]);

  const processImage = async (base64: string) => {
    setStatus('analyzing');
    setError(null);
    try {
      const productData = await analyzeProductImage(base64);
      onProductDetected(productData);
      setStatus('success');
      setTimeout(() => setStatus('scanning'), 1500);
    } catch (err: any) {
      setError(err.message || "Erreur de lecture");
      setStatus('error');
      setTimeout(() => setStatus('scanning'), 4000);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || status === 'analyzing') return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Capture haute définition (1280px) pour Gemini
    canvas.width = 1280;
    canvas.height = (video.videoHeight / video.videoWidth) * 1280;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
      await processImage(base64Image);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[3/4.5] bg-neutral-950 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover transition-all duration-700 ${status === 'analyzing' ? 'scale-105 blur-xl opacity-40' : 'scale-100 opacity-100'}`} 
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 flex flex-col z-10">
        <div className="p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="p-4 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 active:scale-90 transition-transform">
            <FlipHorizontal className="w-5 h-5" />
          </button>
          
          <div className="flex gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 active:scale-90 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { 
                  const r = new FileReader(); 
                  r.onload = ev => processImage((ev.target?.result as string).split(',')[1]); 
                  r.readAsDataURL(f); 
                }
              }} className="hidden" />
            {hasTorch && (
              <button onClick={() => {
                  stream?.getVideoTracks()[0].applyConstraints({ advanced: [{ torch: !isTorchOn }] } as any);
                  setIsTorchOn(!isTorchOn);
                }} className={`p-4 backdrop-blur-xl rounded-full border border-white/10 transition-all ${isTorchOn ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-black/40 text-white'}`}>
                <Zap className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="relative w-full aspect-square max-w-[280px]">
            {/* Corners UI */}
            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[5px] border-l-[5px] border-emerald-500 rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[5px] border-r-[5px] border-emerald-500 rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[5px] border-l-[5px] border-emerald-500 rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[5px] border-r-[5px] border-emerald-500 rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            
            {status === 'scanning' && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,1)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
              </div>
            )}
            
            {status === 'analyzing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/20 rounded-3xl backdrop-blur-md border border-emerald-500/30">
                <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mb-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 animate-pulse">Extraction...</span>
              </div>
            )}
          </div>
        </div>

        <div className="pb-16 pt-8 px-10 bg-gradient-to-t from-black to-transparent flex flex-col items-center gap-8">
          {error && (
            <div className="w-full flex items-center gap-4 p-5 bg-red-600/90 backdrop-blur-xl border border-white/20 rounded-[2rem] animate-in zoom-in-95">
              <AlertCircle className="w-6 h-6 text-white shrink-0" />
              <p className="text-[11px] font-black text-white uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

          {status !== 'analyzing' && (
            <button 
              onClick={captureAndAnalyze}
              className="group relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <Camera className="w-10 h-10 text-black" />
            </button>
          )}
          
          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.6em]">Edith Visual Core 3.5</p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(280px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
