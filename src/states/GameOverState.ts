import { GameState } from './GameState';
import type { Renderer } from '../systems/Renderer';
import { playMenuSound } from '../systems/Audio';
import { consumeTap } from '../systems/Input';

export class GameOverState extends GameState {
  private score: number;
  private highScore: number;
  private isNewRecord: boolean;
  private newlyUnlockedSkins: string[];
  private showTime = 0;

  constructor(game: any, _renderer: Renderer) {
    super(game);
    this.score = 0;
    this.highScore = 0;
    this.isNewRecord = false;
    this.newlyUnlockedSkins = [];
  }

  enter(): void {
    const playState = this.game.states.playing as any;
    this.score = playState.getScore();
    this.highScore = playState.getHighScore();
    this.isNewRecord = playState.isNewRecord();
    this.newlyUnlockedSkins = playState.getNewlyUnlockedSkins();
    this.showTime = 0;
  }

  update(dt: number): void {
    this.showTime += dt;
    if (this.showTime > 0.5 && consumeTap(this.game.input)) {
      playMenuSound();
      this.game.changeState('menu');
    }
  }

  render(renderer: Renderer): void {
    renderer.clear();
    renderer.renderTower((this.game.states.playing as any).tower, (this.game.states.playing as any).cameraY);
    renderer.renderParticles();
    renderer.renderGameOver(this.score, this.highScore, this.isNewRecord);

    if (this.newlyUnlockedSkins.length > 0) {
      const ctx = renderer['ctx'];
      const w = ctx.canvas.width;
      ctx.save();
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.fillText(`NEW SKIN: ${this.newlyUnlockedSkins[0].toUpperCase()}!`, w / 2, 160);
      ctx.restore();
    }
  }

  exit(): void {}
}