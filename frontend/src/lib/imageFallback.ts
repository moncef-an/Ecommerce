/**
 * Curated thematic fallback images for categories and products.
 *
 * IMPORTANT HONESTY NOTE:
 * The Go backend models (`Product` and `Category`) currently do NOT include an
 * `image_url` column in MySQL. These images are local UI fallbacks categorized
 * by category name so the storefront looks professional without pretending
 * the URLs came from the database.
 */

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
  laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  mouses: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_HARDWARE_IMAGE =
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

/**
 * Returns a reliable image URL for a given product and category name
 */
export function getProductFallbackImage(categoryName?: string): string {
  if (!categoryName) return DEFAULT_HARDWARE_IMAGE;
  const key = categoryName.trim().toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[key] || DEFAULT_HARDWARE_IMAGE;
}

/**
 * Returns a reliable image URL for a given category
 */
export function getCategoryFallbackImage(categoryName: string): string {
  const key = categoryName.trim().toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[key] || DEFAULT_HARDWARE_IMAGE;
}

