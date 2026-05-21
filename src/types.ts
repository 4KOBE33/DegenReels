export type VisualType = 'slots' | 'asmr' | 'cooking' | 'crypto' | 'satisfying' | 'pixel_miner';

export interface Reel {
  id: string;
  username: string;
  avatar: string;
  description: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  shares: number;
  soundTrack: string;
  visualType: VisualType;
  baseMultiplier: number; // Potential win multiplier
  specialFeature: 'slot' | 'scratch' | 'loot_box' | 'double';
  customColor: string;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  benefitText: string;
  type: 'luck' | 'bet_limit' | 'multiplier' | 'license';
  increment: number;
}

export interface UserStats {
  balance: number;
  totalBets: number;
  totalWins: number;
  highestWin: number;
  level: number;
  xp: number;
}
