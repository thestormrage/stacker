import type { GameConfig } from './types';

export const CONFIG: GameConfig = {
  canvasWidth: 360,
  canvasHeight: 640,
  blockWidth: 200,
  blockHeight: 40,
  blockSpeed: 3,
  speedIncrease: 0.08,
  maxSpeed: 12,
  perfectThreshold: 3,
  colors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
  ],
  skinColors: {
    classic: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'],
    neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF3366', '#33FF66', '#6633FF', '#FF6633', '#33FFFF', '#FF33FF', '#66FF33'],
    pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D5BAFF', '#FFC9DE', '#C9FFE5', '#FFD5BA', '#E8BAFF'],
    mono: ['#1a1a1a', '#2d2d2d', '#404040', '#525252', '#666666', '#7a7a7a', '#8c8c8c', '#9e9e9e', '#b0b0b0', '#c2c2c2'],
    fire: ['#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00', '#CCFF00', '#99FF00', '#66FF00', '#33FF00'],
    ocean: ['#001f3f', '#003366', '#004499', '#0055cc', '#0066ff', '#0077ff', '#0088ff', '#0099ff', '#00aaff', '#00bbff'],
  }
};

export const SKINS = [
  { id: 'classic', name: 'Classic', cost: 0 },
  { id: 'neon', name: 'Neon', cost: 50 },
  { id: 'pastel', name: 'Pastel', cost: 75 },
  { id: 'mono', name: 'Mono', cost: 100 },
  { id: 'fire', name: 'Fire', cost: 125 },
  { id: 'ocean', name: 'Ocean', cost: 150 },
];

export const STORAGE_KEY = 'stacker_save_v1';