import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FALLBACK_PRODUCT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Cpath d='M200 120c-22 0-40 18-40 40v80c0 22 18 40 40 40s40-18 40-40v-80c0-22-18-40-40-40z' fill='%239ca3af'/%3E%3Crect x='160' y='260' width='80' height='20' rx='4' fill='%239ca3af'/%3E%3C/svg%3E";

export function getDefaultProductPlaceholder(defaultProductImage?: string | null): string {
  return defaultProductImage || FALLBACK_PRODUCT_PLACEHOLDER;
}

export function getProductThumbnail(
  product: { imageUrl?: string | null; imageUrls?: string[] | null },
  defaultProductImage?: string | null
): string {
  if (product.imageUrls && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }
  if (product.imageUrl) {
    return product.imageUrl;
  }
  return getDefaultProductPlaceholder(defaultProductImage);
}
