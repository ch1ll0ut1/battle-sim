import { createSignal, onMount, onCleanup } from 'solid-js';
import { BattleMap } from './battle-map.js';
import { BattleLog } from './battle-log.js';
import { PlaybackControls } from './playback-controls.js';
import { BattleWebSocket } from './BattleWebSocket.js';
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

type BattleState = {
    time: number;
    units: Unit[];
    state: 'initialized' | 'paused' | 'running' | 'finished';
};

export const BattleVisualization = () => {
    const [battleState, setBattleState] = createSignal<BattleState>({
        time: 0,
        units: [],
        state: 'initialized'
    });
    const [battleLog, setBattleLog] = createSignal<string[]>([]);
    const [isConnected, setIsConnected] = createSignal(false);
    let battleWebSocket: BattleWebSocket;

    const handleConnectionChange = (connected: boolean) => {
        console.log('Connection changed:', connected);
        setIsConnected(connected);
    };

    const handleBattleStateChange = (newBattleState: BattleState) => {
        console.log('Battle state changed:', newBattleState);
        setBattleState(newBattleState);
    };

    const handleBattleLogChange = (logData: string | string[]) => {
        console.log('Battle log changed:', logData);
        if (Array.isArray(logData)) {
            setBattleLog(logData);
        } else {
            setBattleLog(prev => [...prev, logData]);
        }
    };

    const handlePlay = () => {
        setBattleState(prev => ({ ...prev, state: 'running' }));
        battleWebSocket.sendCommand('start');
    };

    const handlePause = () => {
        setBattleState(prev => ({ ...prev, state: 'paused' }));
        battleWebSocket.sendCommand('stop');
    };

    const handleNextTick = () => {
        battleWebSocket.sendCommand('nextTick');
    };

    const handleReset = () => {
        setBattleState(prev => ({ ...prev, state: 'initialized' }));
        battleWebSocket.sendCommand('reset');
    };

    onMount(() => {
        battleWebSocket = new BattleWebSocket();
        battleWebSocket.setEventHandlers(
            handleConnectionChange,
            handleBattleStateChange,
            handleBattleLogChange
        );
        battleWebSocket.connect();
    });

    onCleanup(() => {
        if (battleWebSocket) {
            battleWebSocket.disconnect();
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
                        isPlaying={battleState().state === 'running'}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onNextTick={handleNextTick}
                        onReset={handleReset}
                    />

                    <div class="battle-info">
                        <p>Time: {battleState().time.toFixed(1)}s</p>
                        <p>Units: {battleState().units.length}</p>
                        <p>Status: {battleState().state}</p>
                    </div>
                </div>
            </div>

            <div class="log-section">
                <BattleLog entries={battleLog()} />
            </div>
        </div>
    );
}; 