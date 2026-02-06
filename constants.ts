import { GameTheme, Skin } from './types';

// SKINS CATALOG
export const SKINS: Skin[] = [
  { id: 'default', name: 'Pure White', color: '#ffffff', cost: 0 },
  { id: 'gold', name: 'Midas Gold', color: '#ffd700', cost: 100 },
  { id: 'neon_blue', name: 'Cyber Blue', color: '#00ffff', cost: 250 },
  { id: 'neon_pink', name: 'Hot Pink', color: '#ff00ff', cost: 250 },
  { id: 'crimson', name: 'Blood Red', color: '#dc143c', cost: 500 },
  { id: 'emerald', name: 'Emerald', color: '#50c878', cost: 500 },
  { id: 'void', name: 'The Void', color: '#000000', cost: 1000 },
  { id: 'rainbow', name: 'Rainbow', color: '#ff9900', cost: 2000 }, // Special handling in renderer potentially, keeping simple color for now
];

// LEVEL GENERATOR HELPER
const createLevel = (
  id: string, 
  name: string, 
  cost: number, 
  multiplier: number,
  bg: string, 
  wall: string, 
  rot: number, 
  speed: number, 
  spawn: number
): GameTheme => ({
  id,
  name,
  unlockCost: cost,
  coinMultiplier: multiplier,
  colors: {
    background: bg,
    backgroundPulse: adjustColor(bg, 15),
    player: invertColor(bg),
    wall: wall,
    center: '#ffffff'
  },
  config: {
    rotationSpeed: rot,
    wallSpeed: speed,
    spawnRate: spawn,
    sides: 6
  }
});

// Helper to lighten/darken hex (simple version)
function adjustColor(color: string, amount: number) {
    return color; // Placeholder for simplicity, using flat colors in definitions usually
}
function invertColor(color: string) {
    return '#ffffff'; // Placeholder
}

// 10 LEVELS DEFINITION
// spawnRate increased for early levels to create larger gaps
// Added coin multipliers: Harder levels = more money
export const LEVELS: GameTheme[] = [
  createLevel('lvl_1', 'Tutorial', 0, 0.2, '#111111', '#444444', 0.01, 2.0, 90),
  createLevel('lvl_2', 'Beginner', 0, 0.5, '#0a0a2a', '#00ffff', 0.015, 3.0, 75),
  createLevel('lvl_3', 'Advance', 150, 1.0, '#1a0a0a', '#ff5500', 0.02, 3.5, 65),
  createLevel('lvl_4', 'Fast', 500, 1.2, '#001a00', '#00ff00', 0.025, 4.0, 55),
  createLevel('lvl_5', 'Faster', 2000, 1.5, '#1a001a', '#ff00ff', 0.03, 4.5, 45),
  createLevel('lvl_6', 'Hardcore', 4000, 2.0, '#2a2a00', '#ffff00', 0.035, 5.0, 35),
  createLevel('lvl_7', 'Super', 6000, 2.5, '#002a2a', '#00ffff', 0.04, 5.5, 30),
  createLevel('lvl_8', 'Hyper', 10000, 3.0, '#2a0000', '#ff0000', 0.05, 6.0, 25),
  createLevel('lvl_9', 'Ultra', 20000, 4.0, '#333333', '#ffffff', 0.06, 7.0, 22),
  createLevel('lvl_10', 'Impossible', 30000, 5.0, '#000000', '#ffffff', 0.08, 8.0, 18),
];

export const DEFAULT_THEME = LEVELS[0];