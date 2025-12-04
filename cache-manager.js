// Cache Manager for Krause Insurance
// Handles caching strategy for GoDaddy server with database integration

class CacheManager {
  constructor() {
    this.CACHE_VERSION = 'v1.0.0';
    this.CACHE_PREFIX = 'krause_cache_';
    this.CACHE_DURATION = {
      SHORT: 5 * 60 * 1000,      // 5 minutes - for frequently changing data
      MEDIUM: 30 * 60 * 1000,    // 30 minutes - for user-specific data
      LONG: 24 * 60 * 60 * 1000, // 24 hours - for static content
      PERMANENT: null             // Never expires - for critical static data
    };
    
    this.initializeCache();
  }

  initializeCache() {
    // Check if cache version changed, clear if needed
    const storedVersion = localStorage.getItem('cache_version');
    if (storedVersion !== this.CACHE_VERSION) {
      this.clearAllCache();
      localStorage.setItem('cache_version', this.CACHE_VERSION);
    }
  }

  // Generate cache key
  generateKey(identifier, userId = null) {
    const userPart = userId ? `_user_${userId}` : '';
    return `${this.CACHE_PREFIX}${identifier}${userPart}`;
  }

  // Set cache with expiration
  set(identifier, data, duration = this.CACHE_DURATION.MEDIUM, userId = null) {
    try {
      const key = this.generateKey(identifier, userId);
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        duration: duration,
        version: this.CACHE_VERSION
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.warn('Cache set failed:', error);
      // If localStorage is full, clear old cache
      this.clearExpiredCache();
      return false;
    }
  }

  // Get cached data
  get(identifier, userId = null) {
    try {
      const key = this.generateKey(identifier, userId);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check version
      if (cacheData.version !== this.CACHE_VERSION) {
        this.remove(identifier, userId);
        return null;
      }
      
      // Check expiration
      if (cacheData.duration !== null) {
        const age = Date.now() - cacheData.timestamp;
        if (age > cacheData.duration) {
          this.remove(identifier, userId);
          return null;
        }
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  // Remove specific cache
  remove(identifier, userId = null) {
    const key = this.generateKey(identifier, userId);
    localStorage.removeItem(key);
  }

  // Clear expired cache
  clearExpiredCache() {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (cached.duration !== null) {
            const age = now - cached.timestamp;
            if (age > cached.duration) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Clear all cache
  clearAllCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Clear user-specific cache (on logout)
  clearUserCache(userId) {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(`_user_${userId}`)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getCacheStats() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(this.CACHE_PREFIX));
    
    let totalSize = 0;
    let expired = 0;
    let valid = 0;
    
    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      totalSize += value.length;
      
      try {
        const cached = JSON.parse(value);
        if (cached.duration !== null) {
          const age = Date.now() - cached.timestamp;
          if (age > cached.duration) {
            expired++;
          } else {
            valid++;
          }
        } else {
          valid++;
        }
      } catch (error) {
        expired++;
      }
    });
    
    return {
      totalEntries: cacheKeys.length,
      validEntries: valid,
      expiredEntries: expired,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB'
    };
  }
}

// API Cache Wrapper for database calls
class APICache {
  constructor(cacheManager) {
    this.cache = cacheManager;
    this.pendingRequests = new Map();
  }

  // Fetch with cache
  async fetchWithCache(url, options = {}, cacheOptions = {}) {
    const {
      identifier = url,
      duration = this.cache.CACHE_DURATION.MEDIUM,
      userId = null,
      forceRefresh = false,
      showLoading = true
    } = cacheOptions;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(identifier, userId);
      if (cached) {
        console.log('✅ Cache hit:', identifier);
        return cached;
      }
    }

    // Check if request is already pending (prevent duplicate requests)
    if (this.pendingRequests.has(identifier)) {
      console.log('⏳ Request pending, waiting...:', identifier);
      return this.pendingRequests.get(identifier);
    }

    // Show loading screen if needed
    if (showLoading) {
      this.showLoadingScreen(`Cargando ${identifier}...`);
    }

    // Make request
    const requestPromise = fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Cache the result
        this.cache.set(identifier, data, duration, userId);
        this.pendingRequests.delete(identifier);
        
        if (showLoading) {
          this.hideLoadingScreen();
        }
        
        console.log('✅ Data fetched and cached:', identifier);
        return data;
      })
      .catch(error => {
        console.error('❌ Fetch error:', error);
        this.pendingRequests.delete(identifier);
        
        if (showLoading) {
          this.hideLoadingScreen();
        }
        
        throw error;
      });

    this.pendingRequests.set(identifier, requestPromise);
    return requestPromise;
  }

  showLoadingScreen(message) {
    // Redirect to loading screen with custom message
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `loading.html?message=${encodeURIComponent(message)}&redirect=${currentUrl}`;
  }

  hideLoadingScreen() {
    // Loading screen auto-redirects, no action needed
  }
}

// File Upload/Download Manager with progress
class FileManager {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      documents: ['pdf', 'doc', 'docx', 'txt'],
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      spreadsheets: ['xls', 'xlsx', 'csv']
    };
  }

  // Upload file with progress
  async uploadFile(file, endpoint, onProgress) {
    return new Promise((resolve, reject) => {
      // Validate file
      if (file.size > this.maxFileSize) {
        reject(new Error('El archivo excede el tamaño máximo permitido (10MB)'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          if (onProgress) onProgress(percentComplete);
        }
      });

      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Error al procesar la respuesta del servidor'));
          }
        } else {
          reject(new Error(`Error en la carga: ${xhr.statusText}`));
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al cargar el archivo'));
      });

      xhr.open('POST', endpoint);
      xhr.send(formData);
    });
  }

  // Download file with progress
  async downloadFile(url, filename, onProgress) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total) {
          const percentComplete = Math.round((loaded / total) * 100);
          onProgress(percentComplete);
        }
      }

      // Create blob and download
      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Validate file type
  validateFileType(filename, category) {
    const extension = filename.split('.').pop().toLowerCase();
    const allowedExtensions = this.allowedTypes[category] || [];
    return allowedExtensions.includes(extension);
  }
}

// Initialize global cache manager
const cacheManager = new CacheManager();
const apiCache = new APICache(cacheManager);
const fileManager = new FileManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CacheManager, APICache, FileManager, cacheManager, apiCache, fileManager };
}
