import { useEffect, useRef } from 'react';
import { Reel, VisualType } from '../types';

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
}

export default function ReelPlayer({ reel, isActive }: ReelPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set high-DPI resolution
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle pool for effects
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      shape?: 'circle' | 'square' | 'sparkle' | 'coin';
      rotation?: number;
      vrot?: number;
    }> = [];

    const addParticles = (x: number, y: number, count = 10, color = '#f59e0b', shape: 'circle' | 'square' | 'sparkle' | 'coin' = 'circle') => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 3 + Math.random() * 6,
          color,
          alpha: 1,
          shape,
          rotation: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.2
        });
      }
    };

    // Keep particle limit to save CPU
    const pruneParticles = () => {
      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    };

    // Simulation states
    let frame = 0;
    
    // Slime ASMR simulation state
    let sliceX = 50;
    let sliceDir = 1.2;
    const slimes: Array<{ x: number; y: number; r: number; color: string; cut: boolean }> = [];
    for (let i = 0; i < 5; i++) {
      slimes.push({
        x: 80 + i * 45,
        y: 220,
        r: 16,
        color: `hsl(${(120 + i * 40) % 360}, 85%, 60%)`,
        cut: false
      });
    }

    // Crypto rocket state
    const candles: Array<{ x: number; open: number; close: number; high: number; low: number; col: string }> = [];
    for (let i = 0; i < 15; i++) {
      const isGreen = Math.random() > 0.45;
      const base = 250 - i * 8;
      candles.push({
        x: 40 + i * 18,
        open: base + (isGreen ? 20 : -20),
        close: base + (isGreen ? -20 : 20),
        high: base - 40,
        low: base + 40,
        col: isGreen ? '#10b981' : '#ef4444'
      });
    }

    // Hydraulic press state
    let pressY = 60;
    let pressDir = 1;
    let gemSplattered = false;
    let gems = [
      { x: 100, y: 320, r: 20, col: '#a855f7', label: '10x' },
      { x: 180, y: 320, r: 24, col: '#3b82f6', label: 'JACKPOT' },
      { x: 260, y: 320, r: 18, col: '#f43f5e', label: '5x' }
    ];

    // Pixel Miner game state
    let minerX = 60;
    let minerDir = 1;
    let swingAngle = 0;
    let blockHP = 5;
    const blockX = 180;
    const blockY = 300;

    // Slots machine simulation state
    const reelsConfig = [
      { syms: ['🎰', '🍒', '🍉', '💎', '🔔', '👑', '7️⃣'], y: 0, speed: 0.5 },
      { syms: ['7️⃣', '🎰', '🔔', '🍉', '🍒', '👑', '💎'], y: 30, speed: 0.8 },
      { syms: ['💎', '🔑', '7️⃣', '🎰', '🍒', '🍉', '👑'], y: 60, speed: 0.4 }
    ];

    // Main Draw System
    const render = () => {
      if (!ctx || !canvas) return;

      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      if (w === 0 || h === 0) return;

      // Draw background
      // Create rich ambient dark gradient matching the post custom color
      const baseColor = reel.customColor;
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#0c0118'); // deep dark purple space
      gradient.addColorStop(0.6, '#020005'); // solid black purple
      gradient.addColorStop(1, baseColor + '20'); // soft color tint glow
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      frame++;

      // Draw some background neon grids
      ctx.strokeStyle = '#33415525';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      // ----------------------------------------------------
      // DRAW VISUAL ENGINE DEPENDING ON REEL VISUAL TYPE
      // ----------------------------------------------------
      if (reel.visualType === 'slots') {
        // Draw neon casino columns and giant spinning slots matrix
        ctx.save();
        ctx.translate(w / 2, h / 2 - 20);

        // Grid border
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-120, -100, 240, 180, 12);
        ctx.fill();
        ctx.strokeStyle = reel.customColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Neon header
        ctx.shadowColor = reel.customColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = reel.customColor;
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('JACKPOT BONANZA 777', 0, -115);

        // Spin columns
        reelsConfig.forEach((col, idx) => {
          const colX = -80 + idx * 80;
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(colX - 30, -75, 60, 130);

          if (isActive) {
            col.y = (col.y + col.speed * 8) % (col.syms.length * 35);
          }

          ctx.save();
          // Clip slot cell
          ctx.beginPath();
          ctx.rect(colX - 30, -75, 60, 130);
          ctx.clip();

          ctx.font = '28px "Inter", sans-serif';
          ctx.textAlign = 'center';

          // Draw repeating items vertically
          for (let i = -1; i < col.syms.length + 1; i++) {
            const sym = col.syms[(i + col.syms.length) % col.syms.length];
            const symY = -40 + i * 40 - (col.y % 40);
            ctx.fillText(sym, colX, symY);
          }
          ctx.restore();
        });

        // Payline neon ray
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#e11d48cc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-115, -10);
        ctx.lineTo(115, -10);
        ctx.stroke();

        ctx.restore();

        // Add periodic background floating coins if active
        if (isActive && frame % 40 === 0) {
          addParticles(Math.random() * w, h, 2, '#f59e0b', 'coin');
        }

      } else if (reel.visualType === 'asmr') {
        // ASMR slime mixing and knife slicing action!
        ctx.save();
        
        // Slicing Platform
        ctx.fillStyle = '#334155';
        ctx.fillRect(30, 240, w - 60, 15);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(30, 240, w - 60, 15);

        // Neon Slimes
        slimes.forEach((slime, idx) => {
          ctx.shadowColor = slime.color;
          ctx.shadowBlur = slime.cut ? 0 : 8;
          ctx.fillStyle = slime.color;

          if (slime.cut) {
            // Drawn split apart
            ctx.beginPath();
            ctx.arc(slime.x - 8, slime.y + 10, slime.r, Math.PI, Math.PI * 1.8);
            ctx.lineTo(slime.x - 8, slime.y + 10);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(slime.x + 8, slime.y + 10, slime.r, Math.PI * 1.2, Math.PI * 2);
            ctx.lineTo(slime.x + 8, slime.y + 10);
            ctx.fill();
          } else {
            // Perfect globe slime
            ctx.beginPath();
            ctx.arc(slime.x, slime.y + 5, slime.r, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // ASMR instructions
        ctx.shadowBlur = 6;
        ctx.shadowColor = reel.customColor;
        ctx.fillStyle = '#f8fafc';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ CRUNCHY SOUND ON ⚡', w / 2, 70);

        // Slicing Knife
        if (isActive) {
          sliceX += sliceDir * 1.5;
          if (sliceX > w - 50 || sliceX < 50) {
            sliceDir *= -1;
          }

          // Check if knife hits a slime
          slimes.forEach(slime => {
            if (Math.abs(sliceX - slime.x) < 14 && !slime.cut) {
              slime.cut = true;
              addParticles(slime.x, slime.y, 12, slime.color, 'circle');
            }
          });

          // Reset sliced slime if all cut
          if (slimes.every(s => s.cut)) {
            setTimeout(() => {
              slimes.forEach(s => s.cut = false);
            }, 1000);
          }
        }

        // Draw Knife
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#cbd5e1';
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(sliceX - 2, 120);
        ctx.lineTo(sliceX + 2, 120);
        ctx.lineTo(sliceX + 4, 180);
        ctx.lineTo(sliceX - 8, 210);
        ctx.closePath();
        ctx.fill();

        // Wooden Knife handle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(sliceX - 3, 90, 6, 30);

        ctx.restore();

      } else if (reel.visualType === 'crypto') {
        // Crypto green rocket chart spikes
        ctx.save();
        
        // Stock Header
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('APE_MOON_INDEX (HODL)', 30, 65);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText('$184,332.08 🚀', 30, 95);

        // Grid charts
        candles.forEach((c) => {
          ctx.strokeStyle = c.col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(c.x, c.low);
          ctx.lineTo(c.x, c.high);
          ctx.stroke();

          ctx.fillStyle = c.col;
          ctx.fillRect(c.x - 6, Math.min(c.open, c.close), 12, Math.abs(c.open - c.close));

          // Hover ripple
          if (isActive && frame % 100 === 0) {
            c.open = c.open + (Math.random() - 0.5) * 15;
            c.close = c.close + (Math.random() - 0.5) * 15;
          }
        });

        // Glowing flying Rocket ship
        const rX = 120 + Math.sin(frame * 0.05) * 80;
        const rY = 220 + Math.cos(frame * 0.03) * 35;

        ctx.font = '36px "Inter", sans-serif';
        ctx.fillText('🚀', rX - 18, rY);

        if (isActive) {
          addParticles(rX + 10, rY + 18, 1, '#f59e0b', 'sparkle');
        }

        ctx.restore();

      } else if (reel.visualType === 'cooking') {
        // Flaming skillet luxury cooking
        ctx.save();

        // Draw stove flames
        for (let i = 0; i < 5; i++) {
          const fx = 70 + i * 55;
          const fy = 320 + Math.sin(frame * 0.1 + i) * 10;
          const fireGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 25);
          fireGrad.addColorStop(0, '#f59e0b');
          fireGrad.addColorStop(0.5, '#ef444499');
          fireGrad.addColorStop(1, '#ef444400');
          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.arc(fx, fy, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Animated silver saute pan
        const panBounceY = Math.sin(frame * 0.08) * 8;
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(w / 2, 260 + panBounceY, 70, 0, Math.PI, false);
        ctx.fill();
        // Spatula handle
        ctx.fillStyle = '#475569';
        ctx.fillRect(w / 2 - 80, 240 + panBounceY, 60, 8);

        // Chef pizza slicing or toppings popping
        ctx.font = '32px "Inter", sans-serif';
        const toppingX1 = w / 2 - 30 + Math.sin(frame * 0.04) * 15;
        const toppingY1 = 180 + Math.cos(frame * 0.06) * 20;

        const toppingX2 = w / 2 + 20 + Math.cos(frame * 0.05) * 25;
        const toppingY2 = 160 + Math.sin(frame * 0.07) * 30;

        ctx.fillText('🍕', toppingX1, toppingY1);
        ctx.fillText('💎', toppingX2, toppingY2);

        if (isActive && frame % 12 === 0) {
          addParticles(toppingX1 + 16, toppingY1 + 16, 2, '#fbbf24', 'sparkle');
        }

        // Fun float caption
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('★ SIZZLING BONUS ★', w / 2 - 50, 110);

        ctx.restore();

      } else if (reel.visualType === 'satisfying') {
        // Hydraulic press action
        ctx.save();
        
        // Steel base
        ctx.fillStyle = '#475569';
        ctx.fillRect(40, 330, w - 80, 25);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 345, w - 80, 10);

        // Gems on base
        gems.forEach((gem, idx) => {
          if (!gemSplattered) {
            ctx.shadowColor = gem.col;
            ctx.shadowBlur = 12;
            ctx.fillStyle = gem.col;
            ctx.beginPath();
            ctx.moveTo(gem.x, gem.y - gem.r);
            ctx.lineTo(gem.x + gem.r, gem.y);
            ctx.lineTo(gem.x, gem.y + gem.r);
            ctx.lineTo(gem.x - gem.r, gem.y);
            ctx.closePath();
            ctx.fill();

            // Gem core
            ctx.fillStyle = '#ffffff99';
            ctx.beginPath();
            ctx.moveTo(gem.x, gem.y - gem.r + 5);
            ctx.lineTo(gem.x + 5, gem.y);
            ctx.lineTo(gem.x, gem.y + gem.r - 5);
            ctx.lineTo(gem.x - 5, gem.y);
            ctx.closePath();
            ctx.fill();

            // Tag/Bonus text
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(gem.label, gem.x, gem.y - gem.r - 6);
          }
        });

        // Hydraulic press calculations
        if (isActive) {
          pressY += pressDir * 1.5;
          if (pressY > 280) {
            pressDir = -0.6; // recoil
            if (!gemSplattered) {
              gemSplattered = true;
              // Explode particles!
              gems.forEach(g => {
                addParticles(g.x, g.y, 16, g.col, 'sparkle');
                addParticles(g.x, g.y, 6, '#fbbf24', 'coin');
              });
            }
          }
          if (pressY < 80) {
            pressY = 80;
            pressDir = 1.2; // restart drop
            gemSplattered = false;
          }
        }

        // Draw hydraulic cylinder steel plate
        ctx.shadowColor = '#00000080';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(60, 0, w - 120, pressY);
        // Yellow warning warning strips
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(60, pressY - 14, w - 120, 14);
        ctx.fillStyle = '#0f172a';
        for (let i = 70; i < w - 70; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, pressY - 14);
          ctx.lineTo(i + 15, pressY);
          ctx.lineTo(i + 25, pressY);
          ctx.lineTo(i + 10, pressY - 14);
          ctx.closePath();
          ctx.fill();
        }

        // Heavy press anvil plate
        ctx.fillStyle = '#334155';
        ctx.fillRect(50, pressY, w - 100, 15);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, pressY, w - 100, 15);

        ctx.restore();

      } else if (reel.visualType === 'pixel_miner') {
        // Retro chiptune brick break and gold rush
        ctx.save();

        // Mine platform
        ctx.fillStyle = '#45220c'; // brown dirt
        ctx.fillRect(0, 320, w, h - 320);
        ctx.fillStyle = '#110602';
        ctx.fillRect(0, 316, w, 4);

        // Voxel gold block
        if (blockHP > 0) {
          ctx.fillStyle = '#eab308'; // solid gold
          ctx.fillRect(blockX - 25, blockY - 25, 50, 50);
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 3;
          ctx.strokeRect(blockX - 25, blockY - 25, 50, 50);

          // Sparkles inside gold
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(blockX - 15, blockY - 15, 8, 8);
          ctx.fillRect(blockX + 8, blockY + 5, 6, 6);

          // Draw block HP indicator
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(blockX - 20, blockY - 38, 40, 5);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(blockX - 20, blockY - 38, (blockHP / 5) * 40, 5);
        } else {
          // Explode ore, reconstruct after delay
          if (isActive && frame % 100 === 0) {
            blockHP = 5;
          }
        }

        // Swinging animation
        if (isActive) {
          swingAngle = Math.sin(frame * 0.15) * 1.1 - 0.5;

          // Swing trigger hit
          if (swingAngle < -1.2 && blockHP > 0 && frame % 12 === 0) {
            blockHP -= 1;
            addParticles(blockX, blockY, 8, '#eab308', 'square');
            addParticles(blockX, blockY, 3, '#eab308', 'coin');
          }
        }

        // Draw cute stick figures swinging golden pickaxe
        ctx.save();
        ctx.translate(blockX - 80, blockY + 10);
        
        // Head
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(0, -32, 10, 0, Math.PI * 2);
        ctx.fill();

        // Body sticks
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, 10);
        ctx.stroke();

        // Leg sticks
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-12, 30);
        ctx.moveTo(0, 10);
        ctx.lineTo(12, 30);
        ctx.stroke();

        // Arm sticks holding tool
        ctx.save();
        ctx.translate(0, -14);
        ctx.rotate(swingAngle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(35, -15);
        ctx.stroke();

        // Pickaxe Tool
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(35, -30);
        ctx.lineTo(35, 0);
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.fillRect(33, -17, 4, 4); // pick head purple jewel

        ctx.restore();
        ctx.restore();

        ctx.restore();
      }

      // Draw active floating particle explosions
      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // weak gravity
        p.alpha -= 0.015;
        p.rotation = (p.rotation ?? 0) + (p.vrot ?? 0);

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'sparkle') {
          // Star polygon
          ctx.beginPath();
          for (let j = 0; j < 4; j++) {
            ctx.lineTo(0, -p.size);
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(0, -p.size / 3);
            ctx.rotate(Math.PI / 2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'coin') {
          // Yellow golden round coin with outer stroke
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw a small '$' outline
          ctx.fillStyle = '#b45309';
          ctx.font = `bold ${p.size * 1.2}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          // Default soft glowing circle
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

      pruneParticles();

      if (isActive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [reel.id, isActive]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
        style={{ contentVisibility: 'auto' }}
      />
    </div>
  );
}
