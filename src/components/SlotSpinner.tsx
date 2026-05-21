import { useState, useEffect } from 'react';
import { playTick, playWin, playLose } from '../utils/audio';

interface SlotSpinnerProps {
  betValue: number;
  onSpinEnd: (winAmount: number) => void;
  luckMultiplier: number; // multiplier from shop upgrades
}

const SYMBOLS = ['🎰', '🍒', '🍉', '💎', '🔔', '👑', '7️⃣'];
const PAYOUTS: Record<string, number> = {
  '🍒': 2,
  '🍉': 5,
  '🔔': 10,
  '💎': 20,
  '👑': 50,
  '7️⃣': 120,
  '🎰': 250,
};

export default function SlotSpinner({ betValue, onSpinEnd, luckMultiplier }: SlotSpinnerProps) {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['7️⃣', '🎰', '💎']);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [payoutMultiplier, setPayoutMultiplier] = useState(0);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinMessage(null);
    setPayoutMultiplier(0);

    // Audio effects start
    playTick(200, 0.1);

    // Define length of spin for each reel
    const spinTimes = [1200, 1800, 2400];
    const intervals: any[] = [];

    // Start vertical scrolling simulation for all reels
    reels.forEach((_, reelIdx) => {
      const interval = setInterval(() => {
        setReels((prev) => {
          const updated = [...prev];
          updated[reelIdx] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return updated;
        });
        playTick(400 + reelIdx * 100, 0.04);
      }, 80);
      intervals.push(interval);
    });

    // Handle stops sequentially for dopamine-building suspense!
    spinTimes.forEach((time, reelIdx) => {
      setTimeout(() => {
        clearInterval(intervals[reelIdx]);
        playTick(600 + reelIdx * 150, 0.15);

        // On final column stop
        if (reelIdx === 2) {
          setTimeout(() => {
            evaluateOutcome();
          }, 150);
        }
      }, time);
    });
  };

  const evaluateOutcome = () => {
    setSpinning(false);
    
    setReels((currentReels) => {
      const [r1, r2, r3] = currentReels;
      let multiplier = 0;
      let msg = '';

      // Hardcode higher luck chances by replacing symbols if shop level is high
      let finalReels = [...currentReels];
      if (luckMultiplier > 1.0 && Math.random() < (luckMultiplier - 1) * 0.12) {
        // Boosted luck - force matches
        const luckChoice = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 2)) + 1]; // cherry to crown
        finalReels = [luckChoice, luckChoice, luckChoice];
        multiplier = PAYOUTS[luckChoice];
        msg = `LUCK UPGRADE HIT! 3x ${luckChoice}!`;
      } else {
        // Standard slot check
        if (r1 === r2 && r2 === r3) {
          multiplier = PAYOUTS[r1];
          msg = `🌟 GRAND TRIPLE ${r1}! 3x Payout! 🌟`;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
          const matchSym = r1 === r2 ? r1 : r3;
          multiplier = Math.ceil(PAYOUTS[matchSym] * 0.4);
          msg = `✨ Double ${matchSym}! Partial Payout! ✨`;
        } else {
          // Consolation prize
          multiplier = 0;
          msg = 'No matches! Try another reel!';
        }
      }

      setReels(finalReels);
      setPayoutMultiplier(multiplier);

      if (multiplier > 0) {
        playWin();
        setWinMessage(msg);
        onSpinEnd(betValue * multiplier);
      } else {
        playLose();
        setWinMessage(msg);
        onSpinEnd(0);
      }

      return finalReels;
    });
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center space-y-4 w-full shadow-2xl">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h4 className="font-bold text-sm text-pink-400 uppercase tracking-widest font-mono">Slot Stream bet</h4>
          <p className="text-[10px] text-white/50 font-mono">UPGRADE LUCK TO FORCE TRIPLE-7s</p>
        </div>
        <div className="bg-black/40 px-2 py-0.5 rounded border border-white/10 text-white font-mono text-xs">
          BET: ${betValue}
        </div>
      </div>

      {/* Retro mechanical physical Slot Machine Box */}
      <div className="w-full bg-black/40 p-4 rounded-xl border border-white/10 relative shadow-inner overflow-hidden">
        {/* Ambient scanner beam screen */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent pointer-events-none animate-pulse" />
        
        {/* Three reels grid */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {reels.map((symbol, idx) => (
            <div
              key={idx}
              id={`slot-reel-col-${idx}`}
              className={`bg-black/50 h-24 rounded-lg flex items-center justify-center text-4xl border shadow-inner transition-all duration-150 ${
                spinning
                  ? 'border-pink-500 bg-pink-950/30 scale-95 shadow-pink-500/20 animate-pulse'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={spinning ? 'animate-bounce' : ''}>
                {symbol}
              </div>
            </div>
          ))}
        </div>

        {/* Level Payout Highlight */}
        {winMessage && (
          <div className={`mt-3 text-center text-[10px] font-mono p-1 rounded border overflow-hidden ${
            payoutMultiplier > 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {winMessage}
          </div>
        )}
      </div>

      {/* Handle SPIN activation */}
      <div className="w-full flex gap-3">
        <button
          onClick={startSpin}
          id="slot-lever-pull-btn"
          disabled={spinning}
          className={`flex-1 font-mono font-bold tracking-wider py-2 px-4 rounded-xl shadow-lg text-xs flex items-center justify-center transition-all ${
            spinning
              ? 'bg-pink-950 text-pink-400 border border-pink-700/30 cursor-not-allowed scale-98'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 hover:shadow-lg hover:shadow-orange-500/20 active:scale-95'
          }`}
        >
          {spinning ? 'SPINNING LIVE...' : '🎰 SPIN REEL'}
        </button>
      </div>

      {/* Mini Rewards Dictionary */}
      <div className="grid grid-cols-4 gap-2 w-full text-[9px] font-mono text-white/55 border-t border-white/10 pt-2.5">
        <div className="flex justify-between">
          <span>🍒</span>
          <span className="text-emerald-400 font-bold">2X</span>
        </div>
        <div className="flex justify-between">
          <span>🍉</span>
          <span className="text-emerald-400 font-bold">5X</span>
        </div>
        <div className="flex justify-between">
          <span>🔔</span>
          <span className="text-emerald-400 font-bold">10X</span>
        </div>
        <div className="flex justify-between">
          <span>💎</span>
          <span className="text-emerald-400 font-bold">20X</span>
        </div>
        <div className="flex justify-between">
          <span>👑</span>
          <span className="text-emerald-400 font-bold">50X</span>
        </div>
        <div className="flex justify-between">
          <span>7️⃣</span>
          <span className="text-emerald-400 font-bold">120X</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span>🎰 Jackpot:</span>
          <span className="text-pink-400 font-bold">250X</span>
        </div>
      </div>

    </div>
  );
}
