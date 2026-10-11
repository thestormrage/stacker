import { Game } from './game';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);
game.init();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy();
  });
}

declare global {
  interface Window {
    __STACKER_GAME__: Game;
  }
}
window.__STACKER_GAME__ = game;