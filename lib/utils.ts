import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Normalizes image URLs and provides robust fallbacks for missing or legacy assets.
 */
export const normalizeImage = (url: string | undefined | null) => {
    if (!url) return '/images/NoImage.jpg';

    // Check if it's exactly the placeholder or contains it
    const isPlaceholder =
        url === '/placeholder.jpg' ||
        url === 'placeholder.jpg' ||
        url.includes('placeholder.jpg') ||
        url === 'https://onlinebar.co.ke/placeholder.jpg';

    if (isPlaceholder) {
        return '/images/NoImage.jpg';
    }
    return url;
};

export const formatPrice = (price: number | string | undefined | null) => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price || 0);
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(numericPrice) ? 0 : numericPrice);
};

export const getReferralLink = (code: string, path: string = '/shop') => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://onlinebar-os.onrender.com');
    const separator = path.includes('?') ? '&' : '?';
    return `${baseUrl}${path}${separator}ref=${code}`;
};

/**
 * Calculates distance between two GPS coordinates in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};
