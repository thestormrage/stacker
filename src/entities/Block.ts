import type { Block, Vec2, Rect } from '../types';
import { CONFIG } from '../config';

let blockIdCounter = 0;

export function createBlock(x: number, y: number, width: number, color: string): Block {
  return {
    id: blockIdCounter++,
    rect: { x, y, w: width, h: CONFIG.blockHeight },
    color,
    offset: 0,
    isPerfect: false,
  };
}

export function resetBlockIdCounter(): void {
  blockIdCounter = 0;
}

export function getBlockCenter(block: Block): Vec2 {
  return {
    x: block.rect.x + block.rect.w / 2,
    y: block.rect.y + block.rect.h / 2,
  };
}

export function getBlockRect(block: Block): Rect {
  return { ...block.rect };
}

export function setBlockPosition(block: Block, x: number, y: number): void {
  block.rect.x = x;
  block.rect.y = y;
}

export function setBlockWidth(block: Block, width: number): void {
  block.rect.w = Math.max(0, width);
}

export function calculateOverlap(blockA: Block, blockB: Block): number {
  const left = Math.max(blockA.rect.x, blockB.rect.x);
  const right = Math.min(blockA.rect.x + blockA.rect.w, blockB.rect.x + blockB.rect.w);
  return Math.max(0, right - left);
}

export function isPerfectStack(blockA: Block, blockB: Block): boolean {
  const overlap = calculateOverlap(blockA, blockB);
  const maxOffset = Math.min(blockA.rect.w, blockB.rect.w) - overlap;
  return maxOffset <= CONFIG.perfectThreshold;
}