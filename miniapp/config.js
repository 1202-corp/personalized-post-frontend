/**
 * MiniApp Configuration
 * 
 * For production: API_BASE_URL should point to the api service
 * This can be configured via environment variables during build
 * or through a reverse proxy (nginx) that routes /api/* to the backend
 */

// Default configuration - can be overridden by query params or env
const CONFIG = {
    // API base URL - in production, use nginx to proxy /api/* to api:8000
    // For local development without proxy, use absolute URL
    API_BASE_URL: window.MINIAPP_API_URL || '/api/v1',
    
    // Media endpoint for fetching photos from user-bot
    MEDIA_BASE_URL: window.MINIAPP_MEDIA_URL || '/media',
    
    // Training settings (should match .env values)
    // Number of posts per channel to fetch for training pool
    TRAINING_POSTS_PER_CHANNEL: window.TRAINING_POSTS_PER_CHANNEL || 50,
    // Initial posts per channel for training queue
    TRAINING_INITIAL_POSTS_PER_CHANNEL: window.TRAINING_INITIAL_POSTS_PER_CHANNEL || 7,
    // Max extra posts from dislikes
    TRAINING_MAX_EXTRA_FROM_DISLIKE: window.TRAINING_MAX_EXTRA_FROM_DISLIKE || 5,
    // Max extra posts from skips  
    TRAINING_MAX_EXTRA_FROM_SKIP: window.TRAINING_MAX_EXTRA_FROM_SKIP || 10,
    
    // Swipe gesture settings
    SWIPE_THRESHOLD: 100,
    ROTATION_FACTOR: 0.1,
    
    // Default language (short code, miniapp uses 'en'/'ru' internally)
    DEFAULT_LANGUAGE: 'en',
};

// Parse URL parameters to override config
(function parseUrlConfig() {
    const params = new URLSearchParams(window.location.search);
    
    // Allow API URL override via query param (for development)
    const apiUrl = params.get('api_url');
    if (apiUrl) {
        CONFIG.API_BASE_URL = apiUrl;
    }
    
    // Allow media URL override
    const mediaUrl = params.get('media_url');
    if (mediaUrl) {
        CONFIG.MEDIA_BASE_URL = mediaUrl;
    }
})();

// Export for use in other scripts
window.APP_CONFIG = CONFIG;
