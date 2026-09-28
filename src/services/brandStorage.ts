// Brand asset storage service for 100% original user uploaded logos (PNG/SVG)
// With QuotaExceeded fallback protection and memory caching

const STORAGE_KEY_ICON = 'mydocanizer_custom_icon_original';
const STORAGE_KEY_BANNER_DESKTOP = 'mydocanizer_custom_banner_desktop_original';
const STORAGE_KEY_BANNER_ANDROID = 'mydocanizer_custom_banner_android_original';

// In-Memory fallback cache in case localStorage quota is exceeded
const memoryFallback = {
  icon: null as string | null,
  bannerDesktop: null as string | null,
  bannerAndroid: null as string | null
};

export const BrandStorage = {
  getIcon(): string | null {
    if (memoryFallback.icon) return memoryFallback.icon;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ICON);
      if (stored) {
        memoryFallback.icon = stored;
        return stored;
      }
    } catch {
      // LocalStorage access restricted or unavailable
    }
    return null;
  },

  setIcon(dataUrl: string): { success: boolean; persisted: boolean } {
    memoryFallback.icon = dataUrl;
    let persisted = false;
    try {
      localStorage.setItem(STORAGE_KEY_ICON, dataUrl);
      persisted = true;
    } catch (e) {
      console.warn('LocalStorage quota reached for brand icon; using active session RAM cache', e);
    }
    window.dispatchEvent(new Event('mydocanizer_brand_updated'));
    return { success: true, persisted };
  },

  getBanner(variant: 'desktop' | 'android' = 'desktop'): string | null {
    if (variant === 'android') {
      if (memoryFallback.bannerAndroid) return memoryFallback.bannerAndroid;
    } else {
      if (memoryFallback.bannerDesktop) return memoryFallback.bannerDesktop;
    }

    try {
      if (variant === 'android') {
        const stored = localStorage.getItem(STORAGE_KEY_BANNER_ANDROID);
        if (stored) {
          memoryFallback.bannerAndroid = stored;
          return stored;
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEY_BANNER_DESKTOP);
        if (stored) {
          memoryFallback.bannerDesktop = stored;
          return stored;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  },

  setBanner(dataUrl: string, variant: 'desktop' | 'android' = 'desktop'): { success: boolean; persisted: boolean } {
    let persisted = false;
    if (variant === 'android') {
      memoryFallback.bannerAndroid = dataUrl;
      try {
        localStorage.setItem(STORAGE_KEY_BANNER_ANDROID, dataUrl);
        persisted = true;
      } catch (e) {
        console.warn('LocalStorage quota reached for android banner; using active session RAM cache', e);
      }
    } else {
      memoryFallback.bannerDesktop = dataUrl;
      try {
        localStorage.setItem(STORAGE_KEY_BANNER_DESKTOP, dataUrl);
        persisted = true;
      } catch (e) {
        console.warn('LocalStorage quota reached for desktop banner; using active session RAM cache', e);
      }
    }
    window.dispatchEvent(new Event('mydocanizer_brand_updated'));
    return { success: true, persisted };
  },

  resetAll(): void {
    memoryFallback.icon = null;
    memoryFallback.bannerDesktop = null;
    memoryFallback.bannerAndroid = null;

    try {
      localStorage.removeItem(STORAGE_KEY_ICON);
      localStorage.removeItem(STORAGE_KEY_BANNER_DESKTOP);
      localStorage.removeItem(STORAGE_KEY_BANNER_ANDROID);
    } catch (e) {
      console.error('Failed to reset brand storage', e);
    }
    window.dispatchEvent(new Event('mydocanizer_brand_updated'));
  },

  hasCustomAssets(): boolean {
    return !!(this.getIcon() || this.getBanner('desktop') || this.getBanner('android'));
  }
};
