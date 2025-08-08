import EventEmitter from 'eventemitter3';
import { serverConfig } from '../config/server';

/**
 * Logger class responsible for recording and displaying battle events
 */
export class Logger extends EventEmitter {
    private currentTime = 0;

    /**
     * Records a battle event with the current timestamp
     * @param message - The event message to log
     */
    log(message: string) {
        const formattedMsg = `[${this.currentTime.toFixed(1)}s] ${message}`;
        console.log(formattedMsg);
        this.emit('log', formattedMsg);
    }

    error(message: string) {
        const formattedMsg = `[${this.currentTime.toFixed(1)}s] ERROR: ${message}`;
        console.error(formattedMsg);
        this.emit('log', formattedMsg);
    }

    debug(message: string, ...args: unknown[]) {
        if (serverConfig.debug) {
            const formattedMsg = `[${this.currentTime.toFixed(1)}s] DEBUG: ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`;
            console.log(formattedMsg);
            this.emit('log', formattedMsg);
        }
    }

    /**
     * Updates the current time of the logger
     * @param time - The new current time in seconds
     */
    setTime(time: number) {
        this.currentTime = time;
    }

    /**
     * Clears all recorded events and resets time
     */
    clear() {
        this.currentTime = 0;
    }
}
