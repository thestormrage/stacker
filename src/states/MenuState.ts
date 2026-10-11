import { GameState } from './GameState';
import { loadSave } from '../storage';
import { Renderer } from '../systems/Renderer';
import { playMenuSound } from '../systems/Audio';

export class MenuState extends GameState {
  private renderer: Renderer;
  private save: ReturnType<typeof loadSave>;

  constructor(game: any, renderer: Renderer) {
    super(game);
    this.renderer = renderer;
    this.save = loadSave();
  }

  enter(): void {
    this.save = loadSave();
  }

  update(_dt: number): void {
    if (this.game.input.justTapped) {
      playMenuSound();
      this.game.changeState('playing');
    }
  }

  render(_renderer: Renderer): void {
    this.renderer.renderMenu(this.save.highScore, this.save.currentSkin);
  }

  exit(): void {}
}