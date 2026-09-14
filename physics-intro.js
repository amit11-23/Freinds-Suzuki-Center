/**
 * FRIENDS SUZUKI CENTER — WORKSHOP OPENING ANIMATION & 2D PHYSICS ENGINE
 * 
 * Features:
 * - 100% Self-Contained & Resilient Physics Engine (works online & offline!)
 * - Gravity simulation: Spanners, wrenches, bolts, nuts & spark plugs drop
 * - Full Mouse Drag & Throw Interaction: Grab any tool, toss it across screen with momentum
 * - Web Audio API: Realistic metallic impact sounds & hydraulic shutter sound
 * - Smooth garage roll-up transition into main website
 */

(function () {
  'use strict';

  // Sound Synthesizer via Web Audio API (Zero external MP3 audio file dependency)
  class WorkshopAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playClank(intensity = 0.4) {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500 + Math.random() * 800, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

        gain.gain.setValueAtTime(Math.min(intensity * 0.25, 0.35), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    playShutterOpen() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.5);
        osc.frequency.linearRampToValueAtTime(60, now + 0.8);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      } catch (e) {}
    }

    playEngineRev() {
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(95, now);
        osc1.frequency.exponentialRampToValueAtTime(320, now + 0.4);
        osc1.frequency.exponentialRampToValueAtTime(110, now + 1.2);

        osc2.frequency.setValueAtTime(190, now);
        osc2.frequency.exponentialRampToValueAtTime(640, now + 0.4);
        osc2.frequency.exponentialRampToValueAtTime(220, now + 1.2);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      } catch (e) {}
    }
  }

  const audio = new WorkshopAudio();
  window.workshopAudio = audio; // Expose for main website engine rev button

  // ========================================================================
  // ROBUST ZERO-DEPENDENCY 2D PHYSICS SIMULATOR WITH MOUSE DRAG & THROW
  // ========================================================================
  class PhysicsWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = (canvas.width = window.innerWidth);
      this.height = (canvas.height = window.innerHeight);
      this.tools = [];
      this.gravity = 0.48;
      this.draggedTool = null;
      this.dragOffset = { x: 0, y: 0 };
      this.mousePos = { x: 0, y: 0 };
      this.prevMousePos = { x: 0, y: 0 };
      this.mouseVelocity = { x: 0, y: 0 };
      this.isRunning = true;

      this.initTools();
      this.bindEvents();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    initTools() {
      const toolTemplates = [
        { type: 'spanner', w: 140, h: 26, color: '#CBD5E1', label: '14mm SPANNER' },
        { type: 'wrench', w: 150, h: 32, color: '#0066FF', label: 'SUZUKI WRENCH' },
        { type: 'bolt', r: 20, color: '#94A3B8', label: 'HEX BOLT' },
        { type: 'nut', r: 22, color: '#FFB703', label: 'BRASS NUT' },
        { type: 'sparkplug', w: 110, h: 24, color: '#E60012', label: 'SPARK PLUG' },
        { type: 'gear', r: 30, color: '#64748B', label: 'GEAR' }
      ];

      // Spawn 22-26 tools dropped from ceiling with staggered heights
      const count = Math.min(Math.floor(this.width / 55), 24);
      for (let i = 0; i < count; i++) {
        const tmpl = toolTemplates[i % toolTemplates.length];
        this.tools.push({
          ...tmpl,
          x: Math.random() * (this.width - 160) + 80,
          y: -(Math.random() * 600 + 40),
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 3 + 2,
          angle: (Math.random() - 0.5) * 2,
          vAngle: (Math.random() - 0.5) * 0.08,
          isDragging: false
        });
      }
    }

    bindEvents() {
      // Resize handling
      window.addEventListener('resize', () => {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
      });

      // Mouse & Touch Dragging
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const onPointerDown = (e) => {
        audio.init();
        const pos = getPos(e);
        this.mousePos = pos;
        this.prevMousePos = pos;

        // Check if user clicked on any tool (reverse loop for top-most)
        for (let i = this.tools.length - 1; i >= 0; i--) {
          const t = this.tools[i];
          const dist = Math.hypot(pos.x - t.x, pos.y - t.y);
          const hitRadius = t.r || Math.max(t.w, t.h) / 2;

          if (dist < hitRadius + 15) {
            this.draggedTool = t;
            t.isDragging = true;
            this.dragOffset = { x: t.x - pos.x, y: t.y - pos.y };
            t.vx = 0;
            t.vy = 0;
            audio.playClank(0.3);
            break;
          }
        }
      };

      const onPointerMove = (e) => {
        const pos = getPos(e);
        this.mouseVelocity = {
          x: pos.x - this.prevMousePos.x,
          y: pos.y - this.prevMousePos.y
        };
        this.prevMousePos = this.mousePos;
        this.mousePos = pos;

        if (this.draggedTool) {
          this.draggedTool.x = pos.x + this.dragOffset.x;
          this.draggedTool.y = pos.y + this.dragOffset.y;
        }
      };

      const onPointerUp = () => {
        if (this.draggedTool) {
          // Release and throw with momentum!
          this.draggedTool.vx = Math.max(-25, Math.min(25, this.mouseVelocity.x * 1.3));
          this.draggedTool.vy = Math.max(-25, Math.min(25, this.mouseVelocity.y * 1.3));
          this.draggedTool.vAngle = (Math.random() - 0.5) * 0.18;
          this.draggedTool.isDragging = false;
          this.draggedTool = null;
        }
      };

      window.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      window.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    }

    loop() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.tools.length; i++) {
        const t = this.tools[i];

        if (!t.isDragging) {
          // Gravity
          t.vy += this.gravity;
          t.x += t.vx;
          t.y += t.vy;
          t.angle += t.vAngle;

          // Air resistance
          t.vx *= 0.992;
          t.vy *= 0.992;
          t.vAngle *= 0.99;

          // Floor collision
          const radius = t.r || t.h / 2;
          if (t.y + radius > this.height - 10) {
            t.y = this.height - 10 - radius;
            if (Math.abs(t.vy) > 3) {
              audio.playClank(Math.abs(t.vy) / 15);
            }
            t.vy = -t.vy * 0.45; // Bounce
            t.vx *= 0.75;
            t.vAngle *= 0.7;
          }

          // Wall collisions
          if (t.x - radius < 10) {
            t.x = 10 + radius;
            t.vx = -t.vx * 0.55;
          } else if (t.x + radius > this.width - 10) {
            t.x = this.width - 10 - radius;
            t.vx = -t.vx * 0.55;
          }
        }

        // Render Tool
        this.renderTool(t);
      }

      requestAnimationFrame(this.loop);
    }

    renderTool(t) {
      this.ctx.save();
      this.ctx.translate(t.x, t.y);
      this.ctx.rotate(t.angle);

      // Shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetY = 6;

      if (t.type === 'spanner') {
        // Metallic Spanner Body
        this.ctx.fillStyle = '#CBD5E1';
        this.ctx.fillRect(-t.w / 2 + 18, -t.h / 2, t.w - 36, t.h);

        // Chrome Ring Heads
        this.ctx.beginPath();
        this.ctx.arc(-t.w / 2 + 18, 0, t.h * 0.75, 0, Math.PI * 2);
        this.ctx.arc(t.w / 2 - 18, 0, t.h * 0.75, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner Cutouts
        this.ctx.fillStyle = '#080C13';
        this.ctx.beginPath();
        this.ctx.arc(-t.w / 2 + 18, 0, t.h * 0.35, 0, Math.PI * 2);
        this.ctx.arc(t.w / 2 - 18, 0, t.h * 0.35, 0, Math.PI * 2);
        this.ctx.fill();

        // Stamp Label
        this.ctx.fillStyle = '#475569';
        this.ctx.font = 'bold 9px Chakra Petch, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(t.label, 0, 0);

      } else if (t.type === 'wrench') {
        // Blue Suzuki Handle
        this.ctx.fillStyle = '#0066FF';
        this.ctx.fillRect(-t.w / 2 + 20, -t.h / 2 + 2, t.w - 38, t.h - 4);

        // Chrome Jaw Head
        this.ctx.fillStyle = '#E2E8F0';
        this.ctx.fillRect(-t.w / 2 - 6, -t.h / 2 - 2, 28, t.h + 4);

        // Suzuki Branding
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 10px Chakra Petch, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SUZUKI SERVICE', 5, 0);

      } else if (t.type === 'bolt' || t.type === 'nut') {
        // Hexagonal Bolt / Nut
        this.ctx.fillStyle = t.color;
        this.ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const a = (s * Math.PI) / 3;
          const px = Math.cos(a) * t.r;
          const py = Math.sin(a) * t.r;
          if (s === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.stroke();

        // Center Thread Hole
        this.ctx.fillStyle = '#080C13';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, t.r * 0.42, 0, Math.PI * 2);
        this.ctx.fill();

      } else if (t.type === 'sparkplug') {
        // Spark Plug Thread (Metal)
        this.ctx.fillStyle = '#94A3B8';
        this.ctx.fillRect(-t.w / 2, -t.h / 2 + 2, 28, t.h - 4);

        // White Ceramic Body
        this.ctx.fillStyle = '#F8FAFC';
        this.ctx.fillRect(-t.w / 2 + 28, -t.h / 2, 45, t.h);

        // Red Insulator Top
        this.ctx.fillStyle = '#E60012';
        this.ctx.fillRect(-t.w / 2 + 73, -t.h / 2 + 2, 24, t.h - 4);

        // Electrode
        this.ctx.fillStyle = '#CBD5E1';
        this.ctx.fillRect(-t.w / 2 - 6, -2, 6, 4);

      } else if (t.type === 'gear') {
        // Timing Gear with teeth
        this.ctx.fillStyle = t.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, t.r, 0, Math.PI * 2);
        this.ctx.fill();

        // 8 Teeth around edge
        for (let g = 0; g < 8; g++) {
          const ga = (g * Math.PI) / 4;
          this.ctx.fillRect(Math.cos(ga) * t.r - 4, Math.sin(ga) * t.r - 4, 8, 8);
        }

        // Center Axle Hole
        this.ctx.fillStyle = '#080C13';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, t.r * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    destroy() {
      this.isRunning = false;
    }
  }

  // ========================================================================
  // CONTROLS & "ENTER WORKSHOP" BUTTON HANDLER
  // ========================================================================
  function setupWorkshopTransition(physicsEngine) {
    const btnEnter = document.getElementById('btn-enter-workshop');
    const introScreen = document.getElementById('intro-screen');
    const btnSound = document.getElementById('btn-sound-toggle');

    // Unlock Web Audio on first user interaction
    const unlock = () => {
      audio.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);

    // Sound toggle button
    if (btnSound) {
      btnSound.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.muted = !audio.muted;
        btnSound.innerHTML = audio.muted
          ? '<i class="fa-solid fa-volume-xmark"></i>'
          : '<i class="fa-solid fa-volume-high"></i>';
      });
    }

    // ENTER WORKSHOP CLICK
    if (btnEnter) {
      btnEnter.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.init();
        audio.playShutterOpen();

        // Roll up garage door screen smoothly!
        if (introScreen) {
          introScreen.classList.add('dismissed');
        }
        document.body.classList.remove('intro-active');

        // Stop physics after transition completes to save battery & CPU
        setTimeout(() => {
          if (physicsEngine && typeof physicsEngine.destroy === 'function') {
            physicsEngine.destroy();
          }

          // Trigger resize for 3D Studio canvas
          window.dispatchEvent(new Event('resize'));
        }, 850);
      });
    }
  }

  // Initialize
  function init() {
    const canvas = document.getElementById('physics-canvas');
    if (!canvas) return;

    const physics = new PhysicsWorld(canvas);
    setupWorkshopTransition(physics);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
