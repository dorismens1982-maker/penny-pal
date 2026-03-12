import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOptimizedImageUrl(url: string | null | undefined, width = 1200) {
  if (!url) return '';
  
  // If it's a Cloudinary URL, add auto optimization and resizing
  if (url.includes('cloudinary.com')) {
    // Insert optimization parameters after /upload/
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/q_auto,f_auto,w_${width}/${parts[1]}`;
    }
  }
  
  return url;
}
