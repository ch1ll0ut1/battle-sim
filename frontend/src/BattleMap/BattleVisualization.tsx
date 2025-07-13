import { createSignal, onMount, onCleanup } from 'solid-js';
import { BattleMap } from './BattleMap.jsx';
import { BattleLog } from './BattleLog.jsx';
import { PlaybackControls } from './PlaybackControls.jsx';
import { WebSocketClient } from './WebSocketClient.js';
import './BattleMap.css';
import { Unit } from './Unit.jsx';

type BattleState = {
    time: number;
    phase: 'initialized' | 'paused' | 'running' | 'finished';
    gameMode: {
        units: Unit[];
    };
};

export const BattleVisualization = () => {
    const [battleState, setBattleState] = createSignal<BattleState>({
        time: 0,
        phase: 'initialized',
        gameMode: {
            units: [],
        },
    });
    const [battleLog, setBattleLog] = createSignal<string[]>([]);
    const [isConnected, setIsConnected] = createSignal(false);
    let battleWebSocket: WebSocketClient;

    const handleConnectionChange = (connected: boolean) => {
        console.log('Connection changed:', connected);
        setIsConnected(connected);
    };

    const handleBattleStateChange = (newBattleState: BattleState) => {
        console.log('Battle phase changed:', newBattleState);
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
        setBattleState(prev => ({ ...prev, phase: 'running' }));
        battleWebSocket.sendCommand('start');
    };

    const handlePause = () => {
        setBattleState(prev => ({ ...prev, phase: 'paused' }));
        battleWebSocket.sendCommand('stop');
    };

    const handleNextTick = () => {
        battleWebSocket.sendCommand('nextTick');
    };

    const handleReset = () => {
        setBattleState(prev => ({ ...prev, phase: 'initialized' }));
        battleWebSocket.sendCommand('reset');
    };

    onMount(() => {
        battleWebSocket = new WebSocketClient();
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
                        units={battleState().gameMode.units}
                        width={500}
                        height={500}
                    />
                </div>

                <div class="controls-section">
                    <PlaybackControls
                        isPlaying={battleState().phase === 'running'}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onNextTick={handleNextTick}
                        onReset={handleReset}
                    />

                    <div class="battle-info">
                        <p>Time: {battleState().time.toFixed(1)}s</p>
                        <p>Units: {battleState().gameMode.units.length}</p>
                        <p>Status: {battleState().phase}</p>
                    </div>
                </div>
            </div>

            <div class="log-section">
                <BattleLog entries={battleLog()} />
            </div>
        </div>
    );
}; 