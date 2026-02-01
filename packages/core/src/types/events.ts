import type { Theme } from './theme';

/**
 * Theme event types
 */
export type ThemeEventType =
  | 'theme:changed'
  | 'theme:registered'
  | 'theme:unregistered'
  | 'theme:generated'
  | 'theme:generating'
  | 'theme:error'
  | 'storage:saved'
  | 'storage:loaded';

/**
 * Base event payload
 */
export interface BaseEventPayload {
  timestamp: number;
}

/**
 * Theme changed event payload
 */
export interface ThemeChangedPayload extends BaseEventPayload {
  theme: Theme;
  previousTheme: Theme | null;
}

/**
 * Theme registered event payload
 */
export interface ThemeRegisteredPayload extends BaseEventPayload {
  theme: Theme;
}

/**
 * Theme unregistered event payload
 */
export interface ThemeUnregisteredPayload extends BaseEventPayload {
  themeId: string;
}

/**
 * Theme generating event payload
 */
export interface ThemeGeneratingPayload extends BaseEventPayload {
  prompt: string;
}

/**
 * Theme generated event payload
 */
export interface ThemeGeneratedPayload extends BaseEventPayload {
  theme: Theme;
  prompt: string;
  duration: number;
}

/**
 * Theme error event payload
 */
export interface ThemeErrorPayload extends BaseEventPayload {
  error: Error;
  context?: string;
}

/**
 * Storage saved event payload
 */
export interface StorageSavedPayload extends BaseEventPayload {
  key: string;
}

/**
 * Storage loaded event payload
 */
export interface StorageLoadedPayload extends BaseEventPayload {
  key: string;
  value: unknown;
}

/**
 * Event payload map
 */
export interface ThemeEventPayloadMap {
  'theme:changed': ThemeChangedPayload;
  'theme:registered': ThemeRegisteredPayload;
  'theme:unregistered': ThemeUnregisteredPayload;
  'theme:generating': ThemeGeneratingPayload;
  'theme:generated': ThemeGeneratedPayload;
  'theme:error': ThemeErrorPayload;
  'storage:saved': StorageSavedPayload;
  'storage:loaded': StorageLoadedPayload;
}

/**
 * Event handler type
 */
export type ThemeEventHandler<T extends ThemeEventType> = (
  payload: ThemeEventPayloadMap[T]
) => void;

/**
 * Generic event handler
 */
export type AnyEventHandler = (payload: BaseEventPayload) => void;
