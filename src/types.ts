export type GameStateType = 'menu' | 'playing' | 'gameover';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Block {
  id: number;
  rect: Rect;
  color: string;
  offset: number;
  isPerfect: boolean;
}

export interface Tower {
  blocks: Block[];
  baseWidth: number;
  baseHeight: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  blockWidth: number;
  blockHeight: number;
  blockSpeed: number;
  speedIncrease: number;
  maxSpeed: number;
  perfectThreshold: number;
  colors: string[];
  skinColors: Record<string, string[]>;
}

export interface SaveData {
  highScore: number;
  totalBlocks: number;
  gamesPlayed: number;
  currentSkin: string;
  unlockedSkins: string[];
  dailyChallenge: {
    date: string;
    score: number;
    completed: boolean;
  } | null;
}

export interface DailyChallenge {
  date: string;
  seed: number;
  targetScore: number;
}