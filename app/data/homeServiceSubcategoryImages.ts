/**
 * Static hero/card images per home-service subcategory (by API option id = subcategoryKey).
 * Replace URLs here when you have final assets. Icons still come from the API (category tabs).
 */

const w = (px: number) => `auto=format&fit=crop&w=${px}&q=80`;

/** Rotated by subcategory key so siblings in the same category don’t all look identical. */
const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  cleaning: [
    `https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?${w(1200)}`,
    `https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?${w(1200)}`,
    `https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?${w(1200)}`,
  ],
  painting: [
    `https://images.unsplash.com/photo-1562259949-e8e7689d7828?${w(1200)}`,
    `https://images.unsplash.com/photo-1563298723-dcfebaa392e3?${w(1200)}`,
  ],
  "pest-control": [
    `https://images.unsplash.com/photo-1581578731548-c64695cc6952?${w(1200)}`,
    `https://images.unsplash.com/photo-1615876234889-fd9a39fda97f?${w(1200)}`,
  ],
  "floor-polishing": [
    `https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?${w(1200)}`,
    `https://images.unsplash.com/photo-1615529328331-f8917597711f?${w(1200)}`,
  ],
  "appliance-service": [
    `https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?${w(1200)}`,
    `https://images.unsplash.com/photo-1621905251918-48416bd8575a?${w(1200)}`,
    `https://images.unsplash.com/photo-1631646103285-3d1f95f8f6f0?${w(1200)}`,
  ],
  "home-repair-services": [
    `https://images.unsplash.com/photo-1504307651254-35680f356dfd?${w(1200)}`,
    `https://images.unsplash.com/photo-1504148455328-c376907d081c?${w(1200)}`,
  ],
  "packers-movers": [
    `https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?${w(1200)}`,
    `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?${w(1200)}`,
  ],
  "facility-management": [
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${w(1200)}`,
    `https://images.unsplash.com/photo-1497366216548-37526070297c?${w(1200)}`,
  ],
};

const GLOBAL_FALLBACK =
  `https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?${w(1200)}`;

function stableIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

/**
 * @param subcategoryKey API option id (e.g. bathroom-cleaning)
 * @param categoryKey API category key (e.g. cleaning)
 */
export function getSubcategoryImageUri(subcategoryKey: string, categoryKey: string): string {
  const pool = CATEGORY_IMAGE_POOLS[categoryKey];
  if (pool?.length) {
    return pool[stableIndex(subcategoryKey, pool.length)];
  }
  return GLOBAL_FALLBACK;
}

export function getGlobalServiceImageFallback(): string {
  return GLOBAL_FALLBACK;
}
