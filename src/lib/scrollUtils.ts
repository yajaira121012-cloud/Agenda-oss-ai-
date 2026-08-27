/**
 * Scroll Reset Utilities for Agenda OSS
 *
 * Ensures seamless, instant, and reliable scroll-to-top navigation across all devices
 * (iPhone Safari, iPad WebKit, Android Chrome, PC/Mac desktop browsers).
 */

export interface ScrollResetOptions {
  smooth?: boolean;
  targetId?: string;
}

/**
 * Resets the scroll position of the entire application and all relevant containers to top: 0.
 * Handles both the main App layout scroll container and window/document scrolling.
 */
export function resetAppScroll(options?: ScrollResetOptions): void {
  const behavior = options?.smooth ? 'smooth' : 'instant';

  const doReset = () => {
    // 1. Reset standard Window & Document scroll (essential for mobile viewports & iPad)
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: behavior as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }
    }

    if (typeof document !== 'undefined') {
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // 2. Primary layout scroll container
      const mainContainer = document.getElementById('main-scroll-container');
      if (mainContainer) {
        try {
          mainContainer.scrollTo({ top: 0, left: 0, behavior: behavior as ScrollBehavior });
        } catch {
          mainContainer.scrollTop = 0;
        }
        mainContainer.scrollTop = 0;
      }

      // 3. Optional specific target container
      if (options?.targetId) {
        const target = document.getElementById(options.targetId);
        if (target) {
          try {
            target.scrollTo({ top: 0, left: 0, behavior: behavior as ScrollBehavior });
          } catch {
            target.scrollTop = 0;
          }
          target.scrollTop = 0;
        }
      }

      // 4. Any other container with scroll attributes or main tag
      const otherContainers = document.querySelectorAll<HTMLElement>(
        '[data-scroll-container="true"], main > div.overflow-y-auto'
      );
      otherContainers.forEach((el) => {
        try {
          el.scrollTo({ top: 0, left: 0, behavior: behavior as ScrollBehavior });
        } catch {
          el.scrollTop = 0;
        }
        el.scrollTop = 0;
      });
    }
  };

  // Immediate synchronous reset
  doReset();

  // Next animation frame (handles DOM paint / element replacement)
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      doReset();
    });
  }

  // Micro-delay (handles React reconciliation and asynchronous layout calculations)
  setTimeout(() => {
    doReset();
  }, 20);
}
