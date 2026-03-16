"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchToRevealProps {
  onComplete: () => void;
  onMusicStart: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export default function ScratchToReveal({ onComplete, onMusicStart }: ScratchToRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  const progressCheckRef = useRef<number>(0);
  
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize canvas with optimized settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { 
      alpha: true,
      desynchronized: true,
      willReadFrequently: false 
    });
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limit DPI for performance
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Create optimized scratch surface
    const createScratchSurface = () => {
      // Use single gradient fill
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#d4af37");
      gradient.addColorStop(0.5, "#f4e4bc");
      gradient.addColorStop(1, "#d4af37");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Add subtle texture with reduced operations
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        const size = Math.random() * 1.5 + 0.5;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;

      // Add text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Montserrat";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Scratch to reveal", rect.width / 2, rect.height - 25);
    };

    createScratchSurface();
  }, []);

  // Optimized particle animation
  useEffect(() => {
    if (particles.length === 0) return;

    let rafId: number;
    const animate = () => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 0.025
          }))
          .filter(p => p.life > 0);
        
        if (updated.length === 0) {
          cancelAnimationFrame(rafId);
        }
        
        return updated;
      });
      
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafId);
  }, [particles.length]);

  // Throttled progress calculation
  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    // Sample progress instead of reading all pixels
    const sampleSize = 50;
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    return (transparent / (pixels.length / 4)) * 100;
  }, []);

  // Optimized particle creation
  const createParticles = useCallback((x: number, y: number) => {
    if (particles.length > 30) return; // Limit particle count
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) { // Reduced particle count
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 1
      });
    }
    
    setParticles(prev => [...prev.slice(-20), ...newParticles]); // Keep only recent particles
  }, [particles.length]);

  // Optimized scratch function
  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isDrawingRef.current) return;

    isDrawingRef.current = true;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 25 * dpr;
    
    if (lastPointRef.current) {
      // Draw line from last point to current point
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x * scaleX, lastPointRef.current.y * scaleY);
      ctx.lineTo(x * scaleX, y * scaleY);
      ctx.stroke();
    } else {
      // Draw single point
      ctx.beginPath();
      ctx.arc(x * scaleX, y * scaleY, 12 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };

    // Throttled particle creation
    if (Math.random() > 0.7) {
      createParticles(x, y);
    }

    // Throttled progress checking
    progressCheckRef.current++;
    if (progressCheckRef.current % 10 === 0) {
      const progress = calculateProgress();
      setScratchProgress(progress);

      if (progress > 60 && !isRevealed) {
        revealAll();
      }
    }

    setTimeout(() => {
      isDrawingRef.current = false;
    }, 8); // Throttle scratch operations
  }, [calculateProgress, createParticles, isRevealed]);

  const revealAll = useCallback(() => {
    setIsRevealed(true);
    onMusicStart();
    
    setTimeout(() => {
      onComplete();
    }, 1200);
  }, [onComplete, onComplete]);

  // Optimized event handlers
  const handleStart = useCallback((x: number, y: number) => {
    setIsScratching(true);
    lastPointRef.current = null;
    scratch(x, y);
  }, [scratch]);

  const handleMove = useCallback((x: number, y: number) => {
    if (isScratching && !isDrawingRef.current) {
      scratch(x, y);
    }
  }, [isScratching, scratch]);

  const handleEnd = useCallback(() => {
    setIsScratching(false);
    lastPointRef.current = null;
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleStart(e.clientX - rect.left, e.clientY - rect.top);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX - rect.left, e.clientY - rect.top);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events with passive listeners
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  return (
    <motion.div
      className="scratch-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="scratch-container">
        {/* Hidden content underneath */}
        <div className="scratch-content">
          <div className="scratch-circle">
            <div className="scratch-circle-inner">
              <div className="scratch-subtitle">8–11 March 2026 · Ghaziabad</div>
              <div className="scratch-names">Aadarsh &amp; Pragya</div>
              <div className="scratch-text">invite you to join them in romance…</div>
            </div>
          </div>
        </div>

        {/* Scratch canvas overlay */}
        <motion.div
          className="scratch-canvas-wrapper"
          animate={{
            scale: isRevealed ? 1.1 : 1,
            opacity: isRevealed ? 0 : 1,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: isScratching ? "grabbing" : "grab",
              touchAction: "none"
            }}
          />
        </motion.div>

        {/* Optimized particles */}
        <div className="particles-container">
          {particles.slice(0, 15).map((particle, index) => (
            <motion.div
              key={`${index}-${particle.life}`}
              className="particle"
              style={{
                left: particle.x,
                top: particle.y,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: particle.life }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          className="scratch-progress"
          initial={{ width: 0 }}
          animate={{ width: `${scratchProgress}%` }}
          transition={{ duration: 0.2 }}
        />

        {/* Skip button */}
        <button
          type="button"
          className="scratch-skip-button"
          onClick={revealAll}
        >
          Reveal all
        </button>
      </div>
    </motion.div>
  );
}
