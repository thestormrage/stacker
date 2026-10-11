import type { GameStateType } from './types';
import { CONFIG } from './config';
import { createInput, setupInput, updateInput, type InputState } from './systems/Input';
import { Renderer } from './systems/Renderer';
import { initAudio, setAudioEnabled } from './systems/Audio';
import { MenuState } from './states/MenuState';
import { PlayState } from './states/PlayState';
import { GameOverState } from './states/GameOverState';
import { GameState } from './states/GameState';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  renderer: Renderer;
  input: InputState;
  states: Record<GameStateType, GameState>;
  currentState: GameState;
  currentStateType: GameStateType = 'menu';
  lastTime = 0;
  running = false;
  cleanupInput: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    this.renderer = new Renderer(canvas);
    this.input = createInput();

    this.states = {
      menu: new MenuState(this, this.renderer),
      playing: new PlayState(this, this.renderer),
      gameover: new GameOverState(this, this.renderer),
    };
    this.currentState = this.states.menu;
  }

  init(): void {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.cleanupInput = setupInput(this.input, this.canvas);
    initAudio();

    this.currentState.enter();
    this.running = true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect() || { width: CONFIG.canvasWidth, height: CONFIG.canvasHeight };
    const scale = Math.min(rect.width / CONFIG.canvasWidth, rect.height / CONFIG.canvasHeight);
    const width = Math.floor(CONFIG.canvasWidth * scale);
    const height = Math.floor(CONFIG.canvasHeight * scale);

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = CONFIG.canvasWidth;
    this.canvas.height = CONFIG.canvasHeight;

    this.renderer.resize(CONFIG.canvasWidth, CONFIG.canvasHeight);
  }

  private gameLoop(time: number): void {
    if (!this.running) return;

    const dt = Math.min((time - this.lastTime) / 1000, 1 / 30);
    this.lastTime = time;

    this.currentState.update(dt);
    this.currentState.render(this.renderer);
    updateInput(this.input);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  changeState(type: GameStateType): void {
    this.currentState.exit();
    this.currentState = this.states[type];
    this.currentStateType = type;
    this.currentState.enter();
  }

  toggleAudio(): void {
    setAudioEnabled(!this.isAudioEnabled());
  }

  isAudioEnabled(): boolean {
    return true;
  }

  destroy(): void {
    this.running = false;
    if (this.cleanupInput) this.cleanupInput();
    window.removeEventListener('resize', () => this.resize());
  }
}