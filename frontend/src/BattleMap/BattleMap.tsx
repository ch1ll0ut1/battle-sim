import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { Unit } from './Unit';
import { generateTerrain, drawTerrain, type TerrainData } from './Terrain';

type BattleMapProps = {
  units: Unit[];
  width?: number;
  height?: number;
};

export const BattleMap = (props: BattleMapProps) => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [ctx, setCtx] = createSignal<CanvasRenderingContext2D | null>(null);
  const [terrain, setTerrain] = createSignal<TerrainData | null>(null);

  onMount(() => {
    if (canvasRef) {
      const context = canvasRef.getContext('2d');
      setCtx(context);
      
      // Generate terrain once on mount
      const width = props.width || 400;
      const height = props.height || 400;
      setTerrain(generateTerrain(width, height));
    }
  });

  const drawUnit = (unit: Unit) => {
    const context = ctx();
    if (!context) return;

    const x = unit.movement.position?.x ?? 0;
    const y = unit.movement.position?.y ?? 0;
    console.log('draw', x, y)
    
    // Scale: 1 pixel = 1cm, so a person is roughly 170cm tall
    // Unit radius should be about 15-20cm (15-20 pixels)
    const radius = 18;

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

    // Draw direction line (shorter for smaller units)
    const lineLength = 25; // 25cm direction indicator
    const endX = x + Math.cos(unit.movement.direction) * lineLength;
    const endY = y + Math.sin(unit.movement.direction) * lineLength;
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(endX, endY);
    context.strokeStyle = '#1f2937';
    context.lineWidth = 2;
    context.stroke();

    // Draw experience indicator (outer ring)
    const experienceRadius = radius + 4; // 4cm outer ring
    context.beginPath();
    context.arc(x, y, experienceRadius, 0, 2 * Math.PI);
    context.strokeStyle = '#fbbf24'; // Yellow for experience
    context.lineWidth = 2;
    context.globalAlpha = unit.experience;
    context.stroke();
    context.globalAlpha = 1;

    // Draw armor indicator (inner ring)
    if (unit.armorLevel > 0) {
      const armorRadius = radius - 3; // 3cm inner ring
      context.beginPath();
      context.arc(x, y, armorRadius, 0, 2 * Math.PI);
      context.strokeStyle = '#3b82f6'; // Blue for armor
      context.lineWidth = unit.armorLevel;
      context.stroke();
    }

    // Draw weapon indicator (small dot)
    if (unit.weapon) {
      const weaponX = x + Math.cos(unit.movement.direction + Math.PI/4) * (radius + 8);
      const weaponY = y + Math.sin(unit.movement.direction + Math.PI/4) * (radius + 8);
      
      context.beginPath();
      context.arc(weaponX, weaponY, 4, 0, 2 * Math.PI); // 4cm weapon indicator
      context.fillStyle = '#dc2626'; // Red for weapon
      context.fill();
    }
  };

  const clearCanvas = () => {
    const context = ctx();
    if (!context || !canvasRef) return;
    
    context.clearRect(0, 0, canvasRef.width, canvasRef.height);
  };

  const render = () => {
    const context = ctx();
    const terrainData = terrain();
    if (!context || !canvasRef || !terrainData) return;
    
    clearCanvas();
    
    // Draw terrain (grass and trees)
    drawTerrain(context, terrainData, canvasRef.width, canvasRef.height);
    
    // Draw units on top
    console.log('render', props.units)
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
          'background-color': '#8B7355' // Fallback grass color
        }}
      />
    </div>
  );
}; 