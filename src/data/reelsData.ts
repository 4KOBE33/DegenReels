import { Reel, Comment } from '../types';

export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel_1',
    username: 'lucky_slot_king',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
    description: 'SPINNING THE MAXIMUM BET LEVEL! WILL WE HIT THE 100x GRAND JACKPOT TODAY?! 🎰 Drop a like for good luck! 👇🔥',
    tags: ['slots', 'luck', 'jackpot', 'casino', 'reelmagic'],
    likes: 12431,
    commentsCount: 382,
    shares: 894,
    soundTrack: 'Lucky Slot King - Synth Rush (Original Audio)',
    visualType: 'slots',
    baseMultiplier: 12,
    specialFeature: 'slot',
    customColor: '#ec4899', // pink-500
  },
  {
    id: 'reel_2',
    username: 'asmr_slime_satisfying',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
    description: 'ASMR Kinetic Slime Slicing! 🔪✨ Scratch the screen on this post for a guaranteed cash mystery payout layer! So satisfying!',
    tags: ['asmr', 'satisfying', 'slime', 'oddly_satisfying', 'relaxing'],
    likes: 42105,
    commentsCount: 1109,
    shares: 3410,
    soundTrack: 'Satisfying Sounds - Soft Whispers & Slice ASMR',
    visualType: 'asmr',
    baseMultiplier: 5,
    specialFeature: 'scratch',
    customColor: '#10b981', // emerald-500
  },
  {
    id: 'reel_3',
    username: 'crypto_moon_ape',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    description: 'HODL! 📈 Bitcoin green candlesticks are hitting the stratosphere! Try the Double-or-Nothing coin toss challenge on this reel to instantly double your wealth! 🚀🌕',
    tags: ['crypto', 'bullrun', 'moon', 'coinflip', 'riskybusiness'],
    likes: 8431,
    commentsCount: 2041,
    shares: 209,
    soundTrack: 'Moon Ape - Bull Market Anthem (Remix)',
    visualType: 'crypto',
    baseMultiplier: 25,
    specialFeature: 'double',
    customColor: '#f59e0b', // amber-500
  },
  {
    id: 'reel_4',
    username: 'chef_max_gordon',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=60',
    description: 'Cracking open a rare $10,000 Golden Loot Chest while cooking the world\'s most expensive diamond truffle pizza! 💎🍕 Rate this 10/10!',
    tags: ['chef', 'cooking', 'gourmet', 'lootbox', 'luxurychef'],
    likes: 19821,
    commentsCount: 450,
    shares: 1102,
    soundTrack: 'Gordon Beats - Sizzling Garlic & Flame Loops',
    visualType: 'cooking',
    baseMultiplier: 8,
    specialFeature: 'loot_box',
    customColor: '#ef4444', // red-500
  },
  {
    id: 'reel_5',
    username: 'satisfying_sand_press',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    description: 'CRUSHING GLOWING CRYSTALS WITH THE 500-TON HYDRAULIC PRESS! 💎💥 Scratch off the dusty screen overlay to recover the diamond fragments for pure cash!',
    tags: ['hydraulic', 'press', 'crushing', 'crystal', 'heavy_machinery'],
    likes: 31092,
    commentsCount: 789,
    shares: 1391,
    soundTrack: 'Industrial Beats - Heavy Hydraulic Press Hum',
    visualType: 'satisfying',
    baseMultiplier: 6,
    specialFeature: 'scratch',
    customColor: '#a855f7', // purple-500
  },
  {
    id: 'reel_6',
    username: 'pixel_miner_retro',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60',
    description: 'Mining ultra-rare deepslate gold ore in this retro 8-bit voxel world! ⛏️💎 Pop open the loot boxes for a massive coin stash bonus! Let\'s go!',
    tags: ['voxel', 'gaming', 'retro', 'minecraft', 'mining', 'goldrush'],
    likes: 6412,
    commentsCount: 198,
    shares: 554,
    soundTrack: 'Chiptune Hero - 8-Bit Cave Explorer Synth',
    visualType: 'pixel_miner',
    baseMultiplier: 15,
    specialFeature: 'loot_box',
    customColor: '#06b6d4', // cyan-500
  }
];

export const MOCK_REEL_COMMENTS: Record<string, Comment[]> = {
  reel_1: [
    { id: 'c1_1', username: 'jackpot_hunter', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60', text: 'Bro is single-handedly funding the slot machines 😂', likes: 121, time: '2h ago' },
    { id: 'c1_2', username: 'casino_hater44', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60', text: 'Put $50 on cherry for me, next spin hits 100%!', likes: 45, time: '1h ago' },
    { id: 'c1_3', username: 'wealthy_whale', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60', text: 'I betted max level and got triple diamonds instantly. Reel fortune is real!', likes: 304, time: '10m ago' }
  ],
  reel_2: [
    { id: 'c2_1', username: 'tingly_ears', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', text: 'This slime sounds so crispy my headphones are melting 🎧🫠', likes: 432, time: '4h ago' },
    { id: 'c2_2', username: 'scratch_addict', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', text: 'Did anyone else get the $250 scratch prize on the slime slice?! No way!', likes: 98, time: '3h ago' }
  ],
  reel_3: [
    { id: 'c3_1', username: 'paper_hands_bob', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60', text: 'Lost 4 bets in a row then got a 10x multiplier. Im a certified moonboy now 🐵🚀', likes: 1102, time: '1h ago' },
    { id: 'c3_2', username: 'fomo_expert', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=60', text: 'BUY THE DIP! Swipe next to pull another jackpot lever.', likes: 312, time: '30m ago' }
  ],
  reel_4: [
    { id: 'c4_1', username: 'gordon_fanboy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60', text: 'Bro u forgot to season the diamonds! Raw wealth and gold crust is tasty tho.', likes: 89, time: '12h ago' },
    { id: 'c4_2', username: 'lootbox_connoisseur', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=60', text: 'Got a rare pizza topping from the chest, sold it for $500. Insane gameplay!', likes: 512, time: '8h ago' }
  ],
  reel_5: [
    { id: 'c5_1', username: 'hydraulic_guy', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&auto=format&fit=crop&q=60', text: 'Is there anything that press can\'t crush? Absolutely incredible friction rings.', likes: 154, time: '5h ago' },
    { id: 'c5_2', username: 'gem_collector_9', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', text: 'Scratched off $80 and it immediately went into my slot bank. Easy cash-out levels.', likes: 21, time: '2h ago' }
  ],
  reel_6: [
    { id: 'c6_1', username: 'steve_minecraft', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60', text: 'Watch out for creepers when you scratch that loot box! ⛏️💥', likes: 78, time: '1d ago' },
    { id: 'c6_2', username: 'retro_fan_atic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60', text: 'Pixel sound effects hit different. The sound track on this is pure nostalgia!', likes: 41, time: '12h ago' }
  ]
};
