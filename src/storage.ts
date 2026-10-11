import type { SaveData } from './types';
import { STORAGE_KEY, SKINS } from './config';

const DEFAULT_SAVE: SaveData = {
  highScore: 0,
  totalBlocks: 0,
  gamesPlayed: 0,
  currentSkin: 'classic',
  unlockedSkins: ['classic'],
  dailyChallenge: null,
};

export function loadSave(): SaveData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_SAVE;
    const parsed = JSON.parse(data) as SaveData;
    return { ...DEFAULT_SAVE, ...parsed };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save:', e);
  }
}

export function addScore(score: number): SaveData {
  const save = loadSave();
  save.highScore = Math.max(save.highScore, score);
  save.totalBlocks += score;
  save.gamesPlayed += 1;
  saveGame(save);
  return save;
}

export function unlockSkin(skinId: string): SaveData {
  const save = loadSave();
  if (!save.unlockedSkins.includes(skinId)) {
    save.unlockedSkins.push(skinId);
    saveGame(save);
  }
  return save;
}

export function setCurrentSkin(skinId: string): SaveData {
  const save = loadSave();
  if (save.unlockedSkins.includes(skinId)) {
    save.currentSkin = skinId;
    saveGame(save);
  }
  return save;
}

export function getDailyChallenge(): { date: string; seed: number; targetScore: number } | null {
  const save = loadSave();
  const today = new Date().toISOString().split('T')[0];
  if (save.dailyChallenge?.date === today) {
    return { date: today, seed: save.dailyChallenge.date.split('-').reduce((a, b) => a * 31 + parseInt(b), 0), targetScore: save.dailyChallenge.score };
  }
  const seed = today.split('-').reduce((a, b) => a * 31 + parseInt(b), 0);
  const targetScore = 10 + (seed % 20);
  return { date: today, seed, targetScore };
}

export function completeDailyChallenge(score: number): SaveData {
  const save = loadSave();
  const today = new Date().toISOString().split('T')[0];
  save.dailyChallenge = { date: today, score, completed: true };
  saveGame(save);
  return save;
}

export function canClaimDailyReward(): boolean {
  const save = loadSave();
  const today = new Date().toISOString().split('T')[0];
  return save.dailyChallenge?.date !== today;
}

export function getSkinCost(skinId: string): number {
  return SKINS.find(s => s.id === skinId)?.cost ?? 0;
}

export function canAffordSkin(skinId: string): boolean {
  const save = loadSave();
  return save.totalBlocks >= getSkinCost(skinId);
}