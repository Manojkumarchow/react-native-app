/**
 * Home service card/detail images: optional HTTPS from API, else bundled assets, else Unsplash pools.
 * Keys must match backend subcategory_key (slugified labels from HomeServiceCatalogSeeder).
 */

import type { ImageSourcePropType } from "react-native";

const w = (px: number) => `auto=format&fit=crop&w=${px}&q=80`;

/** Bundled JPEGs under assets/images/home-services/ (filenames match disk; case-sensitive on some systems). */
const SUBCATEGORY_BUNDLED: Record<string, ImageSourcePropType> = {
  // cleaning
  "bathroom-cleaning": require("../../assets/images/home-services/bathroom.jpeg"),
  "sofa-cleaning": require("../../assets/images/home-services/sofa-cleaning.jpeg"),
  "kitchen-cleaning": require("../../assets/images/home-services/kitchen-cleaning.jpeg"),
  "vacant-home-deep-cleaning": require("../../assets/images/home-services/deep-clean.jpeg"),
  "occupied-home-deep-cleaning": require("../../assets/images/home-services/home-cleaning.jpeg"),
  "after-interior-deep-cleaning": require("../../assets/images/home-services/deep-clean.jpeg"),
  "office-cleaning": require("../../assets/images/home-services/office-cleaning.jpeg"),
  "mattress-cleaning": require("../../assets/images/home-services/rug-cleaning.jpeg"),
  "mini-cleaning-services": require("../../assets/images/home-services/home-cleaning.jpeg"),
  "floor-cleaning": require("../../assets/images/home-services/floor-cleaning.jpeg"),
  "terrace-cleaning": require("../../assets/images/home-services/floor-mop-cleaning.jpeg"),
  "tank-and-sump-cleaning": require("../../assets/images/home-services/tanker-cleaning.jpeg"),
  "bathroom-and-kitchen-cleaning": require("../../assets/images/home-services/kitchen-cleaning.jpeg"),
  "villa-cleaning": require("../../assets/images/home-services/home-cleaning.jpeg"),
  "sofa-and-mattress-cleaning": require("../../assets/images/home-services/sofa-cleaning.jpeg"),
  "fridge-cleaning-service": require("../../assets/images/home-services/fridge.jpeg"),
  "carpet-cleaning": require("../../assets/images/home-services/rug-cleaning.jpeg"),
  // painting (shared art)
  "interior-texture": require("../../assets/images/home-services/polish.jpeg"),
  "wood-polish": require("../../assets/images/home-services/polish.jpeg"),
  waterproofing: require("../../assets/images/home-services/polish.jpeg"),
  wallpaper: require("../../assets/images/home-services/polish.jpeg"),
  "grouting-services": require("../../assets/images/home-services/floor-mop-cleaning.jpeg"),
  "rental-painting": require("../../assets/images/home-services/polish.jpeg"),
  "exterior-painting": require("../../assets/images/home-services/polish.jpeg"),
  "exterior-texture": require("../../assets/images/home-services/polish.jpeg"),
  "vacant-flat-painting": require("../../assets/images/home-services/polish.jpeg"),
  "interior-painting": require("../../assets/images/home-services/polish.jpeg"),
  "1-day-painting": require("../../assets/images/home-services/polish.jpeg"),
  // pest control
  "cockroach-control": require("../../assets/images/home-services/cockroach.jpeg"),
  "termite-control": require("../../assets/images/home-services/bug-control.jpeg"),
  "commercial-pest-control": require("../../assets/images/home-services/pest-control.jpeg"),
  "bedbugs-control": require("../../assets/images/home-services/bug-control.jpeg"),
  "mosquitoes-control": require("../../assets/images/home-services/bug-control.jpeg"),
  "woodborer-control": require("../../assets/images/home-services/bug-control.jpeg"),
  // floor polishing
  "mosaic-floor-polishing": require("../../assets/images/home-services/floor-polishing.jpeg"),
  "indian-marble-floor-polishing": require("../../assets/images/home-services/floor-polishing.jpeg"),
  "italian-marble-floor-polishing": require("../../assets/images/home-services/floor-polishing.jpeg"),
  "granite-floor-polishing": require("../../assets/images/home-services/floor-polishing.jpeg"),
  // appliances
  "refrigerator-repairing": require("../../assets/images/home-services/fridge.jpeg"),
  "window-ac-service": require("../../assets/images/home-services/Ac-cleaning.jpeg"),
  "washing-machine-repairing": require("../../assets/images/home-services/washing-machine.jpeg"),
  "split-ac-service": require("../../assets/images/home-services/ac-repair.jpeg"),
  "geyser-repairing": require("../../assets/images/home-services/geyser.jpeg"),
  // home repair
  "electrical-work": require("../../assets/images/home-services/electrician.jpeg"),
  "plumbing-work": require("../../assets/images/home-services/plumbing.jpeg"),
  "carpenter-work": require("../../assets/images/home-services/carpentry.jpeg"),
  "bird-netting": require("../../assets/images/home-services/home-cleaning.jpeg"),
  // facility management
  "housekeeping-service": require("../../assets/images/home-services/home-cleaning.jpeg"),
  "hospital-facility-management": require("../../assets/images/home-services/office-cleaning.jpeg"),
};

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

const GLOBAL_FALLBACK = `https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?${w(1200)}`;

function stableIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Prefer non-empty https URL from API, else bundled asset for subcategoryKey, else Unsplash pool.
 */
export function resolveHomeServiceImageSource(
  apiImageUrl: string | null | undefined,
  subcategoryKey: string,
  categoryKey: string,
): ImageSourcePropType {
  const url = String(apiImageUrl ?? "").trim();
  if (url && isHttpUrl(url)) {
    return { uri: url };
  }
  const bundled = SUBCATEGORY_BUNDLED[subcategoryKey];
  if (bundled != null) {
    return bundled;
  }
  return { uri: getSubcategoryImageUri(subcategoryKey, categoryKey) };
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
