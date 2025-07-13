import EventEmitter from "node:events";
import { serverConfig } from "../config/server";

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
  log(message: string) {
    const formattedMsg = `[${this.currentTime.toFixed(1)}s] ${message}`;
    this.events.push(formattedMsg);
    this.emit('log', formattedMsg);
  }

  error(message: string) {
    const formattedMsg = `[${this.currentTime.toFixed(1)}s] ERROR: ${message}`;
    this.events.push(formattedMsg);
    this.emit('log', formattedMsg);
  }

  debug(message: string) {
    if (serverConfig.debug) {
      const formattedMsg = `[${this.currentTime.toFixed(1)}s] DEBUG: ${message}`;
      this.events.push(formattedMsg);
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
   * Returns all recorded events
   */
  getEvents(): string[] {
    return this.events;
  }

  /**
   * Clears all recorded events and resets time
   */
  clear() {
    this.events = [];
    this.currentTime = 0;
  }

} 