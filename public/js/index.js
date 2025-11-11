import { DomUtils, AsyncUtils } from './utils/helpers.js';

class NavigationManager {
  constructor() {
    this.mobileMenuButton = DomUtils.$('#mobile-menu-button');
    this.mobileMenu = DomUtils.$('#mobile-menu');
    this.menuClosedIcon = DomUtils.$('#menu-closed-icon');
    this.menuOpenIcon = DomUtils.$('#menu-open-icon');
    this.isOpen = false;
    this.bodyInitialOverflow = document.body.style.overflow;

    this.handleDocumentInteraction = this.handleDocumentInteraction.bind(this);
    this.handleResize = AsyncUtils.debounce(this.handleResize.bind(this), 200);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.bindEvents();
  }

  bindEvents() {
    if (this.mobileMenuButton) {
      this.mobileMenuButton.addEventListener('click', () => this.toggle());
      this.mobileMenuButton.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', this.handleDocumentInteraction, { passive: false });
    document.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('resize', this.handleResize);
  }

  handleDocumentInteraction(event) {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest('a[href^="#"]');

    if (link) {
      const hash = link.getAttribute('href');
      const isHashNavigation = hash && hash.length > 1;

      if (isHashNavigation) {
        const target = document.querySelector(hash);
        if (target) {
          event.preventDefault();
          const headerHeight = DomUtils.$('nav')?.offsetHeight ?? 72;
          DomUtils.scrollToElement(target, headerHeight + 12);
        }
      }

      this.close();
      return;
    }

    if (this.isOpen && this.mobileMenu && this.mobileMenuButton && target) {
      const clickedOutsideMenu = !this.mobileMenu.contains(target);
      const clickedButton = this.mobileMenuButton.contains(target);

      if (clickedOutsideMenu && !clickedButton) {
        this.close();
      }
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  handleResize() {
    if (window.innerWidth >= 768 && this.isOpen) {
      this.close(false);
    }
  }

  toggle() {
    if (!this.mobileMenu) return;

    this.isOpen = !this.isOpen;
    this.updateMenuState();
  }

  close(restoreFocus = true) {
    if (!this.isOpen || !this.mobileMenu) return;

    this.isOpen = false;
    this.updateMenuState();

    if (restoreFocus && this.mobileMenuButton) {
      this.mobileMenuButton.focus();
    }
  }

  updateMenuState() {
    if (!this.mobileMenu) return;

    if (this.isOpen) {
      DomUtils.addClass(this.mobileMenu, 'open');
      DomUtils.hide(this.menuClosedIcon);
      DomUtils.show(this.menuOpenIcon);
      document.body.style.overflow = 'hidden';
    } else {
      DomUtils.removeClass(this.mobileMenu, 'open');
      DomUtils.show(this.menuClosedIcon);
      DomUtils.hide(this.menuOpenIcon);
      document.body.style.overflow = this.bodyInitialOverflow;
    }

    if (this.mobileMenuButton) {
      this.mobileMenuButton.setAttribute('aria-expanded', this.isOpen.toString());
    }
  }
}

class SectionObserver {
  constructor() {
    this.sections = DomUtils.$$('.section-reveal');
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!this.sections.length) return;

    if (this.prefersReducedMotion.matches || typeof IntersectionObserver === 'undefined') {
      this.sections.forEach((section) => section.classList.add('in-view'));
      return;
    }

    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      threshold: 0.25,
      rootMargin: '0px 0px -10% 0px',
    });

    this.sections.forEach((section) => this.observer.observe(section));
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (this.observer) {
          this.observer.unobserve(entry.target);
        }
      }
    });
  }
}

class PrefetchManager {
  constructor() {
    this.prefetched = new Set();
    this.links = DomUtils.$$('[data-prefetch]');

    if (!this.links.length) return;

    this.supportsPrefetch = this.checkPrefetchSupport();
    this.bindEvents();
  }

  checkPrefetchSupport() {
    try {
      return typeof document.createElement('link').relList?.supports === 'function'
        ? document.createElement('link').relList.supports('prefetch')
        : true;
    } catch (error) {
      console.debug('Prefetch no soportado, se continuará sin errores.', error);
      return false;
    }
  }

  bindEvents() {
    this.links.forEach((link) => {
      const url = link.dataset.prefetch || link.getAttribute('href');

      if (!url) return;

      const prefetchHandler = () => this.prefetch(url);

      ['mouseenter', 'focus', 'touchstart'].forEach((eventName) => {
        link.addEventListener(eventName, prefetchHandler, { once: true, passive: true });
      });
    });
  }

  prefetch(url) {
    if (!url || this.prefetched.has(url) || !this.supportsPrefetch) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.endsWith('.js') ? 'script' : 'document';
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    this.prefetched.add(url);
  }
}

class PerformanceMonitor {
  static logNavigationTiming() {
    if (typeof window === 'undefined' || !performance?.getEntriesByType) return;

    window.addEventListener('load', () => {
      const [navigation] = performance.getEntriesByType('navigation');
      if (navigation) {
        console.debug(
          'Performance:',
          `${Math.round(navigation.loadEventEnd - navigation.startTime)}ms hasta load`
        );
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new NavigationManager();
    new SectionObserver();
    new PrefetchManager();
    PerformanceMonitor.logNavigationTiming();
    console.log('✓ BrainCore landing page optimizada');
  } catch (error) {
    console.error('Error al iniciar la landing page:', error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesa rechazada sin manejar:', event.reason);
});
