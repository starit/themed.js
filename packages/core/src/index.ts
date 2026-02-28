// @themed.js/core - Main entry point

// Types
export * from './types/tokens';
export * from './types/theme';
export * from './types/events';
export * from './types/options';

// Core modules
export { ThemeManager } from './ThemeManager';
export { CSSInjector } from './CSSInjector';
export { EventBus } from './EventBus';
export { TokenResolver } from './TokenResolver';

// AI
export { AIOrchestrator } from './ai/AIOrchestrator';
export { PromptEngine } from './ai/PromptEngine';
export type { AIProvider, AIProviderConfig } from './ai/providers/base';
export { OpenAIProvider } from './ai/providers/openai';
export { ClaudeProvider } from './ai/providers/claude';
export { GeminiProvider } from './ai/providers/gemini';
export { GroqProvider } from './ai/providers/groq';
export { MoonshotProvider } from './ai/providers/moonshot';
export { DeepSeekProvider } from './ai/providers/deepseek';
export { CustomProvider } from './ai/providers/custom';

// Storage
export { StorageManager } from './storage/StorageManager';
export { LocalStorageAdapter } from './storage/LocalStorageAdapter';
export { IndexedDBAdapter } from './storage/IndexedDBAdapter';

// Utils
export * from './utils/color';
export * from './utils/contrast';

// Built-in themes
export { builtinThemes, lightTheme, darkTheme } from './themes';

// Factory function for easy initialization
export { createThemed } from './createThemed';
