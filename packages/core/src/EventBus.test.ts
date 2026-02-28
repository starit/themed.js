import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from './EventBus';
import { lightTheme, darkTheme } from './themes';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on and emit', () => {
    it('calls handler when event is emitted', () => {
      const handler = vi.fn();
      bus.on('theme:changed', handler);

      bus.emit('theme:changed', { theme: darkTheme, previousTheme: null });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toHaveProperty('theme');
      expect(handler.mock.calls[0][0]).toHaveProperty('timestamp');
    });

    it('calls multiple handlers for same event', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      bus.on('theme:changed', h1);
      bus.on('theme:changed', h2);

      bus.emit('theme:changed', { theme: lightTheme, previousTheme: null });

      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('removes handler so it is not called', () => {
      const handler = vi.fn();
      bus.on('theme:changed', handler);
      bus.off('theme:changed', handler);

      bus.emit('theme:changed', { theme: lightTheme, previousTheme: null });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('calls handler only once', () => {
      const handler = vi.fn();
      bus.once('theme:changed', handler);

      bus.emit('theme:changed', { theme: lightTheme, previousTheme: null });
      bus.emit('theme:changed', { theme: darkTheme, previousTheme: lightTheme });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('on return value', () => {
    it('returned unsubscribe removes handler', () => {
      const handler = vi.fn();
      const unsub = bus.on('theme:changed', handler);
      unsub();

      bus.emit('theme:changed', { theme: lightTheme, previousTheme: null });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('returns 0 when no listeners', () => {
      expect(bus.listenerCount('theme:changed')).toBe(0);
    });

    it('returns count of listeners', () => {
      bus.on('theme:changed', () => {});
      bus.on('theme:changed', () => {});
      expect(bus.listenerCount('theme:changed')).toBe(2);
    });
  });

  describe('clear', () => {
    it('removes all listeners for event when event given', () => {
      bus.on('theme:changed', () => {});
      bus.on('theme:registered', () => {});
      bus.clear('theme:changed');
      expect(bus.listenerCount('theme:changed')).toBe(0);
      expect(bus.listenerCount('theme:registered')).toBe(1);
    });

    it('removes all listeners when no event given', () => {
      bus.on('theme:changed', () => {});
      bus.on('theme:registered', () => {});
      bus.clear();
      expect(bus.listenerCount('theme:changed')).toBe(0);
      expect(bus.listenerCount('theme:registered')).toBe(0);
    });
  });
});
