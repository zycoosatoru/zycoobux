import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flame,
  Award,
} from 'lucide-react';
import { Language } from '../types';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'normal' | 'lava' | 'bounce' | 'finish';
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export const ObbyGameView: React.FC<Props> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'gameover'>('idle');
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('obby_highscore') || '0', 10);
  });

  // Mobile touch controls state
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  // Game physics world refs
  const worldRef = useRef({
    player: {
      x: 40,
      y: 280,
      vx: 0,
      vy: 0,
      w: 24,
      h: 32,
      onGround: false,
      spawnX: 40,
      spawnY: 280,
    },
    cameraX: 0,
    platforms: [] as Platform[],
    coins: [] as Coin[],
    animationFrameId: 0,
    startTime: 0,
    elapsed: 0,
  });

  // Build the obstacle course layout
  const buildCourse = useCallback(() => {
    const platforms: Platform[] = [
      // Starting base
      { x: 0, y: 320, w: 200, h: 40, type: 'normal' },

      // Step 1: simple jumps
      { x: 260, y: 300, w: 80, h: 20, type: 'normal' },
      { x: 400, y: 270, w: 90, h: 20, type: 'normal' },

      // Lava hazard floor below jumps
      { x: 200, y: 350, w: 400, h: 30, type: 'lava' },

      // Step 2: High bounce pad
      { x: 550, y: 250, w: 70, h: 20, type: 'bounce' },

      // Elevated platforms
      { x: 690, y: 170, w: 90, h: 20, type: 'normal' },
      { x: 840, y: 160, w: 80, h: 20, type: 'normal' },

      // Lava gap
      { x: 780, y: 350, w: 300, h: 30, type: 'lava' },

      // Step 3: Precise jumps
      { x: 980, y: 190, w: 60, h: 20, type: 'normal' },
      { x: 1100, y: 220, w: 70, h: 20, type: 'normal' },
      { x: 1230, y: 250, w: 80, h: 20, type: 'normal' },

      // Step 4: Final bounce and victory tower
      { x: 1370, y: 280, w: 60, h: 20, type: 'bounce' },
      { x: 1500, y: 140, w: 150, h: 30, type: 'normal' },
      // Finish gate platform
      { x: 1650, y: 120, w: 120, h: 50, type: 'finish' },

      // Pit floor hazard across bottom
      { x: 0, y: 380, w: 2000, h: 40, type: 'lava' },
    ];

    const coins: Coin[] = [
      { x: 290, y: 260, collected: false },
      { x: 435, y: 230, collected: false },
      { x: 575, y: 180, collected: false },
      { x: 725, y: 130, collected: false },
      { x: 870, y: 120, collected: false },
      { x: 1130, y: 180, collected: false },
      { x: 1390, y: 200, collected: false },
      { x: 1550, y: 100, collected: false },
    ];

    worldRef.current.platforms = platforms;
    worldRef.current.coins = coins;
    worldRef.current.player.x = 40;
    worldRef.current.player.y = 280;
    worldRef.current.player.vx = 0;
    worldRef.current.player.vy = 0;
    worldRef.current.cameraX = 0;
    worldRef.current.startTime = Date.now();
  }, []);

  const startGame = useCallback(() => {
    buildCourse();
    setScore(0);
    setCoinsCollected(0);
    setGameState('playing');
    sounds.playJump();
  }, [buildCourse]);

  // Restart after death
  const respawn = useCallback(() => {
    const world = worldRef.current;
    world.player.x = world.player.spawnX;
    world.player.y = world.player.spawnY;
    world.player.vx = 0;
    world.player.vy = 0;
    world.cameraX = 0;
    setDeaths((d) => d + 1);
    sounds.playDefeat();
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        keysRef.current.jump = true;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        keysRef.current.jump = false;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const loop = () => {
      const world = worldRef.current;
      const player = world.player;

      if (gameState === 'playing') {
        // Horizontal Movement
        const speed = 4.5;
        if (keysRef.current.left) {
          player.vx = -speed;
        } else if (keysRef.current.right) {
          player.vx = speed;
        } else {
          player.vx *= 0.7;
        }

        // Jump physics
        if (keysRef.current.jump && player.onGround) {
          player.vy = -10.5;
          player.onGround = false;
          sounds.playJump();
        }

        // Gravity
        player.vy += 0.52;
        if (player.vy > 12) player.vy = 12;

        // Apply velocities
        player.x += player.vx;
        player.y += player.vy;

        // Platform collision checks
        player.onGround = false;
        for (const p of world.platforms) {
          // AABB check
          if (
            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y < p.y + p.h &&
            player.y + player.h > p.y
          ) {
            // Hazard collision (lava)
            if (p.type === 'lava') {
              respawn();
              break;
            }

            // Finish collision
            if (p.type === 'finish') {
              setGameState('won');
              sounds.playUpgrade();
              confetti({ particleCount: 150, spread: 90 });
              const finalScore = Math.max(100, 1000 - Math.floor((Date.now() - world.startTime) / 1000) * 10 + coinsCollected * 100);
              setScore(finalScore);
              if (finalScore > highScore) {
                setHighScore(finalScore);
                localStorage.setItem('obby_highscore', finalScore.toString());
              }
              break;
            }

            // Bounce pad collision
            if (p.type === 'bounce') {
              player.vy = -14.5;
              sounds.playJump();
              break;
            }

            // Regular platform landing from above
            if (player.vy > 0 && player.y + player.h - player.vy <= p.y + 8) {
              player.y = p.y - player.h;
              player.vy = 0;
              player.onGround = true;
            }
          }
        }

        // Check coin collection
        for (const c of world.coins) {
          if (!c.collected) {
            const dist = Math.hypot(player.x + player.w / 2 - c.x, player.y + player.h / 2 - c.y);
            if (dist < 24) {
              c.collected = true;
              setCoinsCollected((prev) => prev + 1);
              sounds.playCoin();
            }
          }
        }

        // Camera follow
        const targetCamX = player.x - canvas.width / 2 + 100;
        world.cameraX += (targetCamX - world.cameraX) * 0.1;
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#131b2e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Parallax Grid Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 20; i++) {
        const starX = ((i * 73 - world.cameraX * 0.2) % canvas.width + canvas.width) % canvas.width;
        const starY = (i * 37) % 200;
        ctx.fillRect(starX, starY, 2, 2);
      }

      ctx.save();
      ctx.translate(-Math.floor(world.cameraX), 0);

      // Render Platforms
      for (const p of world.platforms) {
        if (p.type === 'lava') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          // Lava surface glow
          ctx.fillStyle = '#f97316';
          ctx.fillRect(p.x, p.y, p.w, 4);
        } else if (p.type === 'bounce') {
          ctx.fillStyle = '#8b5cf6';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(p.x, p.y, p.w, 5);
        } else if (p.type === 'finish') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(p.x, p.y, p.w, 6);
          // Finish flag pole
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(p.x + 20, p.y - 40, 4, 40);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(p.x + 24, p.y - 40);
          ctx.lineTo(p.x + 50, p.y - 28);
          ctx.lineTo(p.x + 24, p.y - 16);
          ctx.fill();
        } else {
          // Normal Platform
          ctx.fillStyle = '#334155';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(p.x, p.y, p.w, 4);
        }
      }

      // Render Coins
      for (const c of world.coins) {
        if (!c.collected) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('R$', 0, 0);
          ctx.restore();
        }
      }

      // Render Player (Classic Roblox Noob Avatar)
      if (gameState === 'playing' || gameState === 'won') {
        const px = player.x;
        const py = player.y;

        // Head (Yellow)
        ctx.fillStyle = '#fde047';
        ctx.fillRect(px + 4, py, 16, 12);

        // Face eyes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 7, py + 4, 3, 3);
        ctx.fillRect(px + 14, py + 4, 3, 3);

        // Torso (Blue)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px + 2, py + 12, 20, 12);

        // Legs (Green)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px + 3, py + 24, 8, 8);
        ctx.fillRect(px + 13, py + 24, 8, 8);
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, coinsCollected, highScore, respawn]);

  return (
    <div className="space-y-4">
      {/* Obby Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
            2D Roblox Obby: Lava Escape
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {lang === 'id'
              ? 'Lompati rintangan lava, kumpulkan Robux, dan capai garis finish!'
              : 'Jump over hazardous lava, collect Robux coins, and reach the finish line!'}
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-yellow-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Koin: {coinsCollected}/8</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Respawn: {deaths}</span>
          </div>
          {highScore > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Rekor: {highScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full block object-contain"
        />

        {/* Overlay for Idle / Won */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
              <Sparkles className="w-8 h-8 text-slate-950" />
            </div>
            <h2 className="text-2xl font-black text-white">
              {lang === 'id' ? 'Siap Bermain Obby?' : 'Ready to Run the Obby?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 mb-6">
              {lang === 'id'
                ? 'Gunakan tombol panah / WASD di keyboard atau tombol sentuh di bawah layar untuk melompat.'
                : 'Use arrow keys / WASD on keyboard or the on-screen buttons below to navigate.'}
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/40 cursor-pointer hover:scale-105 transition-transform"
            >
              {lang === 'id' ? 'Mulai Main Sekarang' : 'Start Playing'}
            </button>
          </div>
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
              {lang === 'id' ? 'STAGE SELESAI!' : 'OBBY COMPLETED!'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {lang === 'id' ? 'Hebat! Kamu berhasil menaklukkan lava.' : 'Great job! You conquered the lava run.'}
            </p>
            <div className="my-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white">
              Skor Akhir: <span className="text-yellow-400">{score}</span>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg cursor-pointer"
            >
              {lang === 'id' ? 'Main Lagi' : 'Play Again'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile On-Screen Touch Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onPointerDown={() => {
              keysRef.current.left = true;
            }}
            onPointerUp={() => {
              keysRef.current.left = false;
            }}
            onPointerLeave={() => {
              keysRef.current.left = false;
            }}
            className="w-14 h-14 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-white shadow-md select-none touch-none"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => {
              keysRef.current.right = true;
            }}
            onPointerUp={() => {
              keysRef.current.right = false;
            }}
            onPointerLeave={() => {
              keysRef.current.right = false;
            }}
            className="w-14 h-14 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-white shadow-md select-none touch-none"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="text-xs text-slate-400 text-center hidden sm:block">
          {lang === 'id'
            ? '💡 Tips: Ungu adalah Jump Pad pantul, merah adalah lava mematikan!'
            : '💡 Tip: Purple is high jump pad, red is lethal lava!'}
        </div>

        <div>
          <button
            onPointerDown={() => {
              keysRef.current.jump = true;
            }}
            onPointerUp={() => {
              keysRef.current.jump = false;
            }}
            onPointerLeave={() => {
              keysRef.current.jump = false;
            }}
            className="w-20 h-14 rounded-xl bg-emerald-600 active:bg-emerald-500 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-900/40 select-none touch-none gap-1"
            aria-label="Jump"
          >
            <ArrowUp className="w-5 h-5" />
            <span>LOMPAT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
