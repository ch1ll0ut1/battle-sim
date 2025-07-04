/**
 * Represents a battle event with timestamp and message
 */
export interface BattleEvent {
  timestamp: number;
  message: string;
}

/**
 * Logger class responsible for recording and displaying battle events
 */
export class Logger {
  private events: BattleEvent[] = [];
  private currentTime: number = 0;

  /**
   * Records a battle event with the current timestamp
   * @param message - The event message to log
   */
  log(message: string): void {
    const event: BattleEvent = {
      timestamp: this.currentTime,
      message: `[${this.currentTime.toFixed(1)}s] ${message}`
    };
    this.events.push(event);
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
  getEvents(): BattleEvent[] {
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