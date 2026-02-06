export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  SHOP = 'SHOP',
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  cost: number;
}

export interface GameTheme {
  id: string;
  name: string;
  unlockCost: number; // Cost to unlock
  coinMultiplier: number; // Multiplier for currency earning
  colors: {
    background: string;
    backgroundPulse: string; 
    player: string;
    wall: string;
    center: string; // Default center color, overridden by skins if equipped
  };
  config: {
    rotationSpeed: number; 
    wallSpeed: number; 
    spawnRate: number; 
    sides: number; 
  };
}

export interface Wall {
  id: number;
  side: number; 
  distance: number;
  type: 'standard';
  thickness: number;
}