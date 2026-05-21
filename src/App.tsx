import { useState, useRef, useEffect, FormEvent, TouchEvent } from 'react';
import { INITIAL_REELS, MOCK_REEL_COMMENTS } from './data/reelsData';
import { Reel, Comment, ShopItem, UserStats } from './types';
import ReelPlayer from './components/ReelPlayer';
import SlotSpinner from './components/SlotSpinner';
import ScratchCard from './components/ScratchCard';
import ShopPanel from './components/ShopPanel';
import WalletHeader from './components/WalletHeader';
import { playSwipe, playCoinSound, playWin, playLose, playTick } from './utils/audio';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music, 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  HelpCircle, 
  RotateCcw, 
  Gift, 
  Maximize2, 
  UserCheck, 
  DollarSign,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

const UPGRADE_ITEMS: ShopItem[] = [
  {
    id: 'upg_luck',
    name: 'Lucky Charm',
    description: 'Binds cherry & diamond symbols to slot spins, raising winning ratios.',
    cost: 150,
    level: 1,
    maxLevel: 10,
    benefitText: '+12% Win Probability Boost',
    type: 'luck',
    increment: 0.12
  },
  {
    id: 'upg_bet',
    name: 'High Roller Limit',
    description: 'Unlocks maximum betting multiplier options so you can wager massive stakes.',
    cost: 250,
    level: 1,
    maxLevel: 5,
    benefitText: 'Max Bet: $500',
    type: 'bet_limit',
    increment: 100
  },
  {
    id: 'upg_multiplier',
    name: 'Social Payout Booster',
    description: 'Supercharges all non-slot cash bonuses from loot boxes & scratches.',
    cost: 350,
    level: 1,
    maxLevel: 8,
    benefitText: '1.2x Payout Scalar',
    type: 'multiplier',
    increment: 0.2
  },
  {
    id: 'upg_license',
    name: 'SEC Creator License',
    description: 'Increasess allowance drops with legal off-shore slot credits.',
    cost: 500,
    level: 1,
    maxLevel: 5,
    benefitText: ' Allowance: +$1,500',
    type: 'license',
    increment: 500
  }
];

