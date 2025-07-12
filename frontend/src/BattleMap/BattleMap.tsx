import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';

type Unit = {
  id: number;
  name: string;
  position: { x: number; y: number };
  direction: number;
  experience: number;
  armorLevel: number;
  weapon: string | null;
  isAlive: boolean;
};

type BattleMapProps = {
  units: Unit[];
  width?: number;
  height?: number;
};

export const BattleMap = (props: BattleMapProps) => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [ctx, setCtx] = createSignal<CanvasRenderingContext2D | null>(null);

  onMount(() => {
    if (canvasRef) {
      const context = canvasRef.getContext('2d');
      setCtx(context);
    }
  });

  const drawUnit = (unit: Unit) => {
    const context = ctx();
    if (!context) return;

    const x = unit.position?.x ?? 0;
    const y = unit.position?.y ?? 0;
    const radius = 8;

    // Draw unit circle
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    
    // Color based on alive status
    if (unit.isAlive) {
      context.fillStyle = '#4ade80'; // Green for alive
    } else {
      context.fillStyle = '#ef4444'; // Red for dead
    }
    context.fill();
    context.strokeStyle = '#1f2937';
    context.lineWidth = 2;
    context.stroke();

    // Draw direction line
    const lineLength = 12;
    const endX = x + Math.cos(unit.direction) * lineLength;
    const endY = y + Math.sin(unit.direction) * lineLength;
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(endX, endY);
    context.strokeStyle = '#1f2937';
    context.lineWidth = 2;
    context.stroke();

    // Draw experience indicator (outer ring)
    const experienceRadius = radius + 3;
    context.beginPath();
    context.arc(x, y, experienceRadius, 0, 2 * Math.PI);
    context.strokeStyle = '#fbbf24'; // Yellow for experience
    context.lineWidth = 2;
    context.globalAlpha = unit.experience;
    context.stroke();
    context.globalAlpha = 1;

    // Draw armor indicator (inner ring)
    if (unit.armorLevel > 0) {
      const armorRadius = radius - 2;
      context.beginPath();
      context.arc(x, y, armorRadius, 0, 2 * Math.PI);
      context.strokeStyle = '#3b82f6'; // Blue for armor
      context.lineWidth = unit.armorLevel;
      context.stroke();
    }

    // Draw weapon indicator (small dot)
    if (unit.weapon) {
      const weaponX = x + Math.cos(unit.direction + Math.PI/4) * (radius + 5);
      const weaponY = y + Math.sin(unit.direction + Math.PI/4) * (radius + 5);
      
      context.beginPath();
      context.arc(weaponX, weaponY, 3, 0, 2 * Math.PI);
      context.fillStyle = '#dc2626'; // Red for weapon
      context.fill();
    }
  };

  const clearCanvas = () => {
    const context = ctx();
    if (!context || !canvasRef) return;
    
    context.clearRect(0, 0, canvasRef.width, canvasRef.height);
  };

  const drawGrid = () => {
    const context = ctx();
    if (!context || !canvasRef) return;

    const gridSize = 20;
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvasRef.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvasRef.height);
      context.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvasRef.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvasRef.width, y);
      context.stroke();
    }
  };

  const render = () => {
    clearCanvas();
    drawGrid();
    props.units.forEach(drawUnit);
  };

  // Re-render when units change
  createEffect(() => {
    render();
  });

  return (
    <div class="battle-map">
      <canvas
        ref={canvasRef}
        width={props.width || 400}
        height={props.height || 400}
        style={{
          border: '2px solid #374151',
          'background-color': '#f9fafb'
        }}
      />
    </div>
  );
}; 