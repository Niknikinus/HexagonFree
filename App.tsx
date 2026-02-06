import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState, GameTheme, Skin } from './types';
import { LEVELS, SKINS } from './constants';

// Use absolute paths assuming files are in the public root
const MUSIC_TRACKS = ['/music1.mp3', '/music2.mp3'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(LEVELS[0]);
  const [score, setScore] = useState(0);

  // Settings
  const [sensitivity, setSensitivity] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Shop & Progress State
  const [currency, setCurrency] = useState(0);
  const [unlockedLevelIds, setUnlockedLevelIds] = useState<string[]>(['lvl_1', 'lvl_2']);
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(['default']);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('default');

  // Initialize Audio Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  // 1. Handle Track Changes (Only reload when track index actually changes)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        // Reload audio source
        audio.load();
        
        // If we change tracks while playing, auto-play the new one
        if (gameState === GameState.PLAYING && !isMuted) {
            audio.play().catch(e => console.warn("Track switch auto-play blocked", e));
        }
    }
  }, [currentTrackIndex]); // Intentionally exclude gameState to prevent reloads on state change

  // 2. Handle Game State & Mute Changes (Play/Pause logic)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
        audio.pause();
    } else {
        if (gameState === GameState.PLAYING) {
            // Resume if paused
            if (audio.paused) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.warn("State change auto-play blocked", e));
                }
            }
        } else {
            // Stop music in Menu/Shop/GameOver
            audio.pause();
            if (gameState === GameState.MENU) {
                // Optional: Reset to start when going back to menu
                audio.currentTime = 0;
            }
        }
    }
  }, [gameState, isMuted]);

  // Handle Track Switching Logic
  const handleTrackEnded = () => {
    // Switch to next track or random
    const nextIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
    setCurrentTrackIndex(nextIndex);
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      console.warn("Audio error: source not found or unsupported format. Path:", e.currentTarget.src);
  };

  const getSkinColor = () => {
    return SKINS.find(s => s.id === selectedSkinId)?.color || '#ffffff';
  };

  const startGame = (theme: GameTheme) => {
    setCurrentTheme(theme);
    setGameState(GameState.PLAYING);
    setScore(0);
    
    // Explicitly play on user interaction (Click)
    if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.warn("Start Game play failed", e));
    }
  };

  const restartGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    // Explicitly play on user interaction (Click)
    if (audioRef.current && !isMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn("Restart play failed", e));
    }
  };

  const goToMenu = () => {
    setGameState(GameState.MENU);
  };

  const openShop = () => {
    setGameState(GameState.SHOP);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    
    let pointsEarned = 0;
    const MIN_FRAMES_FOR_REWARD = 120; // 2 seconds

    if (finalScore > MIN_FRAMES_FOR_REWARD) {
        const secondsSurvived = finalScore / 60;
        pointsEarned = Math.floor(secondsSurvived * currentTheme.coinMultiplier);
    }

    setCurrency(prev => prev + pointsEarned);
    setGameState(GameState.GAMEOVER);
  };

  // Shop Logic
  const handleBuyLevel = (level: GameTheme) => {
    if (currency >= level.unlockCost && !unlockedLevelIds.includes(level.id)) {
      setCurrency(prev => prev - level.unlockCost);
      setUnlockedLevelIds(prev => [...prev, level.id]);
    }
  };

  const handleBuySkin = (skin: Skin) => {
    if (currency >= skin.cost && !unlockedSkinIds.includes(skin.id)) {
      setCurrency(prev => prev - skin.cost);
      setUnlockedSkinIds(prev => [...prev, skin.id]);
    }
  };

  const handleEquipSkin = (skinId: string) => {
    if (unlockedSkinIds.includes(skinId)) {
      setSelectedSkinId(skinId);
    }
  };

  const handleWatchAd = () => {
    setTimeout(() => {
      setCurrency(prev => prev + 50);
      alert("Ad watched! +50 Coins");
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans select-none">
      
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        src={MUSIC_TRACKS[currentTrackIndex]} 
        onEnded={handleTrackEnded}
        onError={handleAudioError}
        preload="auto"
      />

      <div className="absolute inset-0" style={{backgroundColor: currentTheme.colors.background}} />

      <GameCanvas 
        gameState={gameState} 
        theme={currentTheme} 
        skinColor={getSkinColor()}
        sensitivity={sensitivity}
        onGameOver={handleGameOver}
        setScore={setScore}
      />

      <UIOverlay 
        gameState={gameState}
        score={score}
        currency={currency}
        onStart={startGame}
        onRestart={restartGame}
        onToMenu={goToMenu}
        onOpenShop={openShop}
        currentTheme={currentTheme}
        
        // Settings
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
        isMuted={isMuted}
        setIsMuted={setIsMuted}

        // Shop Data
        unlockedLevelIds={unlockedLevelIds}
        unlockedSkinIds={unlockedSkinIds}
        selectedSkinId={selectedSkinId}
        onBuyLevel={handleBuyLevel}
        onBuySkin={handleBuySkin}
        onEquipSkin={handleEquipSkin}
        onWatchAd={handleWatchAd}
      />
    </div>
  );
};

export default App;