export type InputEvent = 'tap' | 'keydown' | 'touchstart';

export interface InputState {
  tapped: boolean;
  justTapped: boolean;
}

export function createInput(): InputState {
  return {
    tapped: false,
    justTapped: false,
  };
}

export function setupInput(input: InputState, canvas: HTMLCanvasElement): () => void {
  const handleTap = () => {
    input.tapped = true;
    input.justTapped = true;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp') {
      e.preventDefault();
      handleTap();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    handleTap();
  };

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('keydown', handleKeyDown);

  return () => {
    canvas.removeEventListener('click', handleTap);
    canvas.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('keydown', handleKeyDown);
  };
}

export function updateInput(input: InputState): void {
  input.justTapped = false;
}

export function consumeTap(input: InputState): boolean {
  if (input.justTapped) {
    input.justTapped = false;
    return true;
  }
  return false;
}