export default function App() {
  // Feed & Reels State
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentReel = reels[currentIdx];

  // User financial profile
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lucky_reels_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      balance: 1000,
      totalBets: 0,
      totalWins: 0,
      highestWin: 0,
      level: 1,
      xp: 15
    };
  });

  // Shop item upgrades
  const [shopUpgrades, setShopUpgrades] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem('lucky_reels_upgrades');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return UPGRADE_ITEMS;
  });

  // Betting state
  const [activeBet, setActiveBet] = useState(10);
  const [betFeePerSwipe, setBetFeePerSwipe] = useState(true);

  // Comments feed panel toggle
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Special mini game overlays
  const [lootBoxOpen, setLootBoxOpen] = useState(false);
  const [lootReward, setLootReward] = useState<string | null>(null);
  const [doubleDownActive, setDoubleDownActive] = useState(false);
  const [coinSide, setCoinSide] = useState<'heads' | 'tails' | null>(null);
  const [tossingCoin, setTossingCoin] = useState(false);
  const [doubleStatus, setDoubleStatus] = useState<string | null>(null);

  // Heart like feedback trigger
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});

  // Floating text notification animations
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const floatIdCounter = useRef(0);

  // Gesture Touch tracking
  const touchStartY = useRef(0);

  // Auto comments sync
  useEffect(() => {
    if (currentReel) {
      setCommentsList(MOCK_REEL_COMMENTS[currentReel.id] || []);
    }
  }, [currentReel]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('lucky_reels_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('lucky_reels_upgrades', JSON.stringify(shopUpgrades));
  }, [shopUpgrades]);

  // Adding float coins animation
  const spawnFloatingText = (text: string) => {
    const id = floatIdCounter.current++;
    setFloatingText(prev => [...prev, { id, text, x: Math.random() * 80 + 10, y: Math.random() * 40 + 30 }]);
    setTimeout(() => {
      setFloatingText(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  // Upgrades values mapping extraction
  const getUpgradeMultiplier = () => {
    const item = shopUpgrades.find(u => u.type === 'multiplier');
    return item ? 1 + (item.level - 1) * item.increment : 1;
  };

  const getUpgradeLuck = () => {
    const item = shopUpgrades.find(u => u.type === 'luck');
    return item ? 1 + (item.level - 1) * item.increment : 1;
  };

  const getUpgradeBetLimit = () => {
    const item = shopUpgrades.find(u => u.type === 'bet_limit');
    return item ? 10 + (item.level - 1) * item.increment : 10;
  };

  const getUpgradeAllowance = () => {
    const item = shopUpgrades.find(u => u.type === 'license');
    return item ? 1000 + (item.level - 1) * item.increment : 1000;
  };

  // Gain XP core handler
  const gainXP = (amount: number, statsProfile: UserStats) => {
    let newXp = statsProfile.xp + amount;
    let currentLvl = statsProfile.level;
    let reqXp = currentLvl * 100 + 50;
    let didLvlUp = false;

    while (newXp >= reqXp) {
      newXp -= reqXp;
      currentLvl += 1;
      reqXp = currentLvl * 100 + 50;
      didLvlUp = true;
    }

    if (didLvlUp) {
      playWin();
      spawnFloatingText(`✨ LEVEL UP! REACHED LVL ${currentLvl} ✨`);
      spawnFloatingText(`+$1,000 Bonus Drop!`);
      return {
        ...statsProfile,
        level: currentLvl,
        xp: newXp,
        balance: statsProfile.balance + 1000
      };
    }
    return {
      ...statsProfile,
      xp: newXp
    };
  };

  // Navigation handlers
  const handleScrollReel = (direction: 'up' | 'down') => {
    playSwipe();
    
    // Deduct sweep-fee gamble if toggled
    let nextBalance = stats.balance;
    let betsCount = stats.totalBets;

    if (betFeePerSwipe) {
      if (stats.balance < activeBet) {
        spawnFloatingText('🚫 Insufficient Balance to swipe-bet!');
        return;
      }
      nextBalance -= activeBet;
      betsCount += 1;
      
      // Attempt casual auto slot spin on swipe!
      const randomWinRatio = Math.random() * getUpgradeLuck();
      if (randomWinRatio > 0.82) {
        const bonusScalar = Math.floor(Math.random() * currentReel.baseMultiplier) + 1;
        const rewardSum = Math.round(activeBet * bonusScalar * getUpgradeMultiplier());
        nextBalance += rewardSum;
        playCoinSound();
        spawnFloatingText(`Swipe Win: +$${rewardSum}! 🎰`);
      } else {
        spawnFloatingText(`Swipe Bet: -$${activeBet}`);
      }
    }

    let nextIdx = currentIdx;
    if (direction === 'down') {
      nextIdx = (currentIdx + 1) % reels.length;
    } else {
      nextIdx = (currentIdx - 1 + reels.length) % reels.length;
    }

    // Reset overlay elements
    setLootBoxOpen(false);
    setLootReward(null);
    setDoubleDownActive(false);
    setDoubleStatus(null);
    setCoinSide(null);

    // Save final state
    setStats(prev => {
      const statsUpdated = {
        ...prev,
        balance: nextBalance,
        totalBets: betsCount
      };
      return gainXP(8, statsUpdated); // swiping gains 8 XP points
    });

    setCurrentIdx(nextIdx);
  };

  // Swipe Gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      handleScrollReel('down');
    } else if (diff < -50) {
      handleScrollReel('up');
    }
  };

  // Like Interaction
  const handleLikeToggle = () => {
    const reelId = currentReel.id;
    const isLiked = likedReels[reelId];
    
    setLikedReels(prev => ({ ...prev, [reelId]: !isLiked }));
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, likes: isLiked ? r.likes - 1 : r.likes + 1 } : r));
    
    if (!isLiked) {
      playTick(550, 0.08);
      // Heart reward slot probability drop!
      const bonusChance = Math.random();
      if (bonusChance > 0.7) {
        setStats(prev => {
          const updated = {
            ...prev,
            balance: prev.balance + 25
          };
          spawnFloatingText('💖 Creative Supporter Bonus: +$25!');
          return gainXP(5, updated);
        });
      }
    }
  };

  // Comments handlers
  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    const myComment: Comment = {
      id: `my_c_${Date.now()}`,
      username: 'lucky_swiper_pro',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      text: newCommentInput,
      likes: 1,
      time: 'Just now'
    };

    setCommentsList(prev => [myComment, ...prev]);
    setReels(prev => prev.map(r => r.id === currentReel.id ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    setNewCommentInput('');
    playTick(400, 0.05);

    // Dynamic AI response comment from the creator!
    setTimeout(() => {
      const creatorReplies = [
        `Thanks for the HYPE! Spin my lever again for good fortune! 🎰`,
        `Absolute legend, good luck on your next scratcher card! 💰`,
        `Apes in together! Let's double our stacks right now! 🐵📈`,
        `Diamond chef Gordon approves this diamond truffle comment 🍕💎`
      ];
      const botResponse: Comment = {
        id: `bot_c_${Date.now()}`,
        username: currentReel.username,
        avatar: currentReel.avatar,
        text: creatorReplies[Math.floor(Math.random() * creatorReplies.length)],
        likes: Math.floor(Math.random() * 50) + 12,
        time: '1s ago'
      };
      setCommentsList(prev => [...prev, botResponse]);
    }, 1500);
  };

  // Upgrade Purchase Logic
  const handleUpgradePurchase = (itemId: string) => {
    const updatedUpgrades = shopUpgrades.map(item => {
      if (item.id === itemId) {
        const nextLvl = item.level + 1;
        const nextCost = item.cost * 2.2;
        return {
          ...item,
          level: nextLvl,
          cost: Math.round(nextCost)
        };
      }
      return item;
    });

    const itemBought = shopUpgrades.find(i => i.id === itemId);
    if (!itemBought) return;

    setStats(prev => {
      const updated = {
        ...prev,
        balance: prev.balance - itemBought.cost
      };
      spawnFloatingText(`Bought ${itemBought.name}! 🚀`);
      return gainXP(25, updated); // Big XP gain on shop upgrades
    });

    setShopUpgrades(updatedUpgrades);
  };

  // Add Free cash allowance
  const handleAddFreeCash = () => {
    const creditDrop = getUpgradeAllowance();
    setStats(prev => {
      const updated = {
        ...prev,
        balance: prev.balance + creditDrop
      };
      playCoinSound();
      spawnFloatingText(`+$${creditDrop} Allowance Dispensed! 💸`);
      return gainXP(15, updated);
    });
  };

  // Reset/Prestige Game
  const handleResetGame = () => {
    localStorage.removeItem('lucky_reels_stats');
    localStorage.removeItem('lucky_reels_upgrades');
    setStats({
      balance: 1000,
      totalBets: 0,
      totalWins: 0,
      highestWin: 0,
      level: 1,
      xp: 15
    });
    setShopUpgrades(UPGRADE_ITEMS);
    setCurrentIdx(0);
    spawnFloatingText('🌟 Reset Completed! Good luck! 💫');
  };

  // Slot Win result handler
  const handleSlotSpinReturn = (winAmount: number) => {
    setStats(prev => {
      const newBalance = prev.balance + winAmount;
      const wasWin = winAmount > 0;
      
      const statsUpdated = {
        ...prev,
        balance: newBalance,
        totalWins: wasWin ? prev.totalWins + 1 : prev.totalWins,
        highestWin: Math.max(prev.highestWin, winAmount)
      };

      if (wasWin) {
        spawnFloatingText(`Won $${winAmount}! 🎰🔥`);
      }
      
      return gainXP(wasWin ? 30 : 5, statsUpdated);
    });
  };

  // Scratch card payout return
  const handleScratchReturn = (revealedMultiplierMultiplier: number) => {
    const winningsValue = Math.round(activeBet * revealedMultiplierMultiplier * getUpgradeMultiplier());
    setStats(prev => {
      const updated = {
        ...prev,
        balance: prev.balance + winningsValue,
        totalWins: prev.totalWins + 1,
        highestWin: Math.max(prev.highestWin, winningsValue)
      };
      spawnFloatingText(`Scratch Reward: +$${winningsValue}! 💎`);
      return gainXP(35, updated);
    });
  };

  // Mini-Game LOOT BOX triggers
  const executeLootBoxCheck = () => {
    const keyCost = 50;
    if (stats.balance < keyCost) {
      spawnFloatingText('🚫 Need $50 for loot chest key!');
      return;
    }

    setLootBoxOpen(true);
    playTick(180, 0.2);

    const rewards = [
      { name: 'DIAMOND PIZZA CRAP', cash: 20 },
      { name: 'VINTAGE CHERRY ROTARY', cash: 120 },
      { name: 'GOLDEN SPATULA FLIP', cash: 400 },
      { name: 'APEFEST NFT TICKET', cash: 8 },
      { name: 'MOCK EXOTIC CONVERTIBLE', cash: 2500 },
      { name: 'LEMON REEL WHEEL SECRETS', cash: 300 }
    ];

    setTimeout(() => {
      const chosen = rewards[Math.floor(Math.random() * rewards.length)];
      const scaledPayout = Math.round(chosen.cash * getUpgradeMultiplier());

      setLootReward(chosen.name);
      setStats(prev => {
        const statsUpdated = {
          ...prev,
          balance: prev.balance - keyCost + scaledPayout,
          totalWins: prev.totalWins + 1,
          highestWin: Math.max(prev.highestWin, scaledPayout)
        };
        spawnFloatingText(`Loot Box: Unlocked ${chosen.name}!`);
        return gainXP(40, statsUpdated);
      });
      playCoinSound();
    }, 1100);
  };

  // Double down challenge tosser
  const handleCoinToss = (choice: 'heads' | 'tails') => {
    if (stats.balance < activeBet) {
      spawnFloatingText('🚫 Insufficient Balance to toss the coin!');
      return;
    }

    setTossingCoin(true);
    setCoinSide(null);
    setDoubleStatus(null);
    playTick(600, 0.4);

    setTimeout(() => {
      const sides: ('heads' | 'tails')[] = ['heads', 'tails'];
      const victoryCoin = sides[Math.floor(Math.random() * sides.length)];
      setCoinSide(victoryCoin);
      setTossingCoin(false);

      if (choice === victoryCoin) {
        const rewardCash = activeBet; // earns 100% payout balance boost
        setStats(prev => {
          const statsUpdated = {
            ...prev,
            balance: prev.balance + rewardCash,
            totalWins: prev.totalWins + 1,
            highestWin: Math.max(prev.highestWin, rewardCash)
          };
          spawnFloatingText(`DOUBLE DOWN HIT! +$${rewardCash}`);
          return gainXP(25, statsUpdated);
        });
        playWin();
        setDoubleStatus(`🏆 WINNER! Coin landed on ${victoryCoin.toUpperCase()}! You won $${rewardCash}.`);
      } else {
        setStats(prev => {
          const statsUpdated = {
            ...prev,
            balance: prev.balance - activeBet
          };
          spawnFloatingText(`DOUBLE DOWN LOST! -$${activeBet}`);
          return gainXP(5, statsUpdated);
        });
        playLose();
        setDoubleStatus(`💀 BUSTED! Coin landed on ${victoryCoin.toUpperCase()}. Lost $${activeBet}.`);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0c0118] text-white font-sans p-4 md:p-6 overflow-x-hidden antialiased relative">
      
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-pink-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Primary Container Frame Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: THE CASINO TERMINAL & STORE (Lg: Col-4) */}
        {/* ==================================================== */}
        <div id="left-sidebar-terminal" className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Neon Title Branding */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white text-xl font-bold">
                $
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white font-mono">LootReel</h1>
                <p className="text-[10px] text-white/55 tracking-wider uppercase font-mono">SWIPE-BET AUDIO REELS</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-amber-500/15 text-yellow-400 font-mono py-0.5 px-2 rounded-full border border-orange-500/20">
                LIVE
              </span>
            </div>
          </div>

          {/* User account wallet details and progress tracking */}
          <WalletHeader 
            stats={stats} 
            onAddFreeCash={handleAddFreeCash} 
            onResetGame={handleResetGame} 
          />

          {/* User Shop Upgrader block */}
          <ShopPanel 
            items={shopUpgrades} 
            userBalance={stats.balance} 
            onPurchase={handleUpgradePurchase} 
          />

          {/* Quick guide and instructional panel */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl text-xs space-y-2 text-white/60 shadow-2xl">
            <h5 className="font-mono text-white font-bold uppercase flex items-center gap-1.5 ">
              <HelpCircle className="h-4 w-4 text-white/50" /> Swipe-Bet Guide
            </h5>
            <ol className="list-decimal pl-4.5 space-y-1.5 font-mono text-[10px] text-white/50">
              <li>Configure your active Bet multiplier inside the smartphone console.</li>
              <li>With <b className="text-pink-400">Swipe-Bet ON</b>, every swipe downwards costs your active bet, but rolls random social payouts instantly.</li>
              <li>Tap the <b className="text-emerald-400">Interactive Specials Tab</b> inside or on the right panels to scratch cards, flip coins, or crack chests!</li>
            </ol>
          </div>

        </div>

        {/* ==================================================== */}
        {/* CENTER COLUMN: THE SMARTPHONE FEED VIEWPORT (Lg: Col-4) */}
        {/* ==================================================== */}
        <div id="middle-viewport" className="lg:col-span-4 flex flex-col items-center">
          
          {/* Aesthetic smartphone shell frame */}
          <div className="w-full max-w-[360px] h-[640px] backdrop-blur-xl bg-slate-950/65 rounded-[36px] p-3 border-4 border-white/10 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Top Phone speaker band */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-white/10 backdrop-blur-md rounded-full z-30 flex items-center justify-center border border-white/10">
              <div className="w-12 h-1 bg-black/60 rounded-full" />
            </div>

            {/* Inner viewport shell containing active reel */}
            <div 
              className="flex-1 rounded-[26px] overflow-hidden bg-black relative flex flex-col select-none border border-white/5"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Dynamic canvas video loop player matching the current visual style */}
              <ReelPlayer reel={currentReel} isActive={true} />

              {/* Float Money texts notifications rendering */}
              {floatingText.map((f) => (
                <div
                  key={f.id}
                  className="absolute pointer-events-none text-xs font-mono font-black text-amber-400 p-1.5 bg-black/75 rounded border border-amber-500/20 animate-bounce shadow-lg z-40 transition-all duration-1000"
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}
                >
                  ✨ {f.text}
                </div>
              ))}

              {/* Black overlay header band with info */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 pt-5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>SWIPE FEEDS CHANCE: {currentReel.baseMultiplier}x</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-pink-400">
                  REF #00{currentIdx + 1}
                </div>
              </div>

              {/* OVERLAY: Creator profile card & social details */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-20 p-4 pt-14 flex flex-col space-y-2.5">
                
                {/* Username sound layout */}
                <div className="flex items-center gap-2">
                  <img 
                    src={currentReel.avatar} 
                    alt={currentReel.username} 
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                  <div>
                    <span className="font-bold text-xs text-white flex items-center gap-1">
                      @{currentReel.username}
                      <UserCheck className="h-3.5 w-3.5 text-blue-400 fill-blue-500" />
                    </span>
                    <span className="text-[8px] text-white/40 block font-mono">Reel Multiplier: {currentReel.baseMultiplier}X</span>
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-[11px] text-slate-100 leading-relaxed font-sans line-clamp-3">
                  {currentReel.description}
                </p>

                {/* Hashtags list */}
                <div className="flex gap-1.5 flex-wrap">
                  {currentReel.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-semibold text-pink-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Active music soundtrack strip */}
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono bg-black/40 border border-white/10 p-1.5 rounded backdrop-blur-xs">
                  <Music className="h-3 w-3 animate-spin duration-3000" />
                  <span className="truncate">{currentReel.soundTrack}</span>
                </div>

              </div>

              {/* RIGHT SIDEBAR GESTURES: Hearts, Comment clicks, Spin triggers */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-4">
                
                {/* Like / Heart lock */}
                <button 
                  onClick={handleLikeToggle}
                  className="flex flex-col items-center group active:scale-90 transition-all focus:outline-hidden"
                >
                  <div className={`p-2.5 rounded-full transition-all ${
                    likedReels[currentReel.id] 
                      ? 'bg-rose-600/20 text-rose-500 border border-rose-500/40' 
                      : 'bg-black/60 text-white/90 hover:bg-black/80'
                  }`}>
                    <Heart className={`h-5 w-5 ${likedReels[currentReel.id] ? 'fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[9px] text-white font-mono mt-0.5">{currentReel.likes.toLocaleString()}</span>
                </button>

                {/* Open Comments trigger */}
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="flex flex-col items-center hover:scale-105 active:scale-90 transition-all focus:outline-hidden"
                >
                  <div className={`p-2.5 rounded-full bg-black/60 text-white/90 hover:bg-black/80 ${showComments ? 'border border-pink-500/30 text-pink-400' : ''}`}>
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] text-white font-mono mt-0.5">{currentReel.commentsCount}</span>
                </button>

                {/* Play active feature action button */}
                <span className="h-0.5 bg-slate-800/40 w-full" />

                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 opacity-60 blur-xs animate-ping" />
                  <button
                    onClick={() => {
                      spawnFloatingText('💫 Special Payout Loaded!');
                      playTick(700, 0.1);
                    }}
                    className="p-3.5 rounded-full bg-linear-to-tr from-pink-500 to-amber-500 text-slate-950 hover:scale-110 active:scale-90 transition-all flex items-center justify-center font-bold text-lg relative z-10"
                  >
                    🚀
                  </button>
                </div>
                <span className="text-[8px] text-center text-amber-300 mt-0.5 font-bold font-mono">GAMBLE</span>

              </div>

            </div>

            {/* Bottom Phone controls bar: Betting HUD adjustments */}
            <div className="h-16 shrink-0 mt-3 pt-1 border-t border-white/10 flex items-center justify-between px-2 text-xs font-mono">
              <div>
                <span className="text-[8px] text-white/50 block font-mono">Bet Per Swipe</span>
                <div className="flex items-center gap-1.5 mt-0.5 bg-black/40 rounded border border-white/10 p-1">
                  <button 
                    onClick={() => {
                      playTick(300, 0.05);
                      setActiveBet(prev => Math.max(5, prev - 5));
                    }}
                    className="text-white/60 hover:text-white shrink-0 font-bold px-1"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-[10px] w-9 text-center">${activeBet}</span>
                  <button 
                    onClick={() => {
                      playTick(450, 0.05);
                      setActiveBet(prev => Math.min(getUpgradeBetLimit(), prev + 5));
                    }}
                    className="text-white/60 hover:text-white shrink-0 font-bold px-1"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Swipe-Bet active toggle checklist */}
              <div className="text-right">
                <span className="text-[8px] text-white/50 block font-mono">Swipe-Gamble</span>
                <button
                  onClick={() => setBetFeePerSwipe(!betFeePerSwipe)}
                  className={`mt-1 font-bold text-[9px] py-1 px-2.5 rounded transition-all flex items-center gap-1 border ${
                    betFeePerSwipe
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/35'
                  }`}
                >
                  <span>{betFeePerSwipe ? '🟢 ACTIVE' : '🔴 MUTED'}</span>
                </button>
              </div>
            </div>

            {/* Quick manual navigation arrows */}
            <div className="absolute left-4.5 bottom-1/2 translate-y-1/2 z-30 flex flex-col space-y-1 bg-black/60 rounded-full border border-white/10 p-1">
              <button 
                onClick={() => handleScrollReel('up')} 
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-hidden"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleScrollReel('down')} 
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-hidden"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: THE ACTIVE GAMBLING HUB & EVENTS (Lg: Col-4) */}
        {/* ==================================================== */}
        <div id="right-specials-sidebar" className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Headline interactive event category */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col space-y-3.5 shadow-md">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> INTERACTIVE MINI-GAME
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">MATCHES THIS CREATOR\'S REEL TYPE</p>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono py-0.5 px-2 rounded border border-amber-500/20">
                ACTIVE FEATURE
              </span>
            </div>

            {/* RENDER SPECIFIC INTERACTIVE SLOT CARD OVERLAY */}
            <div className="flex justify-center py-2">
              {currentReel.specialFeature === 'slot' && (
                <SlotSpinner 
                  betValue={activeBet} 
                  onSpinEnd={handleSlotSpinReturn} 
                  luckMultiplier={getUpgradeLuck()}
                />
              )}

              {currentReel.specialFeature === 'scratch' && (
                <ScratchCard 
                  prizeText={`$${(activeBet * 8).toLocaleString()}`} 
                  prizeAmount={8} // 8x base multiplier payout
                  onSuccess={handleScratchReturn}
                  onClose={() => handleScrollReel('down')}
                />
              )}

              {currentReel.specialFeature === 'loot_box' && (
                <div className="w-full bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col items-center space-y-3 shadow-md">
                  <div className="text-center">
                    <h4 className="font-mono text-xs font-bold text-red-400 flex items-center gap-1.5 justify-center">
                      <Gift className="h-4 w-4" /> CHEF'S LUXURY CHEST
                    </h4>
                    <p className="text-[10px] text-white/50">Costs $50 simulated token to crack the seal</p>
                  </div>

                  <div className={`w-32 h-32 flex items-center justify-center rounded-xl bg-black/50 border-2 border-dashed border-white/20 relative cursor-pointer group hover:border-white/40 transition-all ${lootBoxOpen ? 'animate-bounce' : ''}`}>
                    {lootReward ? (
                      <div className="text-center p-2 animate-pulse leading-snug">
                        <span className="text-amber-400 font-bold block text-sm">CLAIMED!</span>
                        <span className="text-white font-mono text-xs block mt-1">{lootReward}</span>
                      </div>
                    ) : (
                      <div className="text-center text-4xl group-hover:scale-110 transition-all select-none">
                        📦
                      </div>
                    )}
                  </div>

                  <button
                    onClick={executeLootBoxCheck}
                    id="chef-loot-crack-btn"
                    disabled={lootBoxOpen && !lootReward}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-mono font-bold text-xs py-2 px-3 rounded-lg shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    {lootReward ? '📦 OPENED' : '🔑 PAY $50 & CRACK CHEST'}
                  </button>
                </div>
              )}

              {currentReel.specialFeature === 'double' && (
                <div className="w-full bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col space-y-3.5 shadow-md">
                  <div className="text-center">
                    <h4 className="font-mono text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                      🪙 DOUBLE OR NOTHING COIN TOSS
                    </h4>
                    <p className="text-[10px] text-white/50">Risk active bet value to earn duplicate multipliers</p>
                  </div>

                  {/* Coin toss animation grid */}
                  <div className="flex justify-center py-2.5">
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black font-mono transition-all duration-300 relative overflow-hidden ${
                      tossingCoin 
                        ? 'animate-spin border-amber-500 bg-amber-950/20' 
                        : 'border-white/15 bg-black/30 text-amber-300 shadow-md'
                    }`}>
                      {coinSide ? (coinSide === 'heads' ? '🦅 HEAD' : '🪙 TAIL') : '🏆'}
                    </div>
                  </div>

                  {doubleStatus && (
                    <p className="text-[10px] font-mono p-1 rounded bg-black/40 text-center text-amber-300 border border-white/5 animate-pulse">
                      {doubleStatus}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCoinToss('heads')}
                      id="coin-heads-btn"
                      disabled={tossingCoin}
                      className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-xs py-2 px-3 rounded-lg transition-all"
                    >
                      🦅 HEADS
                    </button>
                    <button
                      onClick={() => handleCoinToss('tails')}
                      id="coin-tails-btn"
                      disabled={tossingCoin}
                      className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-xs py-2 px-3 rounded-lg transition-all"
                    >
                      🪙 TAILS
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* SIMULATED LIVE SOCIAL MEDIA COMMENT SECTION */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col space-y-3 flex-1 min-h-[250px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-xs text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-pink-400" /> Live Comments ({commentsList.length})
              </span>
              <button 
                onClick={() => setCommentsList(MOCK_REEL_COMMENTS[currentReel.id] || [])}
                id="comment-reset-btn"
                className="text-white/40 hover:text-white/70 transition-all font-mono text-[9px] flex items-center gap-1"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reload
              </button>
            </div>

            {/* Scrollable comment list */}
            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 pr-1 customize-scrollbar">
              {commentsList.map((comm) => (
                <div key={comm.id} id={`comment-node-${comm.id}`} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <img 
                    src={comm.avatar} 
                    alt={comm.username} 
                    className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                  />
                  <div className="bg-black/40 p-2 rounded-xl flex-1 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/90">@{comm.username}</span>
                      <span className="text-[9px] text-white/40 font-mono">{comm.time}</span>
                    </div>
                    <p className="text-white/75 mt-1">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post new comment form */}
            <form onSubmit={handleAddComment} className="flex gap-2 border-t border-white/10 pt-2 shrink-0">
              <input 
                type="text" 
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                placeholder="Type a comment or question..."
                id="comment-input-field"
                className="flex-grow bg-black/40 border border-white/10 focus:border-white/20 focus:outline-hidden rounded-lg px-2.5 py-1.5 text-xs font-sans text-white/90 h-9"
              />
              <button
                type="submit"
                id="comment-submit-btn"
                className="bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs px-3 rounded-lg h-9 active:scale-95 transition-all shrink-0"
              >
                Send
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
