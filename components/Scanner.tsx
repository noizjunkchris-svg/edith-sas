
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Zap, ZapOff, FlipHorizontal, ZoomIn, ZoomOut, ImageIcon, Loader2 } from 'lucide-react';
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
      if (stream) stream.getTracks().forEach(t => t.stop());
      const constraints = { video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setStatus('scanning');
        const track = newStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        setHasTorch(!!capabilities.torch);
      }
    } catch (err) {
      setError("Autoriser la caméra");
      setStatus('error');
    }
  };

  useEffect(() => { startCamera(); return () => stream?.getTracks().forEach(t => t.stop()); }, [facingMode]);

  const processImage = async (base64: string) => {
    setStatus('analyzing');
    setError(null);
    try {
      const productData = await analyzeProductImage(base64);
      onProductDetected(productData);
      setStatus('success');
      setTimeout(() => setStatus('scanning'), 2000);
    } catch (err: any) {
      let msg = "Erreur de lecture";
      if (err.message?.includes("API key") || err.message?.includes("entity was not found")) {
        msg = "Clé API non détectée (Déployez sur Netlify)";
      }
      setError(msg);
      setStatus('error');
      setTimeout(() => setStatus('scanning'), 5000);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      await processImage(base64Image);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4.2] bg-black rounded-[3rem] overflow-hidden border-2 border-neutral-900 shadow-2xl">
      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-700 ${status === 'analyzing' ? 'opacity-30' : 'opacity-100'}`} />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between pointer-events-none z-20">
        <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white pointer-events-auto active:scale-90 border border-white/10"><FlipHorizontal className="w-5 h-5" /></button>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10"><ImageIcon className="w-5 h-5" /></button>
          <input type="file" ref={fileInputRef} onChange={e => {
            const f = e.target.files?.[0];
            if (f) { const r = new FileReader(); r.onload = ev => processImage((ev.target?.result as string).split(',')[1]); r.readAsDataURL(f); }
          }} className="hidden" />
          {hasTorch && <button onClick={() => {
            stream?.getVideoTracks()[0].applyConstraints({ advanced: [{ torch: !isTorchOn }] } as any);
            setIsTorchOn(!isTorchOn);
          }} className={`p-3 backdrop-blur-xl rounded-full text-white border border-white/10 ${isTorchOn ? 'bg-emerald-500' : 'bg-black/40'}`}><Zap className="w-5 h-5" /></button>}
        </div>
      </div>

      {/* Viewfinder */}
      <div className="absolute inset-0 flex flex-col pointer-events-none z-10">
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="relative w-full aspect-square max-w-[200px] border-2 border-white/5 rounded-3xl">
            {status === 'scanning' && <div className="absolute inset-0 overflow-hidden rounded-3xl"><div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-[scan_2s_ease-in-out_infinite]"></div></div>}
            {status === 'analyzing' && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-xl opacity-50"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-xl opacity-50"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-xl opacity-50"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-xl opacity-50"></div>
          </div>
        </div>

        {/* ACTION ZONE */}
        <div className="pb-10 pt-4 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center">
          {status === 'analyzing' ? (
             <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse mb-8">Analyse en cours...</span>
          ) : status === 'error' ? (
             <div className="mb-8 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full flex items-center gap-2">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-red-400">{error}</span>
             </div>
          ) : (
            <button 
              onClick={captureAndAnalyze}
              className="w-12 h-12 bg-emerald-600 rounded-full border-4 border-white/10 shadow-2xl active:scale-75 transition-all flex items-center justify-center mb-6 group"
            >
              <Camera className="w-5 h-5 text-white group-active:scale-110" />
            </button>
          )}
          <p className="text-white/20 text-[6px] font-black uppercase tracking-[0.5em]">Edith Visual AI 3.0</p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
