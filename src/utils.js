import { CONTACT_INFO, IMAGE_CONFIG } from './constants';

/**
 * Format phone number to (XXX) XXX-XXXX format
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Load value from localStorage with fallback
 */
export const loadFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Load boolean from localStorage with fallback
 */
export const loadBooleanFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save value to localStorage
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

/**
 * Calculate lighter accent color for theme
 */
export const calculateAccent2 = (mainColor) => {
  try {
    const hex = mainColor.replace('#', '');
    let full = hex;
    
    if (hex.length === 3) {
      // Expand short form
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      full = r + g + b;
    }
    
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    const mix = (v) => Math.round(v + (255 - v) * 0.36); // 36% towards white
    const r2 = mix(r), g2 = mix(g), b2 = mix(b);
    
    return `#${(1 << 24 | r2 << 16 | g2 << 8 | b2).toString(16).slice(1)}`;
  } catch (e) {
    return mainColor;
  }
};

/**
 * Calculate darker shade for background gradients
 */
export const calculateDarkShade = (mainColor, factor = 0.3) => {
  try {
    const hex = mainColor.replace('#', '');
    let full = hex;
    
    if (hex.length === 3) {
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      full = r + g + b;
    }
    
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    const darken = (v) => Math.round(v * factor);
    const r2 = darken(r), g2 = darken(g), b2 = darken(b);
    
    return `#${(1 << 24 | r2 << 16 | g2 << 8 | b2).toString(16).slice(1)}`;
  } catch (e) {
    return mainColor;
  }
};

/**
 * Resize and optimize image
 */
export const optimizeImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const objUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      try {
        const { maxDimension, webpQuality, jpegQuality } = IMAGE_CONFIG;
        let { width, height } = img;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', webpQuality);
          if (!dataUrl.startsWith('data:image/webp')) {
            throw new Error('webp not supported');
          }
        } catch (_) {
          dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        }
        
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objUrl;
  });
};

/**
 * Generate vCard file content
 */
export const generateVCard = (biography = '', githubUrl = '', websiteUrl = '') => {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONTACT_INFO.name}`,
    `ORG:${CONTACT_INFO.company}`,
    `TEL;TYPE=CELL:${CONTACT_INFO.phone}`,
    `EMAIL:${CONTACT_INFO.email}`,
    `ADR:;;${CONTACT_INFO.address};;;;`,
    `URL:${CONTACT_INFO.linkedin}`,
    githubUrl ? `URL:${githubUrl}` : '',
    websiteUrl ? `URL:${websiteUrl}` : '',
    biography ? `NOTE:${biography}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');
  
  return vcard;
};

/**
 * Download vCard file
 */
export const downloadVCard = (vcard) => {
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'guillermo-krause.vcf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Share contact using Web Share API
 */
export const shareContact = async () => {
  const shareData = {
    title: CONTACT_INFO.name,
    text: `${CONTACT_INFO.company} - Información de contacto`,
    url: window.location.href
  };
  
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'aborted' };
      }
      console.error('Error sharing:', err);
      throw err;
    }
  } else {
    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      throw err;
    }
  }
};
