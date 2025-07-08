import EventEmitter from "node:events";

/**
 * Logger class responsible for recording and displaying battle events
 */
export class Logger extends EventEmitter {
  private events: string[] = [];
  private currentTime: number = 0;

  /**
   * Records a battle event with the current timestamp
   * @param message - The event message to log
   */
  log(message: string): void {
    const messageWithTimestamp = `[${this.currentTime.toFixed(1)}s] ${message}`;
    this.events.push(messageWithTimestamp);
    this.emit('log', messageWithTimestamp);
  }

  debug(message: string): void {
    this.log(`[DEBUG] ${message}`);
  }

  /**
   * Updates the current time of the logger
   * @param time - The new current time in seconds
   */
  setTime(time: number): void {
    this.currentTime = time;
  }

  /**
   * Returns all recorded events
   */
  getEvents(): string[] {
    return this.events;
  }

  /**
   * Clears all recorded events and resets time
   */
  clear(): void {
    this.events = [];
    this.currentTime = 0;
  }

} 