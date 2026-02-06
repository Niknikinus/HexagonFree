import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameTheme, Wall } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  theme: GameTheme;
  skinColor: string;
  sensitivity: number; // Sensitivity Multiplier
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
}

const PLAYER_RADIUS = 85; 
const PLAYER_SIZE = 10;
const WALL_THICKNESS_BASE = 40;
const CENTER_HEX_SIZE = 45; 

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, theme, skinColor, sensitivity, onGameOver, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  
  // Game State Refs
  const playerAngleRef = useRef<number>(0);
  const worldRotationRef = useRef<number>(0);
  const wallsRef = useRef<Wall[]>([]);
  const frameCountRef = useRef<number>(0);
  const inputRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const isGameOverRef = useRef<boolean>(false);

  // Audio simulation
  const pulseRef = useRef<number>(1);
  const pulseDirRef = useRef<number>(1);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
        const touchX = e.touches[0].clientX;
        const width = window.innerWidth;
        if (touchX < width / 2) inputRef.current.left = true;
        else inputRef.current.right = true;
    };
    const handleTouchEnd = () => {
        inputRef.current.left = false;
        inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Reset Game
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      playerAngleRef.current = 0;
      worldRotationRef.current = 0;
      wallsRef.current = [];
      scoreRef.current = 0;
      frameCountRef.current = 0;
      isGameOverRef.current = false;
      setScore(0);
    }
  }, [gameState, setScore]);

  // Main Loop
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx && gameState === GameState.PLAYING && !isGameOverRef.current) {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      // Logic Update
      const speedMultiplier = 1 + (scoreRef.current / 1000); 
      
      // Apply sensitivity here
      const moveSpeed = 0.17 * speedMultiplier * sensitivity;
      
      if (inputRef.current.left) playerAngleRef.current -= moveSpeed;
      if (inputRef.current.right) playerAngleRef.current += moveSpeed;

      worldRotationRef.current += theme.config.rotationSpeed * ((frameCountRef.current % 1000 > 500) ? 1 : -1);

      if (frameCountRef.current % 30 === 0) {
        pulseDirRef.current *= -1;
      }
      pulseRef.current += 0.005 * pulseDirRef.current;
      if (pulseRef.current > 1.1) pulseRef.current = 1.1;
      if (pulseRef.current < 0.9) pulseRef.current = 0.9;

      frameCountRef.current++;
      const currentSpawnRate = Math.max(15, Math.floor(theme.config.spawnRate - (scoreRef.current / 60)));
      
      if (frameCountRef.current % currentSpawnRate === 0) {
        const gapSide = Math.floor(Math.random() * theme.config.sides);
        const thickness = WALL_THICKNESS_BASE + Math.random() * 20;
        
        for (let i = 0; i < theme.config.sides; i++) {
            if (i !== gapSide) {
                wallsRef.current.push({
                    id: Date.now() + i,
                    side: i,
                    distance: maxDist, 
                    type: 'standard',
                    thickness: thickness
                });
            }
        }
      }

      for (let i = wallsRef.current.length - 1; i >= 0; i--) {
        const wall = wallsRef.current[i];
        wall.distance -= theme.config.wallSpeed * speedMultiplier;

        const wallInner = wall.distance;
        const wallOuter = wall.distance + wall.thickness;
        const playerR = PLAYER_RADIUS;

        if (wallInner < playerR + PLAYER_SIZE && wallOuter > playerR - PLAYER_SIZE) {
            let normalizedAngle = (playerAngleRef.current % (Math.PI * 2));
            if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
            
            const sectorSize = (Math.PI * 2) / theme.config.sides;
            const wallStartAngle = wall.side * sectorSize;
            const wallEndAngle = (wall.side + 1) * sectorSize;
            const pAng = normalizedAngle;
            
            if (pAng >= wallStartAngle && pAng < wallEndAngle) {
                 isGameOverRef.current = true;
                 onGameOver(Math.floor(scoreRef.current));
            }
        }

        if (wall.distance + wall.thickness < 0) {
            wallsRef.current.splice(i, 1);
        }
      }

      if (!isGameOverRef.current) {
        scoreRef.current += 1;
        setScore(Math.floor(scoreRef.current));
      }

      // Render
      ctx.fillStyle = (frameCountRef.current % 20 < 10) ? theme.colors.background : theme.colors.backgroundPulse;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(centerX, centerY);
      
      ctx.rotate(worldRotationRef.current);
      ctx.scale(pulseRef.current, pulseRef.current);

      const sides = theme.config.sides;
      const angleStep = (Math.PI * 2) / sides;

      // Draw Center Polygon with SKIN COLOR
      ctx.beginPath();
      ctx.fillStyle = skinColor; // Use skin color here
      for (let i = 0; i <= sides; i++) {
        const theta = i * angleStep;
        const r = CENTER_HEX_SIZE + (Math.sin(frameCountRef.current * 0.2) * 5); 
        ctx.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
      }
      ctx.fill();

      ctx.fillStyle = theme.colors.wall;
      wallsRef.current.forEach(wall => {
        const startAngle = wall.side * angleStep;
        const endAngle = (wall.side + 1) * angleStep;
        const padding = 0.02;

        ctx.beginPath();
        ctx.moveTo(Math.cos(startAngle + padding) * (wall.distance + wall.thickness), Math.sin(startAngle + padding) * (wall.distance + wall.thickness));
        ctx.lineTo(Math.cos(endAngle - padding) * (wall.distance + wall.thickness), Math.sin(endAngle - padding) * (wall.distance + wall.thickness));
        ctx.lineTo(Math.cos(endAngle - padding) * wall.distance, Math.sin(endAngle - padding) * wall.distance);
        ctx.lineTo(Math.cos(startAngle + padding) * wall.distance, Math.sin(startAngle + padding) * wall.distance);
        ctx.closePath();
        ctx.fill();
      });

      ctx.rotate(playerAngleRef.current);
      ctx.fillStyle = theme.colors.player;
      ctx.beginPath();
      ctx.moveTo(PLAYER_RADIUS + PLAYER_SIZE, 0);
      ctx.lineTo(PLAYER_RADIUS - PLAYER_SIZE, PLAYER_SIZE);
      ctx.lineTo(PLAYER_RADIUS - PLAYER_SIZE, -PLAYER_SIZE);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [gameState, theme, skinColor, sensitivity, onGameOver, setScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block absolute top-0 left-0 w-full h-full cursor-none"
    />
  );
};

export default GameCanvas;