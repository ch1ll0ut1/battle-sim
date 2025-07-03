/**
 * Event bus for handling application-wide events
 */
export class EventBus {
  private listeners = new Map<string, Function[]>();

  /**
   * Subscribe to an event
   * @param event Event name to subscribe to
   * @param callback Function to call when event occurs
   */
  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit an event with optional data
   * @param event Event name to emit
   * @param data Optional data to pass to listeners
   */
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Unsubscribe from an event
   * @param event Event name to unsubscribe from
   * @param callback Function to remove from listeners
   */
  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Clear all listeners for an event
   * @param event Event name to clear
   */
  clear(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Clear all listeners for all events
   */
  clearAll(): void {
    this.listeners.clear();
  }
} 