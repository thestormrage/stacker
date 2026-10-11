export abstract class GameState {
  protected game: any;

  constructor(game: any) {
    this.game = game;
  }

  abstract enter(): void;
  abstract update(dt: number): void;
  abstract render(renderer: any): void;
  abstract exit(): void;
}