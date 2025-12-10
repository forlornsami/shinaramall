import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEFAULT_PRODUCT_PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

export function getProductThumbnail(product: { imageUrl?: string | null; imageUrls?: string[] | null }): string {
  if (product.imageUrls && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }
  if (product.imageUrl) {
    return product.imageUrl;
  }
  return DEFAULT_PRODUCT_PLACEHOLDER;
}
