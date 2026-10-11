import type { Tower, Block } from '../types';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private screenShake = 0;
  private perfectFlash = 0;
  private comboCount = 0;
  private comboTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
  }

  resize(width: number, height: number): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }

  clear(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  setScreenShake(intensity: number): void {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  setPerfectFlash(): void {
    this.perfectFlash = 0.3;
    this.comboCount++;
    this.comboTimer = 1.5;
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.comboTimer = 0;
  }

  update(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.life -= dt;
      return p.life > 0;
    });

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 10);
    }

    if (this.perfectFlash > 0) {
      this.perfectFlash = Math.max(0, this.perfectFlash - dt * 3);
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }
  }

  addParticles(x: number, y: number, color: string, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  addSliceParticles(x: number, y: number, width: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + Math.random() * width,
        y,
        vx: (Math.random() - 0.5) * 300,
        vy: -50 - Math.random() * 200,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }

  renderTower(tower: Tower, cameraY: number): void {
    const ctx = this.ctx;
    const canvasHeight = ctx.canvas.height;

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 4;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 4;
      ctx.translate(shakeX, shakeY);
    }

    for (const block of tower.blocks) {
      const drawY = canvasHeight - block.rect.y - block.rect.h - cameraY;

      if (drawY > canvasHeight + 50 || drawY < -50) continue;

      ctx.fillStyle = block.color;
      ctx.fillRect(block.rect.x, drawY, block.rect.w, block.rect.h);

      if (block.isPerfect) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(block.rect.x, drawY, block.rect.w, block.rect.h);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.rect.x, drawY, block.rect.w, block.rect.h);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(block.rect.x, drawY + block.rect.h - 2, block.rect.w, 2);
    }

    ctx.restore();
  }

  renderFallingBlock(block: Block, cameraY: number): void {
    const ctx = this.ctx;
    const canvasHeight = ctx.canvas.height;
    const drawY = canvasHeight - block.rect.y - block.rect.h - cameraY;

    ctx.fillStyle = block.color;
    ctx.fillRect(block.rect.x, drawY, block.rect.w, block.rect.h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(block.rect.x, drawY, block.rect.w, 4);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(block.rect.x, drawY, block.rect.w, block.rect.h);
  }

  renderGhostBlock(block: Block, targetBlock: Block, cameraY: number): void {
    const ctx = this.ctx;
    const canvasHeight = ctx.canvas.height;
    const drawY = canvasHeight - block.rect.y - block.rect.h - cameraY;

    const overlapLeft = Math.max(block.rect.x, targetBlock.rect.x);
    const overlapRight = Math.min(block.rect.x + block.rect.w, targetBlock.rect.x + targetBlock.rect.w);
    const overlap = Math.max(0, overlapRight - overlapLeft);

    if (overlap > 0) {
      ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
      ctx.fillRect(overlapLeft, drawY, overlap, block.rect.h);
    } else {
      ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
      ctx.fillRect(block.rect.x, drawY, block.rect.w, block.rect.h);
    }
  }

  renderParticles(): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  renderPerfectFlash(): void {
    if (this.perfectFlash <= 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.perfectFlash * 0.5;
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  renderCombo(): void {
    if (this.comboCount < 2) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    const text = `COMBO x${this.comboCount}!`;
    const x = ctx.canvas.width / 2;
    const y = 120;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  renderScore(score: number, highScore: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const text = score.toString();
    const x = ctx.canvas.width / 2;
    const y = 80;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`Best: ${highScore}`, x, y + 25);
    ctx.restore();
  }

  renderGameOver(score: number, highScore: number, isNewRecord: boolean): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = isNewRecord ? '#FFD700' : '#fff';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('GAME OVER', w / 2, h / 2 - 60);
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, w / 2, h / 2);

    if (isNewRecord) {
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('NEW RECORD!', w / 2, h / 2 + 40);
    } else {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`Best: ${highScore}`, w / 2, h / 2 + 40);
    }

    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Tap to retry', w / 2, h / 2 + 100);
    ctx.restore();
  }

  renderMenu(highScore: number, currentSkin: string): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('STACKER', w / 2, h / 2 - 80);
    ctx.fillText('STACKER', w / 2, h / 2 - 80);

    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`Best: ${highScore}`, w / 2, h / 2 - 30);

    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`Skin: ${currentSkin}`, w / 2, h / 2 + 10);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText('TAP TO START', w / 2, h / 2 + 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Tap / Space / Click', w / 2, h / 2 + 110);
    ctx.restore();
  }

  renderDailyChallenge(targetScore: number, completed: boolean, currentScore: number): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;

    ctx.save();
    ctx.fillStyle = completed ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)';
    ctx.fillRect(10, 10, w - 20, 50);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('DAILY CHALLENGE', 20, 38);

    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(completed ? 'COMPLETED!' : `Target: ${targetScore}  |  Current: ${currentScore}`, w - 20, 38);
    ctx.restore();
  }
}