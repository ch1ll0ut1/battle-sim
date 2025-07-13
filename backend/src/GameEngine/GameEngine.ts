import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger.js';
import { GameMode, GameModeType } from '../GameMode/GameMode.js';
import { TickUpdate } from '../utils/TickUpdate.js';
import { MovementSandbox } from '../GameMode/MovementSandbox/MovementSandbox.js';

type State = 'initialized' | 'paused' | 'running' | 'finished';

type EventEmitterMessage = {
    'updated': [],
    'finished': [],
}


/**
 * GameEngine class responsible for simulating games and generating events
 * Simulation flow is handled by SimulationController (for controllable server) & runGame() (for CLI)
 */
export class GameEngine extends EventEmitter<EventEmitterMessage> implements TickUpdate {
    public readonly TURN_INTERVAL = 0.1; // 100ms per turn

    private _state: State = 'initialized';
    private logger: Logger;
    private currentTime: number = 0;
    private gameMode: GameMode;

    /**
     * Creates a new GameEngine instance
     * @param units - Array of units participating in the game
     * @param logger - Logger instance to record game events
     */
    constructor(
        logger: Logger, gameMode: keyof typeof GameModeType
    ) {
        super();

        this.gameMode = new GameModeType[gameMode](logger, this);
        this.logger = logger;

        this.reset();
    }

    get state() {
        return this._state;
    }

    set state(state: State) {
        this.logger.debug(`GameEngine: state changed from ${this._state} to ${state}`);

        if (state === this._state) {
            throw new Error(`GameEngine: state cannot be set to the same value`);
        }

        this._state = state;

        if (state === 'finished') {
            this.emit('finished');
        }
    }

    /**
     * Starts a new game simulation
     */
    reset() {
        this._state = 'initialized';
        this.currentTime = 0;
        this.logger.clear();
        this.logger.log('Game started');

        // TODO:
        // gameMode.reset()

        this.emit('updated');
    }

    /**
     * Updates the game state by one turn (used for server)
     * @param setToPause - If true, state will be set to "paused"
     */
    update(delayTime: number, setToPause: boolean = false) {
        if (this._state === 'finished') {
            throw new Error('Game is finished');
        }

        if (this._state !== 'running') {
            this._state = 'running';
        }

        if (setToPause) {
            this._state = 'paused';
        }

        this.currentTime += delayTime;
        this.logger.setTime(this.currentTime);

        // TODO: 
        // gameMode.update()

        this.emit('updated');
    }

    /**
     * Pauses the game (just sets the state to paused)
     */
    pause() {
        this._state = 'paused';
        this.emit('updated');
    }

    /**
     * Runs the complete game simulation (used for CLI)
     * @returns Game result including winner and duration
     */
    runGame() {
        // Run game until it ends
        while (this._state !== 'finished') {
            this.update(this.TURN_INTERVAL);
        }

        // const winner = this.determineWinner();
        // if (winner) {
        //     this.logger.log(`${winner} wins the game!`);
        // } else {
        //     this.logger.log('Game ends in a draw!');
        // }

        // return gamemode.gameResult

        return {
            // winner: winner,
            duration: this.currentTime,
            events: this.logger.getEvents()
        };
    }

    getState() {
        return { time: this.currentTime, state: this._state };
    }
} 