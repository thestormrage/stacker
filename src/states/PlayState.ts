import { GameState } from './GameState';
import type { Tower, Block, DailyChallenge } from '../types';
import { CONFIG, SKINS } from '../config';
import { createTower, addBlock, getTopBlock, getTowerScore, processStack } from '../entities/Tower';
import { createBlock, resetBlockIdCounter } from '../entities/Block';
import { Renderer } from '../systems/Renderer';
import { consumeTap } from '../systems/Input';
import { playPlaceSound, playPerfectSound, playGameOverSound } from '../systems/Audio';
import { loadSave, addScore, getDailyChallenge, completeDailyChallenge } from '../storage';

export class PlayState extends GameState {
  private renderer: Renderer;
  private tower!: Tower;
  private fallingBlock: Block | null = null;
  private blockDirection = 1;
  private currentSpeed = 0;
  private cameraY = 0;
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private gameOverTimer = 0;
  private save: ReturnType<typeof loadSave>;
  private skinColors: string[];
  private colorIndex = 0;
  private perfectStreak = 0;
  private dailyChallenge: DailyChallenge | null = null;
  private dailyCompleted = false;

  constructor(game: any, renderer: Renderer) {
    super(game);
    this.renderer = renderer;
    this.save = loadSave();
    this.highScore = this.save.highScore;
    this.skinColors = CONFIG.skinColors[this.save.currentSkin] || CONFIG.colors;
    this.dailyChallenge = getDailyChallenge();
    this.dailyCompleted = this.save.dailyChallenge?.completed ?? false;
  }

  enter(): void {
    this.save = loadSave();
    this.highScore = this.save.highScore;
    this.skinColors = CONFIG.skinColors[this.save.currentSkin] || CONFIG.colors;
    this.dailyChallenge = getDailyChallenge();
    this.dailyCompleted = this.save.dailyChallenge?.completed ?? false;

    resetBlockIdCounter();
    this.tower = createTower(CONFIG.canvasWidth, CONFIG.canvasHeight);

    const baseBlock = createBlock(
      (CONFIG.canvasWidth - CONFIG.blockWidth) / 2,
      0,
      CONFIG.blockWidth,
      this.getNextColor()
    );
    addBlock(this.tower, baseBlock);

    this.spawnFallingBlock();
    this.currentSpeed = CONFIG.blockSpeed;
    this.cameraY = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameOverTimer = 0;
    this.perfectStreak = 0;
    this.colorIndex = 1;
  }

  private getNextColor(): string {
    const color = this.skinColors[this.colorIndex % this.skinColors.length];
    this.colorIndex++;
    return color;
  }

  private spawnFallingBlock(): void {
    const topBlock = getTopBlock(this.tower);
    if (!topBlock) return;

    const width = topBlock.rect.w;
    const x = (CONFIG.canvasWidth - width) / 2;
    const y = topBlock.rect.y + CONFIG.blockHeight * (this.tower.blocks.length + 1);

    this.fallingBlock = createBlock(x, y, width, this.getNextColor());
    this.blockDirection = Math.random() < 0.5 ? 1 : -1;
  }

  update(dt: number): void {
    if (this.gameOver) {
      this.gameOverTimer += dt;
      if (this.gameOverTimer > 0.5 && consumeTap(this.game.input)) {
        this.game.changeState('gameover');
      }
      return;
    }

    this.updateFallingBlock(dt);
    this.updateCamera(dt);
    this.renderer.update(dt);

    if (consumeTap(this.game.input)) {
      this.handleTap();
    }
  }

  private updateFallingBlock(dt: number): void {
    if (!this.fallingBlock) return;

    const moveDistance = this.currentSpeed * dt * 60;
    this.fallingBlock.rect.x += this.blockDirection * moveDistance;

    const leftBound = 0;
    const rightBound = CONFIG.canvasWidth - this.fallingBlock.rect.w;

    if (this.fallingBlock.rect.x <= leftBound) {
      this.fallingBlock.rect.x = leftBound;
      this.blockDirection = 1;
    } else if (this.fallingBlock.rect.x >= rightBound) {
      this.fallingBlock.rect.x = rightBound;
      this.blockDirection = -1;
    }
  }

