import React, { useState, useRef, useEffect, FormEvent, TouchEvent, MouseEvent, WheelEvent } from 'react';
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

  // Comments and Specials Drawers inside phone
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showSpecialsDrawer, setShowSpecialsDrawer] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Swipe-Gamble Slot outcomes
  const [swipeSpinActive, setSwipeSpinActive] = useState(false);
  const [swipeReelsSymbols, setSwipeReelsSymbols] = useState<string[]>(['🎰', '🍒', '💎']);
  const [swipeSpinPayout, setSwipeSpinPayout] = useState<number | null>(null);
  const [swipeSpinMulti, setSwipeSpinMulti] = useState<number>(0);
  const [swipeOutcomeMsg, setSwipeOutcomeMsg] = useState<string | null>(null);

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
    
    // Determine next index first
    let nextIdx = currentIdx;
    if (direction === 'down') {
      nextIdx = (currentIdx + 1) % reels.length;
    } else {
      nextIdx = (currentIdx - 1 + reels.length) % reels.length;
    }

    let nextBalance = stats.balance;
    let betsCount = stats.totalBets;
    let winsCount = stats.totalWins;
    let highestPayout = stats.highestWin;

    // Deduct sweep-fee gamble if toggled
    if (betFeePerSwipe) {
      if (stats.balance < activeBet) {
        spawnFloatingText('🚫 Insufficient Balance to swipe-bet!');
        return;
      }
      nextBalance -= activeBet;
      betsCount += 1;
      
      // Slot Spin roll calculation on scroll
      const SYMBOLS = ['🍇', '🍉', '🔔', '💎', '👑', '7️⃣', '🍋'];
      const luck = getUpgradeLuck(); // e.g. luck is 1.12, 1.24, etc.
      
      const pickSymbol = () => {
        const rand = Math.random() * 100;
        // High luck raises premium symbols weight
        if (rand < 6 * luck) return '7️⃣';
        if (rand < 16 * luck) return '👑';
        if (rand < 32 * luck) return '💎';
        if (rand < 52) return '🔔';
        if (rand < 72) return '🍉';
        return '🍋';
      };

      const s1 = pickSymbol();
      const s2 = pickSymbol();
      const s3 = pickSymbol();
      const rolled = [s1, s2, s3];
      
      setSwipeReelsSymbols(rolled);
      setSwipeSpinActive(true);

      let spinMultiplier = 0;
      let label = 'No Win';

      if (s1 === s2 && s2 === s3) {
        if (s1 === '7️⃣') { spinMultiplier = 80; label = 'GRAND 777 JACKPOT!'; }
        else if (s1 === '👑') { spinMultiplier = 40; label = 'ROYAL CROWN SPREE!'; }
        else if (s1 === '💎') { spinMultiplier = 25; label = 'TRIPLE DIAMOND HEIST!'; }
        else if (s1 === '🔔') { spinMultiplier = 15; label = 'GOLDEN BELL TRIPLE!'; }
        else { spinMultiplier = 10; label = 'SUPER FRUIT SPLIT!'; }
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        const matchingSym = (s1 === s2 || s1 === s3) ? s1 : s2;
        if (matchingSym === '7️⃣' || matchingSym === '👑' || matchingSym === '💎') {
          spinMultiplier = 4;
          label = 'DOUBLE PREMIUM BONANZA!';
        } else {
          spinMultiplier = 2;
          label = 'DOUBLE FRUIT COMBO!';
        }
      } else {
        const premiumCount = rolled.filter(s => s === '💎' || s === '👑').length;
        if (premiumCount > 0) {
          spinMultiplier = 1.5;
          label = 'PREMIUM SCATTER PIECE!';
        }
      }

      const rewardSum = Math.round(activeBet * spinMultiplier * getUpgradeMultiplier());
      
      if (rewardSum > 0) {
        nextBalance += rewardSum;
        winsCount += 1;
        highestPayout = Math.max(highestPayout, rewardSum);
        setSwipeSpinPayout(rewardSum);
        setSwipeSpinMulti(spinMultiplier);
        setSwipeOutcomeMsg(label);
        playWin();
        spawnFloatingText(`Swipe Result: +$${rewardSum}! 🎰`);
      } else {
        setSwipeSpinPayout(0);
        setSwipeSpinMulti(0);
        setSwipeOutcomeMsg('Bust! Better luck next swipe.');
        spawnFloatingText(`Swipe Bet: -$${activeBet}`);
      }

      // Auto fade swipe container indicator card after 2.5 seconds
      setTimeout(() => {
        setSwipeSpinActive(false);
      }, 2500);

    } else {
      setSwipeSpinActive(false);
    }

    // Reset overlay elements inside smartphone drawers
    setLootBoxOpen(false);
    setLootReward(null);
    setDoubleDownActive(false);
    setDoubleStatus(null);
    setCoinSide(null);
    setShowCommentsDrawer(false);
    setShowSpecialsDrawer(false);

    // Save final stats and increase XP
    setStats(prev => {
      const statsUpdated = {
        ...prev,
        balance: nextBalance,
        totalBets: betsCount,
        totalWins: winsCount,
        highestWin: highestPayout
      };
      return gainXP(8, statsUpdated); // vertical scrolling earns 8 XP points
    });

    setCurrentIdx(nextIdx);
  };

  // Touch & Swipe Gestures with mouse Drag & Trackpad Wheel support
  const dragStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 45) {
      handleScrollReel('down');
    } else if (diff < -45) {
      handleScrollReel('up');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartY.current === null) return;
    const diff = dragStartY.current - e.clientY;
    dragStartY.current = null;
    if (diff > 45) {
      handleScrollReel('down');
    } else if (diff < -45) {
      handleScrollReel('up');
    }
  };

  const handleMouseLeave = () => {
    dragStartY.current = null;
  };

  const wheelLock = useRef<boolean>(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return;
    if (Math.abs(e.deltaY) > 15) {
      wheelLock.current = true;
      if (e.deltaY > 0) {
        handleScrollReel('down');
      } else {
        handleScrollReel('up');
      }
      setTimeout(() => {
        wheelLock.current = false;
      }, 600); // 600ms swipe rest
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
    <div className="min-h-screen bg-[#06020c] text-white font-sans overflow-x-hidden antialiased relative select-none">
      
      {/* Real-time Frosted Glass Background Particles & Mesh Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[50%] bg-purple-600/15 rounded-full blur-[140px] animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[140px] animate-pulse duration-8000"></div>
        <div className="absolute top-[20%] right-[20%] w-[35%] h-[45%] bg-blue-60%0/10 rounded-full blur-[120px]"></div>
      </div>

      {/* ==================================================== */}
      {/* HEADER: FROSTED GLASS TOP NAVIGATION BAR */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Banner */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 text-base font-black">
            $
          </div>
          <div>
            <span className="font-bold tracking-tight text-white font-mono block text-sm">LootReel</span>
            <span className="text-[8px] text-white/50 tracking-wider uppercase font-mono block">Swipe Slot Simulator</span>
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          <button 
            onClick={() => {
              playTick(400, 0.05);
              setCurrentIdx(0);
            }}
            className="text-white hover:text-yellow-400 py-1 border-b-2 border-yellow-400 font-bold transition-all"
          >
            🔥 For You
          </button>
          <button 
            onClick={() => {
              playTick(400, 0.05);
              setCurrentIdx((currentIdx + 1) % reels.length);
            }}
            className="text-white/60 hover:text-white py-1 transition-all"
          >
            👥 Following
          </button>
          <div className="text-white/30 cursor-not-allowed py-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-white/50">LIVE WINS FEED</span>
          </div>
        </nav>

        {/* Global Wallet Info Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-full py-1.5 px-3 flex items-center gap-2 text-xs font-mono shadow-inner backdrop-blur-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-white/60 text-[9px] font-bold">WALLET:</span>
            <span className="text-emerald-400 font-black">${stats.balance.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleAddFreeCash}
            className="hidden sm:flex bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 active:scale-95 text-slate-950 text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full transition-all shadow-md shadow-orange-500/10"
          >
            CLAIM GRANT
          </button>
        </div>

      </header>

      {/* ==================================================== */}
      {/* MAIN CONTAINER: BALANCED 3-COLUMN LAYOUT */}
      {/* ==================================================== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: BRAND ACCOUNT & SYSTEM GUIDE (Lg: Col-span-3) */}
        {/* ==================================================== */}
        <div id="left-sidebar-terminal" className="hidden lg:flex lg:col-span-3 flex-col space-y-6">
          
          {/* Detailed User Rank Progress */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h4 className="font-mono text-xs font-extrabold text-white/55 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-purple-400" /> CASINO STANDING
            </h4>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-white/40 font-mono block">SIMULATED LEVEL</span>
                <span className="text-2xl font-black text-white font-mono tracking-tight">LEVEL {stats.level}</span>
                <p className="text-[9px] text-purple-300 font-mono mt-0.5">
                  {stats.level >= 10 ? '👑 Almighty Whale Sovereign' : '🎰 Cherry Spinner General'}
                </p>
              </div>

              {/* Progress bar container */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-[9px] font-mono text-white/50">
                  <span>EXP multiplier: {(stats.level * 10) + 10} XP</span>
                  <span className="text-emerald-400">{stats.xp} XP</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((stats.xp / (stats.level * 100 + 50)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Symmetrical Guide and How-To Check */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4.5 rounded-2xl text-xs space-y-3 text-white/60 shadow-2xl">
            <h5 className="font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-white/50" /> Swipe-Gamble Tutorial
            </h5>
            <ol className="list-decimal pl-4 space-y-2 font-mono text-[10px] text-white/55 leading-relaxed">
              <li>Configure your active <b className="text-white">Bet Multiplier</b> under the phone frame screen.</li>
              <li>With <b className="text-pink-400">Swipe-Gamble active</b>, every scroll vertical gesture or touch drag deducts your bet and spins the 3-reel slots instantly!</li>
              <li>Tap the orange <b className="text-yellow-400">🚀 GAMBLE</b> button inside the phone feed to trigger this creator's special interactive bonus mini-game on-demand!</li>
            </ol>
            <p className="text-[9px] font-mono text-amber-400 border border-amber-500/20 bg-amber-500/5 p-2 rounded leading-snug">
              ⚠️ Upgrades in the store directly increase your scroll luck and multiplier factors!
            </p>
          </div>

          <button 
            onClick={handleResetGame}
            className="w-full font-mono text-[10px] text-white/40 hover:text-rose-400 transition-all border border-dashed border-white/10 hover:border-rose-500/20 p-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-3 w-3" /> Reset Account Balance
          </button>

        </div>

        {/* ==================================================== */}
        {/* CENTER COLUMN: THE SMARTPHONE FEED VIEWPORT (Lg: Col-span-5) */}
        {/* ==================================================== */}
        <div id="middle-viewport" className="lg:col-span-5 flex flex-col items-center">
          
          {/* Smartphone mockup frame matching responsive scale */}
          <div className="w-full max-w-[365px] h-[645px] backdrop-blur-2xl bg-zinc-950 rounded-[44px] p-2.5 border-[5.5px] border-white/15 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Top Speaker phone notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center border border-white/5">
              <div className="w-12 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Inner viewport smartphone shell */}
            <div 
              className="flex-1 rounded-[34px] overflow-hidden bg-black relative flex flex-col select-none border border-white/5 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
            >
              {/* Active animated reel player component */}
              <ReelPlayer reel={currentReel} isActive={true} />

              {/* Floating Money Text Popup effects */}
              {floatingText.map((f) => (
                <div
                  key={f.id}
                  className="absolute pointer-events-none text-[10px] font-mono font-black text-amber-300 py-1 px-2.5 bg-black/85 rounded-full border border-amber-400/30 animate-bounce shadow-xl z-40"
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}
                >
                  ✨ {f.text}
                </div>
              ))}

              {/* Top Swipe Gamble Spin outcome pill / Ticker */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none w-[90%] font-mono">
                {swipeSpinActive ? (
                  <div className="w-full backdrop-blur-md bg-black/85 border border-white/15 py-1 px-2.5 rounded-full shadow-lg flex items-center justify-between text-[11px] h-9 animate-bounce">
                    <span className="text-[9px] text-white/55 font-bold uppercase tracking-wider shrink-0">🎰 swipe:</span>
                    <div className="flex gap-1.5 items-center justify-center flex-1">
                      {swipeReelsSymbols.map((sym, i) => (
                        <span key={i} className="text-sm bg-white/5 px-2 py-0.5 rounded border border-white/5 animate-pulse">
                          {sym}
                        </span>
                      ))}
                    </div>
                    {swipeSpinPayout !== null && (
                      <span className={`text-[10px] font-black shrink-0 ${swipeSpinPayout > 0 ? 'text-amber-400' : 'text-white/40'}`}>
                        {swipeSpinPayout > 0 ? `+$${swipeSpinPayout} (${swipeSpinMulti}x)` : 'BUST'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/5 text-[9px] text-white/50 flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Swipe feed to Gamble Active Bet (${activeBet})</span>
                  </div>
                )}
              </div>

              {/* Black gradient overlay band with info */}
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 pt-5 px-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>CHANCE: {currentReel.baseMultiplier}x</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-pink-400">
                  REEL {currentIdx + 1}/{reels.length}
                </div>
              </div>

              {/* OVERLAY: Creator info section at base */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 p-4 pt-12 flex flex-col space-y-2 font-sans pointer-events-none">
                
                {/* Username sound layout */}
                <div className="flex items-center gap-2">
                  <img 
                    src={currentReel.avatar} 
                    alt={currentReel.username} 
                    className="w-7 h-7 rounded-full border-1.5 border-white object-cover"
                  />
                  <div>
                    <span className="font-bold text-xs text-white flex items-center gap-0.5">
                      @{currentReel.username}
                      <UserCheck className="h-3.5 w-3.5 text-blue-400 fill-blue-500 shrink-0" />
                    </span>
                    <span className="text-[8px] text-white/40 block font-mono">Channel Multiplier: {currentReel.baseMultiplier}X</span>
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-[11px] text-white/80 leading-relaxed font-sans line-clamp-2">
                  {currentReel.description}
                </p>

                {/* Hashtags list */}
                <div className="flex gap-1 flex-wrap">
                  {currentReel.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-semibold text-pink-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Active music soundtrack strip */}
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono bg-black/40 border border-white/10 p-1.5 rounded backdrop-blur-xs">
                  <Music className="h-3 w-3 animate-spin duration-3000 shrink-0" />
                  <span className="truncate">{currentReel.soundTrack}</span>
                </div>

              </div>

              {/* RIGHT SIDEBAR GESTURES: Hearts, Comment clicks, Spin triggers */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-4">
                
                {/* Like / Heart lock */}
                <button 
                  onClick={handleLikeToggle}
                  className="flex flex-col items-center group active:scale-90 transition-all focus:outline-hidden cursor-pointer"
                >
                  <div className={`p-2.5 rounded-full transition-all ${
                    likedReels[currentReel.id] 
                      ? 'bg-rose-500 md:bg-rose-600/20 text-rose-500 border border-rose-500/40 shadow-md' 
                      : 'bg-black/60 text-white/95 hover:bg-black/80'
                  }`}>
                    <Heart className={`h-5 w-5 ${likedReels[currentReel.id] ? 'fill-white md:fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[9px] text-white font-mono mt-1 text-shadow">{currentReel.likes.toLocaleString()}</span>
                </button>

                {/* Open Comments slide-up drawer trigger */}
                <button 
                  onClick={() => {
                    playTick(400, 0.05);
                    setShowCommentsDrawer(true);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition-all focus:outline-hidden cursor-pointer"
                >
                  <div className="p-2.5 rounded-full bg-black/60 text-white/95 hover:bg-black/80">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] text-white font-mono mt-1 text-shadow">{currentReel.commentsCount}</span>
                </button>

                {/* Spacer line */}
                <span className="h-[1px] bg-white/10 w-full" />

                {/* Highlight Special Game launch action button */}
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 opacity-60 blur-xs animate-ping" />
                  <button
                    onClick={() => {
                      playTick(600, 0.1);
                      setShowSpecialsDrawer(true);
                    }}
                    className="p-3 bg-linear-to-tr from-pink-500 to-amber-500 text-slate-950 hover:scale-110 active:scale-90 transition-all flex items-center justify-center font-bold text-lg relative z-10 rounded-full cursor-pointer"
                  >
                    🚀
                  </button>
                </div>
                <span className="text-[8px] text-center text-amber-300 font-bold font-mono text-shadow">GAMBLE</span>

              </div>

              {/* ==================================================== */}
              {/* IN-PHONE COMPACT DRAWER: COMMENTS FEED */}
              {/* ==================================================== */}
              {showCommentsDrawer && (
                <div className="absolute inset-x-0 bottom-0 top-[28%] backdrop-blur-2xl bg-black/95 rounded-t-[28px] border-t border-white/15 z-40 p-4 flex flex-col space-y-3 shadow-2xl animate-slide-up">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-pink-400" /> Live Comments ({commentsList.length})
                    </span>
                    <button 
                      onClick={() => setShowCommentsDrawer(false)}
                      className="text-white/60 hover:text-white font-mono text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  {/* Scrollable comments list inside phone */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 customize-scrollbar font-sans select-text">
                    {commentsList.map((comm) => (
                      <div key={comm.id} className="flex items-start gap-2 text-[10px] leading-relaxed">
                        <img 
                          src={comm.avatar} 
                          alt={comm.username} 
                          className="w-4.5 h-4.5 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                        />
                        <div className="bg-white/5 p-2 rounded-xl flex-1 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white/80">@{comm.username}</span>
                            <span className="text-[8px] text-white/40 font-mono">{comm.time}</span>
                          </div>
                          <p className="text-white/70 mt-0.5">{comm.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Post comment input box */}
                  <form onSubmit={handleAddComment} className="flex gap-1.5 border-t border-white/10 pt-2 shrink-0">
                    <input 
                      type="text" 
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      placeholder="Type a comment..."
                      className="flex-grow bg-white/5 border border-white/10 focus:border-white/20 focus:outline-hidden rounded-lg px-2.5 py-1 text-[11px] font-sans text-white/90"
                    />
                    <button
                      type="submit"
                      className="bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs px-3 rounded-lg active:scale-95 transition-all cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* ==================================================== */}
              {/* IN-PHONE COMPACT DRAWER: ACTIVE INTERACTIVE MATCH */}
              {/* ==================================================== */}
              {showSpecialsDrawer && (
                <div className="absolute inset-x-0 bottom-0 h-[68%] backdrop-blur-2xl bg-black/95 rounded-t-[28px] border-t border-white/15 z-40 p-4 flex flex-col space-y-3 shadow-2xl animate-slide-up select-none overflow-y-auto">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <span className="font-bold text-xs text-yellow-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> REEL BONUS MATCH
                      </span>
                      <p className="text-[8px] text-white/50 font-mono uppercase mt-0.5">GAME MODE: {currentReel.specialFeature}</p>
                    </div>
                    <button 
                      onClick={() => setShowSpecialsDrawer(false)}
                      className="text-white/60 hover:text-white font-mono text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  {/* Render Game Inside Drawer */}
                  <div className="flex-1 flex items-center justify-center py-2 text-xs">
                    
                    {currentReel.specialFeature === 'slot' && (
                      <div className="scale-95 origin-center">
                        <SlotSpinner 
                          betValue={activeBet} 
                          onSpinEnd={handleSlotSpinReturn} 
                          luckMultiplier={getUpgradeLuck()}
                        />
                      </div>
                    )}

                    {currentReel.specialFeature === 'scratch' && (
                      <ScratchCard 
                        prizeText={`$${(activeBet * 8).toLocaleString()}`} 
                        prizeAmount={8}
                        onSuccess={handleScratchReturn}
                        onClose={() => setShowSpecialsDrawer(false)}
                      />
                    )}

                    {currentReel.specialFeature === 'loot_box' && (
                      <div className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center space-y-3.5">
                        <div className="text-center">
                          <h4 className="font-mono text-xs font-bold text-red-400 flex items-center gap-1.5 justify-center">
                            <Gift className="h-4 w-4" /> CHEF'S CUSTOM CHEST
                          </h4>
                          <p className="text-[9px] text-white/50">Costs $50 simulated tokens to fracture</p>
                        </div>

                        <div className={`w-20 h-20 flex items-center justify-center rounded-xl bg-black/40 border-2 border-dashed border-white/15 relative cursor-pointer group hover:border-white/30 transition-all ${lootBoxOpen ? 'animate-bounce' : ''}`}>
                          {lootReward ? (
                            <div className="text-center p-1 leading-tight">
                              <span className="text-amber-400 font-bold block text-[10px]">CLAIMED!</span>
                              <span className="text-white font-mono text-[9px] block mt-0.5">{lootReward}</span>
                            </div>
                          ) : (
                            <div className="text-center text-4xl select-none group-hover:scale-115 transition-all">
                              📦
                            </div>
                          )}
                        </div>

                        <button
                          onClick={executeLootBoxCheck}
                          disabled={lootBoxOpen && !lootReward}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-mono font-bold text-xs py-2 px-3 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          {lootReward ? '📦 OPENED' : '🔑 CRACK CHEST ($50)'}
                        </button>
                      </div>
                    )}

                    {currentReel.specialFeature === 'double' && (
                      <div className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col space-y-3">
                        <div className="text-center">
                          <h3 className="font-mono text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                            🪙 DOUBLE OR NOTHING COIN
                          </h3>
                          <p className="text-[9px] text-white/50">Wager active bet to claim double reward scalar</p>
                        </div>

                        <div className="flex justify-center py-1">
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-sm font-black font-mono transition-all duration-300 relative overflow-hidden ${
                            tossingCoin 
                              ? 'animate-spin border-amber-500 bg-amber-950/20' 
                              : 'border-white/15 bg-black/30 text-amber-300 shadow-md'
                          }`}>
                            {coinSide ? (coinSide === 'heads' ? '🦅 HEAD' : '🪙 TAIL') : '🏆'}
                          </div>
                        </div>

                        {doubleStatus && (
                          <p className="text-[8px] font-mono p-1 rounded bg-black/40 text-center text-amber-300 border border-white/5 leading-snug">
                            {doubleStatus}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCoinToss('heads')}
                            disabled={tossingCoin}
                            className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all cursor-pointer"
                          >
                            🦅 HEADS
                          </button>
                          <button
                            onClick={() => handleCoinToss('tails')}
                            disabled={tossingCoin}
                            className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all cursor-pointer"
                          >
                            🪙 TAILS
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* Bottom Phone Console bar: Bet Adjustments */}
            <div className="h-14 shrink-0 mt-2 pl-2 pr-2.5 flex items-center justify-between text-xs font-mono select-none">
              
              {/* Bet adjuster */}
              <div>
                <span className="text-[8px] text-white/40 block font-mono">BET VALUE</span>
                <div className="flex items-center gap-1.5 mt-0.5 bg-black/50 border border-white/10 rounded-lg p-0.5">
                  <button 
                    onClick={() => {
                      playTick(300, 0.05);
                      setActiveBet(prev => Math.max(5, prev - 5));
                    }}
                    className="text-white/40 hover:text-white shrink-0 font-bold px-1.5 py-0.5 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-white font-mono font-black text-[10px] w-8 text-center shrink-0">
                    ${activeBet}
                  </span>
                  <button 
                    onClick={() => {
                      playTick(450, 0.05);
                      setActiveBet(prev => Math.min(getUpgradeBetLimit(), prev + 5));
                    }}
                    className="text-white/40 hover:text-white shrink-0 font-bold px-1.5 py-0.5 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Swipe bet toggle */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[8px] text-white/40 block font-mono">SWIPE-BET</span>
                <button
                  onClick={() => {
                    playTick(400, 0.05);
                    setBetFeePerSwipe(!betFeePerSwipe);
                  }}
                  className={`mt-1 text-[9px] py-1 px-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
                    betFeePerSwipe
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {betFeePerSwipe ? '🟢 ACTIVE' : '🔴 MUTED'}
                </button>
              </div>

            </div>

          </div>

          {/* Prompt banner under the smartphone frame */}
          <p className="mt-3 text-[10px] text-white/40 font-mono text-center leading-relaxed">
            💡 Drag & pull vertical OR wheel scroll the phone feed to gamble and change channels!
          </p>

        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: THE COMPACT UPGRADES ENGINE (Lg: Col-span-4) */}
        {/* ==================================================== */}
        <div id="right-specials-sidebar" className="col-span-1 md:col-span-1 lg:col-span-4 flex flex-col space-y-6">
          
          {/* Shop upgrades list */}
          <ShopPanel 
            items={shopUpgrades} 
            userBalance={stats.balance} 
            onPurchase={handleUpgradePurchase} 
          />

          {/* Symmetrical High Rollers standings leaderboard (Aesthetic simulation) */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div>
                <h4 className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  🏆 HIGH ROLLERS FEED
                </h4>
                <p className="text-[8px] text-white/40 font-mono">Simulated global jackpot transmissions</p>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>

            <div className="space-y-2.5 font-mono text-[10px]">
              <div className="flex items-center justify-between p-2 bg-black/30 border border-white/5 rounded-xl">
                <span className="text-white/60">👑 slot_wizard_99</span>
                <span className="text-amber-400 font-bold">+$24,500 <span className="text-[8px] text-white/30">(2m ago)</span></span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 border border-white/5 rounded-xl">
                <span className="text-white/60">👨‍🍳 pizza_gordon</span>
                <span className="text-emerald-400 font-bold">+$12,000 <span className="text-[8px] text-white/30">(5m ago)</span></span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 border border-white/5 rounded-xl">
                <span className="text-white/60">🚀 lucky_swiper_pro</span>
                <span className="text-amber-400 font-bold">+$8,500 <span className="text-[8px] text-white/30">(14m ago)</span></span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 border border-white/5 rounded-xl">
                <span className="text-white/60">🐵 ape_hodler</span>
                <span className="text-emerald-400 font-bold">+$35,000 <span className="text-[8px] text-white/30">(20m ago)</span></span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ==================================================== */}
      {/* FOOTER: THE SMARTPHONE FOOTER OR WEB FOOTER LINKS */}
      {/* ==================================================== */}
      <footer className="h-16 shrink-0 mt-8 border-t border-white/10 bg-black/40 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between text-[10px] font-mono text-white/40">
        <div>
          <span>© 2026 LootReel Inc. All fictional stakes verified offshore.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:text-white transition-all cursor-pointer">PROVIDENCE</span>
          <span>•</span>
          <span className="hover:text-white transition-all cursor-pointer">SEC LICENSE</span>
          <span>•</span>
          <span className="hover:text-white transition-all cursor-pointer">TERMS</span>
        </div>
      </footer>

    </div>
  );
}
