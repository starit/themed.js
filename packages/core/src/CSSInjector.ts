import type { ThemeTokens } from './types/tokens';
import type { CSSOptions } from './types/options';
import { TokenResolver } from './TokenResolver';

/**
 * CSS injector for applying theme tokens to the DOM
 */
export class CSSInjector {
  private styleElement: HTMLStyleElement | null = null;
  private tokenResolver: TokenResolver;
  private options: Required<CSSOptions>;
  private styleId = 'themed-js-styles';

  constructor(options: CSSOptions = {}) {
    this.options = {
      prefix: options.prefix ?? '--themed',
      target: options.target ?? null,
      useRoot: options.useRoot ?? true,
    };
    this.tokenResolver = new TokenResolver({ prefix: this.options.prefix });
  }

  /**
   * Inject theme tokens as CSS variables
   */
  inject(tokens: ThemeTokens): void {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      return;
    }

    const cssString = this.toCSSString(tokens);

    if (this.options.useRoot) {
      // Inject via style element for :root
      this.injectStyleElement(cssString);
    } else if (this.options.target) {
      // Apply directly to target element
      this.applyToElement(tokens, this.options.target);
    } else {
      // Default to document.documentElement
      this.applyToElement(tokens, document.documentElement);
    }
  }

  /**
   * Clear injected styles
   */
  clear(): void {
    if (typeof document === 'undefined') {
      return;
    }

    // Remove style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    // Clear inline styles from target
    if (this.options.target) {
      this.clearFromElement(this.options.target);
    }
  }

  /**
   * Generate CSS string from tokens
   */
  toCSSString(tokens: ThemeTokens): string {
    const selector = this.options.useRoot ? ':root' : this.getTargetSelector();
    return this.tokenResolver.toCSSString(tokens, selector);
  }

  /**
   * Get the token resolver instance
   */
  getResolver(): TokenResolver {
    return this.tokenResolver;
  }

  /**
   * Update the CSS prefix
   */
  setPrefix(prefix: string): void {
    this.options.prefix = prefix;
    this.tokenResolver = new TokenResolver({ prefix });
  }

  /**
   * Update the target element
   */
  setTarget(target: HTMLElement | null): void {
    this.clear();
    this.options.target = target;
  }

  /**
   * Inject CSS via style element
   */
  private injectStyleElement(cssString: string): void {
    // Find or create style element
    let styleEl = document.getElementById(this.styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = this.styleId;
      styleEl.setAttribute('data-themed', 'true');
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = cssString;
    this.styleElement = styleEl;
  }

  /**
   * Apply tokens directly to an element
   */
  private applyToElement(tokens: ThemeTokens, element: HTMLElement): void {
    const variables = this.tokenResolver.toCSSVariables(tokens);

    for (const [key, value] of Object.entries(variables)) {
      element.style.setProperty(key, value);
    }
  }

  /**
   * Clear CSS variables from an element
   */
  private clearFromElement(element: HTMLElement): void {
    const style = element.style;
    const propsToRemove: string[] = [];

    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.startsWith(this.options.prefix)) {
        propsToRemove.push(prop);
      }
    }

    for (const prop of propsToRemove) {
      element.style.removeProperty(prop);
    }
  }

  /**
   * Get CSS selector for target element
   */
  private getTargetSelector(): string {
    if (!this.options.target) {
      return ':root';
    }

    if (this.options.target.id) {
      return `#${this.options.target.id}`;
    }

    // Use data attribute as fallback
    const dataId = `themed-target-${Date.now()}`;
    this.options.target.setAttribute('data-themed-target', dataId);
    return `[data-themed-target="${dataId}"]`;
  }
}
