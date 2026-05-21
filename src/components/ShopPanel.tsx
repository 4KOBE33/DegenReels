import { ShopItem } from '../types';
import { Sparkles, Trophy, Flame, ChevronRight, Coins } from 'lucide-react';
import { playCoinSound, playTick } from '../utils/audio';

interface ShopPanelProps {
  items: ShopItem[];
  userBalance: number;
  onPurchase: (itemId: string) => void;
}

export default function ShopPanel({ items, userBalance, onPurchase }: ShopPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'luck':
        return <Sparkles className="h-5 w-5 text-amber-400" />;
      case 'bet_limit':
        return <Flame className="h-5 w-5 text-rose-400" />;
      case 'multiplier':
        return <Coins className="h-5 w-5 text-emerald-400" />;
      default:
        return <Trophy className="h-5 w-5 text-blue-400" />;
    }
  };

  const handleBuy = (item: ShopItem) => {
    if (userBalance < item.cost || item.level >= item.maxLevel) return;
    playCoinSound();
    onPurchase(item.id);
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl w-full flex flex-col space-y-3 shadow-2xl">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div>
          <h4 className="font-bold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-amber-400" /> UPGRADE CATALOG
          </h4>
          <p className="text-[10px] text-white/50 font-mono">REINVEST TO DOMINATE THE FEED</p>
        </div>
        <span className="text-xs text-white/40 font-mono">
          Items count: {items.length}
        </span>
      </div>

      {/* Upgrade List cards */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 customize-scrollbar">
        {items.map((item) => {
          const isMax = item.level >= item.maxLevel;
          const canAfford = userBalance >= item.cost;

          return (
            <div
              key={item.id}
              id={`shop-item-card-${item.id}`}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isMax
                  ? 'bg-black/20 border-white/5 opacity-60'
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <span className="bg-black/40 px-1.5 py-0.2 text-[9px] font-mono rounded text-white/60 border border-white/10">
                      LV {item.level}/{item.maxLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-mono block mt-1">
                    🟢 Active Bonus: {item.benefitText}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleBuy(item)}
                id={`shop-buy-btn-${item.id}`}
                disabled={isMax || !canAfford}
                className={`py-1.5 px-3 rounded-lg font-mono font-bold text-[10px] transition-all flex items-center gap-1 shrink-0 ml-1.5 ${
                  isMax
                    ? 'bg-black/30 border border-white/5 text-white/30 cursor-not-allowed'
                    : canAfford
                    ? 'bg-gradient-to-tr from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/20 active:scale-95'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {isMax ? (
                  'MAXED'
                ) : (
                  <>
                     <span>${item.cost.toLocaleString()}</span>
                     <ChevronRight className="h-3 w-3" />
                  </>
                )}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}
