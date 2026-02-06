import React, { useState } from 'react';
import { GameState, GameTheme, Skin } from '../types';
import { Hexagon, RotateCcw, Home, ShoppingBag, Lock, Play, Coins, Tv, ArrowLeft, Check, Unlock, Volume2, VolumeX, Settings } from 'lucide-react';
import { LEVELS, SKINS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  currency: number;
  currentTheme: GameTheme;
  
  onStart: (theme: GameTheme) => void;
  onRestart: () => void;
  onToMenu: () => void;
  onOpenShop: () => void;

  // Settings
  sensitivity: number;
  setSensitivity: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;

  // Shop / Progression Props
  unlockedLevelIds: string[];
  unlockedSkinIds: string[];
  selectedSkinId: string;
  onBuyLevel: (level: GameTheme) => void;
  onBuySkin: (skin: Skin) => void;
  onEquipSkin: (skinId: string) => void;
  onWatchAd: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  score, 
  currency,
  currentTheme,
  onStart, 
  onRestart, 
  onToMenu,
  onOpenShop,
  sensitivity,
  setSensitivity,
  isMuted,
  setIsMuted,
  unlockedLevelIds,
  unlockedSkinIds,
  selectedSkinId,
  onBuyLevel,
  onBuySkin,
  onEquipSkin,
  onWatchAd
}) => {
  const [shopTab, setShopTab] = useState<'skins' | 'levels'>('skins');
  const [adLoading, setAdLoading] = useState(false);

  const getTimer = (score: number) => {
    const seconds = (score / 60).toFixed(2);
    return `${seconds}s`;
  };

  const handleAdClick = () => {
    setAdLoading(true);
    // Simulate async
    setTimeout(() => {
        onWatchAd();
        setAdLoading(false);
    }, 1500);
  };

  // --- PLAYING ---
  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="text-white font-arcade text-3xl font-bold tracking-widest drop-shadow-md">
          {getTimer(score)}
        </div>
      </div>
    );
  }

  // --- GAME OVER ---
  if (gameState === GameState.GAMEOVER) {
    // Calc earnings for display
    let pointsEarned = 0;
    if (score > 120) {
        pointsEarned = Math.floor((score / 60) * currentTheme.coinMultiplier);
    }

    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
        <h1 className="text-5xl md:text-8xl text-red-500 font-arcade font-black mb-2 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          Game Over
        </h1>
        <div className="text-white font-arcade text-2xl mb-2">
          Time: <span className="text-yellow-400">{getTimer(score)}</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-arcade text-xl mb-8">
            <Coins className="w-5 h-5" /> +{pointsEarned} Earned {score <= 120 && <span className="text-xs text-gray-500">(Over 2s required)</span>}
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
            onClick={onRestart}
            className="w-full py-4 bg-white text-black font-arcade font-bold text-xl hover:scale-105 transition-transform"
            >
            <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-6 h-6" /> TRY AGAIN
            </span>
            </button>
            <button 
            onClick={onToMenu}
            className="w-full py-4 border-2 border-white text-white font-arcade font-bold text-xl hover:bg-white/10 transition-colors"
            >
            <span className="flex items-center justify-center gap-2">
                <Home className="w-6 h-6" /> MAIN MENU
            </span>
            </button>
        </div>
      </div>
    );
  }

  // --- SHOP ---
  if (gameState === GameState.SHOP) {
    return (
        <div className="absolute inset-0 z-20 bg-gray-900 flex flex-col">
            {/* Shop Header */}
            <div className="p-4 bg-black/50 border-b border-gray-800 flex items-center justify-between">
                <button onClick={onToMenu} className="text-white hover:text-cyan-400">
                    <ArrowLeft className="w-8 h-8" />
                </button>
                <div className="font-arcade text-2xl text-white">SHOP</div>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-mono font-bold">{currency}</span>
                </div>
            </div>

            {/* Ad Banner */}
            <div className="p-2 bg-gradient-to-r from-purple-900 to-blue-900">
                <button 
                    disabled={adLoading}
                    onClick={handleAdClick}
                    className="w-full flex items-center justify-center gap-3 py-2 text-white font-arcade hover:opacity-80 disabled:opacity-50"
                >
                    <Tv className="w-5 h-5" />
                    {adLoading ? "Watching Ad..." : "Watch Ad (+50 Coins)"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button 
                    onClick={() => setShopTab('skins')}
                    className={`flex-1 py-4 font-arcade text-center ${shopTab === 'skins' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500'}`}
                >
                    SKINS
                </button>
                <button 
                    onClick={() => setShopTab('levels')}
                    className={`flex-1 py-4 font-arcade text-center ${shopTab === 'levels' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500'}`}
                >
                    LEVELS
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                {shopTab === 'skins' && SKINS.map(skin => {
                    const isUnlocked = unlockedSkinIds.includes(skin.id);
                    const isEquipped = selectedSkinId === skin.id;
                    const canAfford = currency >= skin.cost;

                    return (
                        <div key={skin.id} className="bg-gray-800 rounded-lg p-3 flex flex-col items-center border border-gray-700">
                            <div className="w-16 h-16 mb-2 flex items-center justify-center">
                                <Hexagon fill={skin.color} className="w-12 h-12" strokeWidth={1} />
                            </div>
                            <div className="text-white font-arcade text-sm mb-1">{skin.name}</div>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onEquipSkin(skin.id)}
                                    className={`mt-auto w-full py-1 text-xs font-bold font-arcade rounded ${isEquipped ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'}`}
                                >
                                    {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onBuySkin(skin)}
                                    disabled={!canAfford}
                                    className={`mt-auto w-full py-1 text-xs font-bold font-arcade rounded flex items-center justify-center gap-1 ${canAfford ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-gray-700 text-gray-500'}`}
                                >
                                    <Coins className="w-3 h-3" /> {skin.cost}
                                </button>
                            )}
                        </div>
                    );
                })}

                {shopTab === 'levels' && LEVELS.map(level => {
                     const isUnlocked = unlockedLevelIds.includes(level.id);
                     const canAfford = currency >= level.unlockCost;

                     return (
                        <div key={level.id} className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 border border-gray-700 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                <Hexagon className="w-20 h-20" fill={level.colors.background} />
                             </div>
                             <div className="font-arcade text-white text-lg">{level.name}</div>
                             <div className="text-xs text-gray-400 font-mono">
                                Earn Rate: {level.coinMultiplier}x
                             </div>

                             {isUnlocked ? (
                                 <div className="mt-auto text-green-400 text-xs font-arcade flex items-center gap-1">
                                     <Check className="w-3 h-3" /> OWNED
                                 </div>
                             ) : (
                                <button 
                                    onClick={() => onBuyLevel(level)}
                                    disabled={!canAfford}
                                    className={`mt-auto w-full py-2 text-xs font-bold font-arcade rounded flex items-center justify-center gap-1 ${canAfford ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-gray-700 text-gray-500'}`}
                                >
                                    <Coins className="w-3 h-3" /> {level.unlockCost}
                                </button>
                             )}
                        </div>
                     );
                })}
            </div>
        </div>
    );
  }

  // --- MENU STATE ---
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden">
        
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-6 max-w-md mt-4">
             {/* Audio Toggle */}
             <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/50 border border-gray-700 text-white">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
             </button>

             <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-gray-700">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-mono font-bold text-lg">{currency}</span>
             </div>
             
             <button 
                onClick={onOpenShop}
                className="bg-cyan-900/50 p-3 rounded-full border border-cyan-500/50 hover:bg-cyan-800 transition-colors"
            >
                <ShoppingBag className="w-6 h-6 text-cyan-400" />
             </button>
        </div>

      <div className="max-w-md w-full flex flex-col items-center flex-1 overflow-hidden">
        
        {/* Title */}
        <div className="text-center relative mb-4 shrink-0">
          <Hexagon className="w-16 h-16 text-cyan-400 mx-auto animate-spin-slow mb-1" strokeWidth={1} />
          <h1 className="text-4xl font-arcade font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-600 tracking-tighter">
            HEX<span className="text-white">AI</span>
          </h1>
        </div>

        {/* Sensitivity Control */}
        <div className="w-full bg-black/60 rounded-lg p-3 mb-4 border border-gray-800">
             <div className="flex items-center gap-2 text-gray-300 font-arcade text-xs mb-1">
                 <Settings className="w-3 h-3" /> Sensitivity: {sensitivity.toFixed(1)}x
             </div>
             <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
             />
        </div>

        {/* Level Selector */}
        <div className="w-full flex-1 overflow-y-auto pr-2 space-y-3 mb-4 scrollbar-hide">
            {LEVELS.map((level) => {
                const isUnlocked = unlockedLevelIds.includes(level.id);
                const isSelected = currentTheme.id === level.id;
                const canAfford = currency >= level.unlockCost;

                return (
                    <button
                        key={level.id}
                        // We allow clicking even if locked to handle buying, and even if selected to restart
                        onClick={() => {
                            if (isUnlocked) {
                                onStart(level);
                            } else if (canAfford) {
                                onBuyLevel(level);
                            } else {
                                onOpenShop();
                            }
                        }}
                        className={`w-full group relative p-4 rounded-xl border transition-all duration-300 flex items-center justify-between
                            ${isSelected ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-black/50 border-gray-800'}
                            ${!isUnlocked && !canAfford ? 'opacity-60 grayscale' : 'hover:bg-white/5'}
                            ${!isUnlocked && canAfford ? 'border-yellow-500/50' : ''}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-gradient-to-br from-gray-800 to-black' : 'bg-gray-900'}`} 
                                 style={{borderColor: isUnlocked ? level.colors.wall : '#333', borderWidth: 2}}>
                                <span className="font-arcade text-white font-bold">{level.config.wallSpeed}</span>
                            </div>
                            <div className="text-left">
                                <div className="text-white font-arcade text-lg leading-none mb-1">{level.name}</div>
                                <div className="text-xs text-gray-400 font-mono flex gap-2">
                                    <span>RATE: {level.config.spawnRate}</span>
                                    <span className="text-yellow-400">EARN: {level.coinMultiplier}x</span>
                                </div>
                            </div>
                        </div>

                        {isUnlocked ? (
                            <div className={`w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <Play className="w-6 h-6 ml-1" />
                            </div>
                        ) : (
                            <div className={`flex items-center gap-1 font-mono text-xs px-2 py-1 rounded transition-colors ${canAfford ? 'bg-yellow-600 text-white animate-pulse' : 'bg-black/80 text-yellow-500'}`}>
                                {canAfford ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} 
                                {canAfford ? 'BUY' : level.unlockCost}
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;