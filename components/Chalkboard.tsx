import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ToolState } from '../types';

interface ChalkboardProps {
  toolState: ToolState;
  onStrokeEnd: () => void;
  isActive: boolean;
  initialData?: string;
}

export interface ChalkboardHandle {
  getSnapshot: () => string;
  clear: () => void;
}

const Chalkboard = forwardRef<ChalkboardHandle, ChalkboardProps>(({ toolState, onStrokeEnd, isActive, initialData }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);
  const lastTime = useRef<number>(0);
  
  // Accumulator for simulating texture bumps via vibration
  const distanceAccumulator = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }));

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        // Save content
        const data = canvas.toDataURL();
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Restore content
        const img = new Image();
        img.src = data;
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
        };
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Restore initial data if switching boards
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialData) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = initialData;
      img.onload = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
      };
    } else if (canvas && !initialData) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [initialData]);

  // Chalk Drawing Algorithm
  const drawChalk = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, pressure: number) => {
    const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    
    // Eraser logic
    if (toolState.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = 40 + (pressure * 20); // Thick eraser
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        return;
    }

    // Chalk logic
    ctx.fillStyle = toolState.color;
    
    const baseSize = toolState.size;
    const size = baseSize * (0.5 + pressure * 0.5); // Pressure affects size

    // Interpolate dots for chalk texture
    for (let i = 0; i < dist; i += 1) { // Step size
      const t = i / dist;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;

      // Random scatter
      const scatterX = (Math.random() - 0.5) * size;
      const scatterY = (Math.random() - 0.5) * size;
      
      // Random opacity for texture
      const opacity = Math.random() * (0.5 + pressure * 0.5); 
      
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      // Draw tiny circles instead of rects for smoother look
      ctx.arc(x + scatterX, y + scatterY, (Math.random() * 1.5) + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  };

  const triggerHapticFeedback = (distance: number) => {
    // Accumulate distance traveled
    distanceAccumulator.current += distance;

    // "Grain" threshold: every 8 pixels, trigger a tiny vibration
    // This simulates the chalk bumping over the board surface
    if (distanceAccumulator.current > 8) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // Very short pulse (5ms) to simulate a "tick" texture
            navigator.vibrate(5);
        }
        distanceAccumulator.current = 0;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    lastPos.current = { x, y };
    lastTime.current = Date.now();
    distanceAccumulator.current = 0;
    
    // Initial dot
    const ctx = canvas.getContext('2d');
    if(ctx) drawChalk(ctx, x, y, x, y, e.pressure || 0.5);

    // Initial impact vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPos.current || !canvasRef.current) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    const dt = now - lastTime.current;
    
    const dist = Math.sqrt((x - lastPos.current.x) ** 2 + (y - lastPos.current.y) ** 2);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      drawChalk(ctx, lastPos.current.x, lastPos.current.y, x, y, e.pressure || 0.5);
    }

    // Trigger haptics based on movement (texture simulation)
    triggerHapticFeedback(dist);

    lastPos.current = { x, y };
    lastTime.current = now;
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    onStrokeEnd();
  };

  return (
    <div ref={containerRef} className={`w-full h-full relative ${!isActive ? 'hidden' : ''}`}>
      <canvas
        ref={canvasRef}
        className="touch-none w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      />
    </div>
  );
});

export default Chalkboard;