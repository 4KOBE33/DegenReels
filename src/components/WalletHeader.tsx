import { useState } from 'react';
import { UserStats } from '../types';
import { Wallet, ShieldAlert, Award, TrendingUp, Sparkles, Check, Send } from 'lucide-react';
import { playCoinSound, playWin } from '../utils/audio';

interface WalletHeaderProps {
  stats: UserStats;
  onAddFreeCash: () => void;
  onResetGame: () => void;
}

export default function WalletHeader({ stats, onAddFreeCash, onResetGame }: WalletHeaderProps) {
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [cashoutStep, setCashoutStep] = useState<'idle' | 'routing' | 'wire' | 'success'>('idle');
  const [cashoutRef, setCashoutRef] = useState('');
  const [wireLog, setWireLog] = useState<string[]>([]);

  // Calculate XP ratio
  const nextLevelXP = stats.level * 100 + 50;
  const xpPercent = Math.min(100, Math.round((stats.xp / nextLevelXP) * 100));

  const triggerCashOut = () => {
    if (stats.balance <= 0) return;
    setShowCashOutModal(true);
    setCashoutStep('routing');
    setWireLog(['Initializing secure degen transmission protocol...', 'Verifying simulated bank reserves...']);

    setTimeout(() => {
      setWireLog(prev => [...prev, 'Routing off-shore through fiscal slot paradise...']);
      setCashoutStep('wire');
    }, 1200);

    setTimeout(() => {
      setWireLog(prev => [...prev, 'Evading mock tax auditors...', 'Authorizing instant slot deposit direct wire...']);
    }, 2400);

    setTimeout(() => {
      setWireLog(prev => [...prev, 'CROWNS INSTANTLY DISPATCHED TO MOCK WALLET!']);
      setCashoutStep('success');
      playWin();
    }, 3800);
  };

  const getRank = (level: number) => {
    if (level < 3) return 'Slightly Curious';
    if (level < 6) return 'Double-Down General';
    if (level < 10) return 'Lootbox Baron';
    if (level < 15) return 'Cherry Spinner Legend';
    return 'Almighty Whale Sovereign';
  };

  return (
    <div className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Core Bank Account details */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-amber-600/30 border border-white/10 rounded-xl">
            <Wallet className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-mono block">YOUR DEGEN ACCOUNT</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                ${stats.balance.toLocaleString()}
              </span>
              <span className="text-xs text-white/50 font-mono">USD</span>
            </div>
            
            {/* Rank display */}
            <div className="flex items-center gap-1.5 mt-1 text-[10px] bg-black/40 px-2 py-0.5 rounded border border-white/5 w-fit text-amber-300 font-mono">
              <Award className="h-3 w-3" />
              <span>Rank: {getRank(stats.level)}</span>
            </div>
          </div>
        </div>

        {/* Level & XP progression tracker */}
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] text-white/60 font-mono uppercase">Level {stats.level}</span>
            <span className="text-[10px] text-white/40 font-mono">
              {stats.xp} / {nextLevelXP} XP
            </span>
          </div>
          {/* Progress bar container */}
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[9px] text-white/40 font-mono">
            <span>+{xpPercent}% to level boost</span>
            <span className="text-emerald-400 font-bold">+$1,000 allowance drop</span>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddFreeCash}
            id="wallet-claim-allowance-btn"
            className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 py-1.5 px-3 rounded-lg font-mono font-bold text-[11px] transition-all flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>ALLOWANCE</span>
          </button>

          <button
            onClick={triggerCashOut}
            id="wallet-cashout-btn"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 py-1.5 px-3 rounded-lg font-mono font-bold text-[11px] transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <span>🏦 CASH OUT NOW</span>
          </button>
        </div>

      </div>

      {/* Stats counter strip at bottom */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 mt-4 pt-3 text-[10px] font-mono text-white/60">
        <div className="flex items-center justify-between px-1">
          <span>Swipes & Bets:</span>
          <span className="text-white font-bold">{stats.totalBets}</span>
        </div>
        <div className="flex items-center justify-between px-1 border-x border-white/10">
          <span>Wins Triggered:</span>
          <span className="text-emerald-400 font-bold">{stats.totalWins}</span>
        </div>
        <div className="flex items-center justify-between px-1">
          <span>Highest Payout:</span>
          <span className="text-amber-400 font-bold">${stats.highestWin.toLocaleString()}</span>
        </div>
      </div>

      {/* CASHOUT POPUP MODAL */}
      {showCashOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/20 rounded-2xl p-6 w-full max-w-sm flex flex-col space-y-4 shadow-2xl relative">
            <h3 className="font-bold text-lg text-white uppercase tracking-widest font-mono flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-400" /> SECURE DEPOSIT
            </h3>

            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Transferring your simulated fortune of <span className="text-emerald-400 font-extrabold font-mono">${stats.balance.toLocaleString()}</span> to your fictitious bank account/crypto hardware wallet...
            </p>

            {/* Wire terminal output */}
            <div className="w-full bg-black/60 p-3 rounded-xl border border-white/10 h-32 overflow-y-auto space-y-1 text-[10px] font-mono text-emerald-400">
              {wireLog.map((log, idx) => (
                <div key={idx} className="flex gap-1">
                  <span className="text-slate-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
              {cashoutStep !== 'success' && (
                <div className="animate-pulse flex items-center gap-1">
                  <span className="text-slate-500 select-none">&gt;</span>
                  <span className="bg-emerald-500 h-3 w-1.5 inline-block" />
                </div>
              )}
            </div>

            {/* Success message or action button */}
            {cashoutStep === 'success' ? (
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">TRANSFER CONFIRMED</h4>
                  <p className="text-[10px] text-white/45 font-mono">MOCK CONFIRMATION REF: LKY-RW-{Math.floor(Math.random() * 900000 + 100000)}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCashOutModal(false);
                      setCashoutStep('idle');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 py-1.5 px-3 rounded-lg text-xs font-mono font-bold text-white/80"
                  >
                    Close & Keep Grinding
                  </button>
                  <button
                    onClick={() => {
                      onResetGame();
                      setShowCashOutModal(false);
                      setCashoutStep('idle');
                    }}
                    className="bg-rose-950/80 hover:bg-rose-905 border border-rose-800/60 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold text-rose-300"
                  >
                    Reset & Prestige
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
