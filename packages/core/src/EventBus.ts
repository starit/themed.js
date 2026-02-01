import type {
  ThemeEventType,
  ThemeEventPayloadMap,
  ThemeEventHandler,
  AnyEventHandler,
} from './types/events';

/**
 * Type-safe event bus for theme events
 */
export class EventBus {
  private listeners: Map<ThemeEventType, Set<AnyEventHandler>> = new Map();
  private debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this.debug = options.debug ?? false;
  }

  /**
   * Subscribe to an event
   */
  on<T extends ThemeEventType>(event: T, handler: ThemeEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as AnyEventHandler);

    if (this.debug) {
      console.log(`[Themed] Event listener added: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<T extends ThemeEventType>(event: T, handler: ThemeEventHandler<T>): () => void {
    const onceHandler: ThemeEventHandler<T> = (payload) => {
      this.off(event, onceHandler);
      handler(payload);
    };
    return this.on(event, onceHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends ThemeEventType>(event: T, handler: ThemeEventHandler<T>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as AnyEventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.debug) {
      console.log(`[Themed] Event listener removed: ${event}`);
    }
  }

  /**
   * Emit an event
   */
  emit<T extends ThemeEventType>(event: T, payload: Omit<ThemeEventPayloadMap[T], 'timestamp'>): void {
    const handlers = this.listeners.get(event);
    const fullPayload = {
      ...payload,
      timestamp: Date.now(),
    } as ThemeEventPayloadMap[T];

    if (this.debug) {
      console.log(`[Themed] Event emitted: ${event}`, fullPayload);
    }

    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(fullPayload);
        } catch (error) {
          console.error(`[Themed] Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   */
  clear(event?: ThemeEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }

    if (this.debug) {
      console.log(`[Themed] Event listeners cleared${event ? `: ${event}` : ' (all)'}`);
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: ThemeEventType): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