  private updateCamera(_dt: number): void {
    const topBlock = getTopBlock(this.tower);
    if (!topBlock) return;

    const targetY = Math.max(0, topBlock.rect.y - CONFIG.canvasHeight * 0.6);
    this.cameraY += (targetY - this.cameraY) * 0.1;
  }

  private handleTap(): void {
    if (!this.fallingBlock) return;

    const topBlock = getTopBlock(this.tower);
    if (!topBlock) return;

    const result = processStack(this.tower, this.fallingBlock);

    if (!result.success) {
      this.triggerGameOver();
      return;
    }

    this.fallingBlock = result.newBlock;
    if (!this.fallingBlock) {
      this.triggerGameOver();
      return;
    }

    addBlock(this.tower, this.fallingBlock);
    this.score = getTowerScore(this.tower) - 1;

    this.currentSpeed = Math.min(this.currentSpeed + CONFIG.speedIncrease, CONFIG.maxSpeed);

    if (result.perfect) {
      this.perfectStreak++;
      playPerfectSound();
      this.renderer.setPerfectFlash();
      this.renderer.addParticles(
        this.fallingBlock.rect.x + this.fallingBlock.rect.w / 2,
        CONFIG.canvasHeight - this.fallingBlock.rect.y - this.fallingBlock.rect.h - this.cameraY,
        '#FFD700',
        15
      );
    } else {
      this.perfectStreak = 0;
      playPlaceSound(false);
      this.renderer.addParticles(
        this.fallingBlock.rect.x + this.fallingBlock.rect.w / 2,
        CONFIG.canvasHeight - this.fallingBlock.rect.y - this.fallingBlock.rect.h - this.cameraY,
        this.fallingBlock.color,
        8
      );
    }

    this.checkDailyChallenge();

    this.spawnFallingBlock();
  }

  private checkDailyChallenge(): void {
    if (!this.dailyChallenge || this.dailyCompleted) return;
    if (this.score >= this.dailyChallenge.targetScore) {
      this.dailyCompleted = true;
      completeDailyChallenge(this.score);
      this.renderer.addParticles(
        CONFIG.canvasWidth / 2,
        50,
        '#4CAF50',
        20
      );
    }
  }

  private triggerGameOver(): void {
    this.gameOver = true;
    this.gameOverTimer = 0;
    playGameOverSound();
    this.renderer.setScreenShake(15);
    this.renderer.resetCombo();

    if (this.fallingBlock) {
      this.renderer.addSliceParticles(
        this.fallingBlock.rect.x,
        CONFIG.canvasHeight - this.fallingBlock.rect.y - this.fallingBlock.rect.h - this.cameraY,
        this.fallingBlock.rect.w,
        this.fallingBlock.color
      );
    }

    const newSave = addScore(this.score);
    this.highScore = newSave.highScore;

    const skin = SKINS.find(s => !newSave.unlockedSkins.includes(s.id) && newSave.totalBlocks >= s.cost);
    if (skin) {
      // Skin unlocked notification handled in GameOverState
    }
  }

  render(renderer: Renderer): void {
    renderer.clear();
    renderer.renderTower(this.tower, this.cameraY);

    if (this.fallingBlock && !this.gameOver) {
      const topBlock = getTopBlock(this.tower);
      if (topBlock) {
        renderer.renderGhostBlock(this.fallingBlock, topBlock, this.cameraY);
      }
      renderer.renderFallingBlock(this.fallingBlock, this.cameraY);
    }

    renderer.renderParticles();
    renderer.renderPerfectFlash();
    renderer.renderCombo();
    renderer.renderScore(this.score, this.highScore);

    if (this.dailyChallenge && !this.dailyCompleted) {
      renderer.renderDailyChallenge(this.dailyChallenge.targetScore, false, this.score);
    }
  }

  exit(): void {}

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  isNewRecord(): boolean {
    return this.score > this.save.highScore;
  }

  getNewlyUnlockedSkins(): string[] {
    const newSave = loadSave();
    return SKINS
      .filter(s => !this.save.unlockedSkins.includes(s.id) && newSave.unlockedSkins.includes(s.id))
      .map(s => s.id);
  }
}