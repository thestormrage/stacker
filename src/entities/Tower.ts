import type { Tower, Block, Rect } from '../types';
import { CONFIG } from '../config';
import { createBlock, calculateOverlap, isPerfectStack } from './Block';

export function createTower(baseWidth: number, baseHeight: number): Tower {
  return {
    blocks: [],
    baseWidth,
    baseHeight,
  };
}

export function addBlock(tower: Tower, block: Block): void {
  tower.blocks.push(block);
}

export function getTopBlock(tower: Tower): Block | null {
  return tower.blocks.length > 0 ? tower.blocks[tower.blocks.length - 1] : null;
}

export function getBottomBlock(tower: Tower): Block | null {
  return tower.blocks.length > 0 ? tower.blocks[0] : null;
}

export function getTowerHeight(tower: Tower): number {
  return tower.blocks.length * CONFIG.blockHeight;
}

export function getTowerScore(tower: Tower): number {
  return tower.blocks.length;
}

export function processStack(tower: Tower, fallingBlock: Block): { success: boolean; perfect: boolean; newBlock: Block | null } {
  const topBlock = getTopBlock(tower);
  if (!topBlock) {
    return { success: true, perfect: false, newBlock: fallingBlock };
  }

  const overlap = calculateOverlap(fallingBlock, topBlock);

  if (overlap <= 0) {
    return { success: false, perfect: false, newBlock: null };
  }

  const perfect = isPerfectStack(fallingBlock, topBlock);
  const newX = Math.max(fallingBlock.rect.x, topBlock.rect.x);
  const newWidth = overlap;

  const newBlock = createBlock(
    newX,
    fallingBlock.rect.y,
    newWidth,
    fallingBlock.color
  );
  newBlock.isPerfect = perfect;

  return { success: true, perfect, newBlock };
}

export function getTowerBounds(tower: Tower): Rect {
  if (tower.blocks.length === 0) {
    return { x: 0, y: 0, w: tower.baseWidth, h: tower.baseHeight };
  }
  const bottom = tower.blocks[0];
  const top = tower.blocks[tower.blocks.length - 1];
  return {
    x: bottom.rect.x,
    y: top.rect.y,
    w: bottom.rect.w,
    h: tower.blocks.length * CONFIG.blockHeight,
  };
}

export function clearTower(tower: Tower): void {
  tower.blocks = [];
}