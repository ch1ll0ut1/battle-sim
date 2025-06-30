import { createSignal, onMount, onCleanup } from 'solid-js';
import { BattleMap } from './battle-map.js';
import { BattleLog } from './battle-log.js';
import { PlaybackControls } from './playback-controls.js';
import './battle-map.css';

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

type BattleLogEntry = {
  time: number;
  message: string;
};

type BattleState = {
  time: number;
  units: Unit[];
  isActive: boolean;
};

export const BattleVisualization = () => {
  const [battleState, setBattleState] = createSignal<BattleState>({
    time: 0,
    units: [],
    isActive: false
  });
  const [battleLog, setBattleLog] = createSignal<BattleLogEntry[]>([]);
  const [isConnected, setIsConnected] = createSignal(false);
  const [isPlaying, setIsPlaying] = createSignal(false);

  let ws: WebSocket | null = null;

  const connectWebSocket = () => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to battle simulation server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'battleState':
          setBattleState(message.data);
          break;
        case 'battleLog':
          if (Array.isArray(message.data)) {
            // Initial log entries
            setBattleLog(message.data);
          } else {
            // Single new entry
            setBattleLog(prev => [...prev, message.data]);
          }
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from battle simulation server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const sendCommand = (command: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'command', command }));
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    sendCommand('start');
  };

  const handlePause = () => {
    setIsPlaying(false);
    sendCommand('stop');
  };

  const handleNextTick = () => {
    sendCommand('nextTick');
  };

  const handleReset = () => {
    setIsPlaying(false);
    sendCommand('reset');
  };

  onMount(() => {
    connectWebSocket();
  });

  onCleanup(() => {
    if (ws) {
      ws.close();
    }
  });

  return (
    <div class="battle-visualization">
      <h1>Battle Simulation Visualization</h1>
      
      <div class="connection-status">
        Status: {isConnected() ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div class="battle-layout">
        <div class="map-section">
          <BattleMap 
            units={battleState().units}
            width={500}
            height={500}
          />
        </div>
        
        <div class="controls-section">
          <PlaybackControls
            isPlaying={isPlaying()}
            onPlay={handlePlay}
            onPause={handlePause}
            onNextTick={handleNextTick}
            onReset={handleReset}
          />
          
          <div class="battle-info">
            <p>Time: {battleState().time.toFixed(1)}s</p>
            <p>Units: {battleState().units.length}</p>
            <p>Status: {battleState().isActive ? 'Active' : 'Ended'}</p>
          </div>
        </div>
      </div>

      <div class="log-section">
        <BattleLog entries={battleLog()} />
      </div>
    </div>
  );
}; 