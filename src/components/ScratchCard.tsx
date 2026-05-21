import { useEffect, useRef, useState } from 'react';
import { playScratchSound, playCoinSound } from '../utils/audio';

interface ScratchCardProps {
  prizeText: string;
  prizeAmount: number;
  onSuccess: (amount: number) => void;
  onClose: () => void;
}

export default function ScratchCard({ prizeText, prizeAmount, onSuccess, onClose }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clearedPercent, setClearedPercent] = useState(0);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Solid scratch texture
    const w = canvas.width = 280;
    const h = canvas.height = 200;

    // Draw scratch background pattern (grey metallic with shiny specks)
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, w, h);

    // Grid details
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < w; i += 8) {
      ctx.fillRect(i, 0, 1, h);
    }
    for (let j = 0; j < h; j += 8) {
      ctx.fillRect(0, j, w, 1);
    }

    // Centered label text on scratch area
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🎁 SCRATCH OVERLAY', w / 2, h / 2 - 15);
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('WIPE 70% TO REVEAL EXTRA REWARDS', w / 2, h / 2 + 10);

  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch vs mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e: any) => {
    setIsDrawing(true);
    handleDraw(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    checkClearedStatus();
  };

  const handleDraw = (e: any) => {
    if (!isDrawing || claimed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();

    if (Math.random() > 0.8) {
      checkClearedStatus();
    }
  };

  const checkClearedStatus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample pixels on a quick grid pattern to check transparency level (high performance)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pix = imgData.data;
    let transparentCount = 0;
    const totalPixels = canvas.width * canvas.height;

    // Sample every 8th pixel to calculate percentage
    for (let i = 3; i < pix.length; i += 32) {
      if (pix[i] === 0) {
        transparentCount++;
      }
    }

    const calculatedPercent = Math.round((transparentCount / (totalPixels / 8)) * 100);
    setClearedPercent(calculatedPercent);

    if (calculatedPercent > 65 && !claimed) {
      setClaimed(true);
      playCoinSound();
      onSuccess(prizeAmount);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-3 w-80 max-w-full shadow-2xl">
      <div className="text-center">
        <h4 className="font-bold text-sm text-amber-400 uppercase tracking-wider font-mono">Scratch & Earn Extra</h4>
        <p className="text-xs text-white/60">Rub away the overlay to reveal rewards</p>
      </div>

      <div className="relative w-[280px] h-[200px] bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center">
        {/* Hidden prize background */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-black/80 leading-tight">
          <span className="text-xs text-amber-300 uppercase tracking-widest font-mono">BONUS JACKPOT REVEALED</span>
          <span className="text-3xl font-extrabold text-white mt-1 font-mono">{prizeText}</span>
          <span className="text-xs text-white/50 mt-2 font-mono">+{clearedPercent}% Revealed</span>
          
          {claimed && (
            <div className="mt-2 bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse font-mono">
              CONGRATS! CASHED IN
            </div>
          )}
        </div>

        {/* Scratch Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleDraw}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleDraw}
          onTouchEnd={handleEnd}
          className={`absolute inset-0 cursor-crosshair select-none touch-none transition-opacity duration-300 ${claimed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
      </div>

      <div className="flex items-center justify-between w-full text-xs font-mono">
        <span className="text-white/50">Eraser: {Math.max(0, Math.min(100, clearedPercent))}%</span>
        {claimed ? (
          <button
            onClick={onClose}
            id="scratch-ok-btn"
            className="bg-gradient-to-tr from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-mono font-bold py-1 px-3 rounded-lg text-[10px]"
          >
            NEXT REEL
          </button>
        ) : (
          <button
            onClick={onClose}
            id="scratch-forfeit-btn"
            className="text-white/40 hover:text-white/70"
          >
            Skip Scratch
          </button>
        )}
      </div>
    </div>
  );
}
