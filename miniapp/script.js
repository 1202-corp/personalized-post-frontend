/**
 * Personalized Post Bot - Training MiniApp
 * Tinder-like swipe interface for rating posts
 */

// Telegram WebApp instance
const tg = window.Telegram.WebApp;

// Configuration from config.js (base config, training values loaded from API)
const config = window.APP_CONFIG || {
    API_BASE_URL: '/api/v1',
    MEDIA_BASE_URL: '/media',
    SWIPE_THRESHOLD: 100,
    ROTATION_FACTOR: 0.1,
};

// Training settings (loaded from API /config/training)
let TRAINING_POSTS_PER_CHANNEL = 50;      // default, will be overwritten
let INITIAL_POSTS_PER_CHANNEL = 8;        // default, will be overwritten
let MAX_EXTRA_FROM_DISLIKE = 5;           // default, will be overwritten
let MAX_EXTRA_FROM_SKIP = 7;              // default, will be overwritten

// State
let posts = [];           // Full pool of posts
let queue = [];           // Indices of posts to show (starts with first N per channel, grows on dislikes)
let shownIndices = new Set();  // Track already shown posts to prevent duplicates
let currentQueueIndex = 0;
let ratedCount = 0;
let extraFromDislike = 0;
let extraFromSkip = 0;
let userId = null;
let userLanguage = 'en';
let isLoading = true;
let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;

// DOM Elements
const cardContainer = document.getElementById('cardContainer');
const cardTemplate = document.getElementById('cardTemplate');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const instructions = document.getElementById('instructions');

// Initialize app
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Initialize Telegram WebApp
    tg.ready();
    tg.expand();
    
    // Prevent closing on vertical swipe (Telegram 7.7+)
    if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
    }
    
    // Request fullscreen if available (Telegram 8.0+)
    if (tg.requestFullscreen) {
        try {
            tg.requestFullscreen();
        } catch (e) {
            console.log('Fullscreen not available');
        }
    }
    
    // Apply Telegram theme
    applyTheme();
    
    // Initialize i18n
    userLanguage = window.i18n?.detect() || 'en';
    window.i18n?.init(userLanguage);
    
    // Get user data - try multiple sources
    userId = getUserId();
    
    // Setup main button with localized text
    const finishText = window.i18n?.t('finishButton') || 'Finish Training';
    tg.MainButton.setText(finishText);
    tg.MainButton.onClick(finishTraining);
    
    // Update loading text
    const loadingText = document.querySelector('#loading p');
    if (loadingText && window.i18n) {
        loadingText.textContent = window.i18n.t('loading');
    }
    
    // Load training config from API (overrides defaults with .env values)
    await loadTrainingConfig();
    
    // Load posts
    await loadPosts();
}

/**
 * Load training configuration from API (values from .env)
 */
async function loadTrainingConfig() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/config/training`);
        if (response.ok) {
            const cfg = await response.json();
            TRAINING_POSTS_PER_CHANNEL = cfg.posts_per_channel || TRAINING_POSTS_PER_CHANNEL;
            INITIAL_POSTS_PER_CHANNEL = cfg.initial_posts_per_channel || INITIAL_POSTS_PER_CHANNEL;
            MAX_EXTRA_FROM_DISLIKE = cfg.max_extra_from_dislike || MAX_EXTRA_FROM_DISLIKE;
            MAX_EXTRA_FROM_SKIP = cfg.max_extra_from_skip || MAX_EXTRA_FROM_SKIP;
            console.log(`Training config loaded: pool=${TRAINING_POSTS_PER_CHANNEL}, initial=${INITIAL_POSTS_PER_CHANNEL}, maxDislike=${MAX_EXTRA_FROM_DISLIKE}, maxSkip=${MAX_EXTRA_FROM_SKIP}`);
        } else {
            console.warn('Failed to load training config, using defaults');
        }
    } catch (e) {
        console.warn('Error loading training config:', e);
    }
}

/**
 * Get user ID from various sources
 * Priority: Telegram initData > URL parameter > null
 */
function getUserId() {
    // 1. Try Telegram initDataUnsafe
    if (tg.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id;
    }
    
    // 2. Try URL parameter (fallback for development/testing)
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get('user_id');
    if (urlUserId && !isNaN(parseInt(urlUserId))) {
        console.warn('Using user_id from URL parameter (development mode)');
        return parseInt(urlUserId);
    }
    
    // 3. No user ID available
    console.warn('No user ID available - using mock mode');
    return null;
}

function applyTheme() {
    // Apply Telegram theme colors
    const root = document.documentElement;
    
    if (tg.themeParams.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    }
    if (tg.themeParams.text_color) {
        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
    }
    if (tg.themeParams.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
    }
    if (tg.themeParams.link_color) {
        root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
    }
    if (tg.themeParams.button_color) {
        root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
    }
    if (tg.themeParams.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
    }
    if (tg.themeParams.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
    }
}

async function loadPosts() {
    let emptyMessage = null;
    try {
        if (!userId) {
            posts = getMockPosts();
        } else {
            const params = new URLSearchParams(window.location.search);
            const specificChannel = params.get('channel');
            const channelsParam = params.get('channels');
            let channelUsernames;
            if (specificChannel) {
                channelUsernames = [`@${specificChannel}`];
            } else if (channelsParam) {
                channelUsernames = channelsParam.split(',').map(ch => ch.trim().startsWith('@') ? ch.trim() : `@${ch.trim()}`);
            } else {
                try {
                    const channelsResponse = await fetch(`${config.API_BASE_URL}/channels/user/${userId}`);
                    if (channelsResponse.ok) {
                        const userChannels = await channelsResponse.json();
                        channelUsernames = userChannels.map(ch => `@${ch.username}`);
                    }
                } catch (e) {
                    console.warn('Failed to fetch user channels:', e);
                }
                if (!channelUsernames || channelUsernames.length === 0) {
                    channelUsernames = ['@durov', '@telegram'];
                }
            }
            const response = await fetch(`${config.API_BASE_URL}/posts/training`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_telegram_id: userId,
                    channel_usernames: channelUsernames,
                    posts_per_channel: TRAINING_POSTS_PER_CHANNEL,
                }),
            });
            if (response.ok) {
                const rawPosts = await response.json();
                // API returns N1 then N2 (no interleaving); use as-is, progress is overall
                posts = rawPosts;
            } else {
                if (response.status === 403) {
                    const err = await response.json().catch(() => ({}));
                    emptyMessage = typeof err.detail === 'string' ? err.detail : (window.i18n?.t('training_only_when_started') || 'Start training from the bot first.');
                } else {
                    console.error(`API returned ${response.status}`);
                }
                posts = [];
            }
        }
        isLoading = false;
        loading.style.display = 'none';
        if (posts.length === 0) {
            showEmptyState(emptyMessage);
        } else {
            // Load content for posts without text (fetch from user-bot via API)
            await loadMissingPostContent();
            
            // Build initial queue: take INITIAL_POSTS_PER_CHANNEL from each channel
            queue = buildInitialQueue(posts, INITIAL_POSTS_PER_CHANNEL);
            currentQueueIndex = 0;
            shownIndices.clear();
            extraFromDislike = 0;
            extraFromSkip = 0;
            renderCurrentCard();
            updateProgress();
            setTimeout(() => prefetchAllImages(), 100);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        posts = [];
        isLoading = false;
        loading.style.display = 'none';
        showEmptyState();
    }
}

/**
 * Load content for posts that don't have text (fetches from user-bot via API).
 * Updates posts array in place. Marks failed posts with _contentFailed flag.
 */
async function loadMissingPostContent() {
    const postsWithoutText = posts.filter(p => !p.text && p.id);
    if (postsWithoutText.length === 0) return;
    
    console.log(`Loading content for ${postsWithoutText.length} posts without text...`);
    
    // Load content in parallel (with concurrency limit)
    const concurrency = 5;
    for (let i = 0; i < postsWithoutText.length; i += concurrency) {
        const batch = postsWithoutText.slice(i, i + concurrency);
        await Promise.all(batch.map(async (post) => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/posts/${post.id}/content`);
                if (response.ok) {
                    const content = await response.json();
                    // Update post in place
                    if (content.text) {
                        post.text = content.text;
                    }
                    if (content.media_type && !post.media_type) {
                        post.media_type = content.media_type;
                    }
                } else {
                    console.warn(`Failed to load content for post ${post.id}: ${response.status}`);
                    post._contentFailed = true;
                }
            } catch (e) {
                console.warn(`Error loading content for post ${post.id}:`, e);
                post._contentFailed = true;
            }
        }));
    }
    
    // Filter out posts that failed to load and still have no text
    const validPosts = posts.filter(p => p.text || !p._contentFailed);
    const failedCount = posts.length - validPosts.length;
    if (failedCount > 0) {
        console.log(`Filtered out ${failedCount} posts with failed content loading`);
        posts = validPosts;
    }
    
    console.log(`Content loading complete. Posts with text: ${posts.filter(p => p.text).length}/${posts.length}`);
}

/** Normalize channel name for grouping (same as bot). */
function normChannel(name) {
    if (name == null) return 'unknown';
    return String(name).trim().replace(/^@/, '').toLowerCase();
}

/**
 * Find next available post from the specified channel (not in queue, not shown).
 * Returns index in posts array, or -1 if none available.
 */
function findNextAvailablePostFromChannel(channel) {
    for (let i = 0; i < posts.length; i++) {
        if (queue.includes(i) || shownIndices.has(i)) continue;
        const postChannel = normChannel(posts[i]?.channel_username || posts[i]?.channel_title);
        if (postChannel === channel) {
            return i;
        }
    }
    return -1;
}

/**
 * Build initial queue: take N posts from each channel sequentially.
 * Posts come from API as: [ch1_post1, ch1_post2, ..., ch1_postN, ch2_post1, ch2_post2, ...]
 * Result queue: indices for first N posts of ch1, then first N posts of ch2, etc.
 */
function buildInitialQueue(allPosts, postsPerChannel) {
    // Group posts by channel, preserving order
    const channelPosts = {};
    const channelOrder = [];
    
    allPosts.forEach((post, index) => {
        const channel = normChannel(post.channel_username || post.channel_title);
        if (!channelPosts[channel]) {
            channelPosts[channel] = [];
            channelOrder.push(channel);
        }
        channelPosts[channel].push(index);
    });
    
    // Take first N from each channel
    const result = [];
    for (const channel of channelOrder) {
        const indices = channelPosts[channel].slice(0, postsPerChannel);
        result.push(...indices);
    }
    
    console.log(`Built initial queue: ${result.length} posts from ${channelOrder.length} channels (${postsPerChannel} per channel)`);
    return result;
}

/** (Unused) Previously interleaved posts; API now returns N1 then N2, use as-is. */
function interleavePostsByChannel(rawPosts) {
    const byChannel = {};
    for (const post of rawPosts) {
        const ch = normChannel(post.channel_username || post.channel_title);
        if (!byChannel[ch]) byChannel[ch] = [];
        byChannel[ch].push(post);
    }
    const sortedNames = Object.keys(byChannel).sort();
    const channelLists = sortedNames.map(name => byChannel[name]);
    const interleaved = [];
    let col = 0;
    let hasMore = true;
    while (hasMore) {
        hasMore = false;
        for (const list of channelLists) {
            if (col < list.length) {
                interleaved.push(list[col]);
                hasMore = true;
            }
        }
        col++;
    }
    return interleaved;
}

function getMockPosts() {
    return [
        {
            id: 1,
            channel_title: 'Tech News',
            text: 'Breaking: New AI model achieves human-level performance on complex reasoning tasks. This marks a significant milestone in artificial intelligence research.',
        },
        {
            id: 2,
            channel_title: 'Daily Digest',
            text: 'Top 5 productivity tips for remote workers:\n\n1. Set clear boundaries\n2. Take regular breaks\n3. Create a dedicated workspace\n4. Use time-blocking\n5. Stay connected with your team',
        },
        {
            id: 3,
            channel_title: 'Science Today',
            text: 'Researchers discover new species in the deep ocean. The creature, found at depths of over 3,000 meters, exhibits unique bioluminescent properties.',
        },
        {
            id: 4,
            channel_title: 'Finance Updates',
            text: 'Market analysis: Global stocks rally as inflation concerns ease. Experts predict continued growth through the quarter.',
        },
        {
            id: 5,
            channel_title: 'Health & Wellness',
            text: 'New study reveals the benefits of morning exercise for mental health. Participants reported improved mood and focus throughout the day.',
        },
    ];
}

function renderCurrentCard() {
    // Clear existing cards
    const existingCards = cardContainer.querySelectorAll('.card:not(#cardTemplate)');
    existingCards.forEach(card => card.remove());
    
    // Check if queue is exhausted
    if (currentQueueIndex >= queue.length) {
        showEmptyState();
        return;
    }
    
    // Get post from queue
    const postIndex = queue[currentQueueIndex];
    const post = posts[postIndex];
    const card = createCard(post);
    cardContainer.appendChild(card);
    
    // Mark as shown
    shownIndices.add(postIndex);
    
    // Setup event listeners
    setupCardEvents(card);
}

function createCard(post) {
    const card = cardTemplate.cloneNode(true);
    card.id = `card-${post.id}`;
    card.classList.remove('hidden');
    card.dataset.postId = post.id;
    
    // Set content with i18n fallback and link to original post
    const unknownChannel = window.i18n?.t('unknownChannel') || 'Unknown Channel';
    const sourceLink = card.querySelector('.source-name');
    sourceLink.textContent = post.channel_title || unknownChannel;
    
    // Build link to original post
    const channelUsername = (post.channel_username || '').replace('@', '');
    const messageId = post.telegram_message_id;
    if (channelUsername && messageId) {
        sourceLink.href = `https://t.me/${channelUsername}/${messageId}`;
    } else if (channelUsername) {
        sourceLink.href = `https://t.me/${channelUsername}`;
    } else {
        sourceLink.removeAttribute('href');
    }

    const carousel = card.querySelector('.card-carousel');
    const track = card.querySelector('.carousel-track');
    const dotsContainer = card.querySelector('.carousel-dots');
    const prevBtn = card.querySelector('.carousel-prev');
    const nextBtn = card.querySelector('.carousel-next');

    if (carousel && track && (post.media_type === 'photo' || post.media_type === 'video') && post.telegram_message_id && post.channel_username) {
        // Single media per post - use telegram_message_id
        track.innerHTML = '';
        dotsContainer.innerHTML = '';
        let currentSlide = 0;
        
        // Only one slide per post (Telegram returns the photo for the message)
        {
            const mediaUrl = getMediaUrl(post);
            const index = 0;
                
                // Create slide container with placeholder
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                
                // Add loading placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'media-placeholder';
                slide.appendChild(placeholder);
                
                // Create media element
                const media = document.createElement(post.media_type === 'video' ? 'video' : 'img');
                media.alt = 'Post image';
                
                if (post.media_type === 'video') {
                    media.controls = true;
                    media.muted = true;
                    media.playsInline = true;
                    media.src = mediaUrl;
                    media.onloadeddata = () => {
                        media.classList.add('loaded');
                        placeholder.remove();
                    };
                } else {
                    // Check if already cached
                    if (mediaCache.has(mediaUrl)) {
                        media.src = mediaUrl;
                        media.classList.add('loaded');
                        placeholder.remove();
                    } else {
                        // Load with fade-in effect
                        media.onload = () => {
                            media.classList.add('loaded');
                            placeholder.remove();
                            mediaCache.add(mediaUrl);
                        };
                        media.onerror = () => {
                            console.error('Failed to load image:', mediaUrl);
                            placeholder.innerHTML = '❌';
                        };
                        media.src = mediaUrl;
                    }
                }
                
                slide.appendChild(media);
            track.appendChild(slide);
        }
        
        // Hide arrows and dots for single image
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        dotsContainer.style.display = 'none';
            
        carousel.classList.remove('hidden');
    } else if (carousel) {
        carousel.classList.add('hidden');
    }

    const mediaContent = window.i18n?.t('mediaContent') || '[Media content]';
    // Text comes in HTML format from user-bot, use innerHTML to preserve formatting
    card.querySelector('.card-text').innerHTML = post.text || mediaContent;
    
    // Setup action buttons
    const buttons = card.querySelectorAll('.btn-action');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            handleAction(action, card);
        });
    });
    
    return card;
}

function setupCardEvents(card) {
    // Touch events
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);
    
    // Mouse events (for desktop testing)
    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

let touchStartedInContent = false;
let isScrolling = null;

function handleTouchStart(e) {
    const touch = e.touches[0];
    const content = e.target.closest('.card-content');
    touchStartedInContent = !!content;
    isScrolling = null;
    startDrag(touch.clientX, touch.clientY, e.target.closest('.card'));
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    
    // Determine scroll direction on first significant move
    if (isScrolling === null && (deltaX > 5 || deltaY > 5)) {
        isScrolling = deltaY > deltaX;
    }
    
    // If scrolling vertically inside content, allow native scroll
    if (touchStartedInContent && isScrolling) {
        isDragging = false;
        activeCard = null;
        return;
    }
    
    // Horizontal swipe - prevent default and handle card drag
    e.preventDefault();
    updateDrag(touch.clientX, touch.clientY);
}

function handleTouchEnd() {
    touchStartedInContent = false;
    isScrolling = null;
    endDrag();
}

function handleMouseDown(e) {
    startDrag(e.clientX, e.clientY, e.target.closest('.card'));
}

function handleMouseMove(e) {
    if (!isDragging) return;
    updateDrag(e.clientX, e.clientY);
}

function handleMouseUp() {
    endDrag();
}

let activeCard = null;

function startDrag(x, y, card) {
    if (!card || card.id === 'cardTemplate') return;
    
    isDragging = true;
    activeCard = card;
    startX = x;
    startY = y;
    currentX = 0;
    
    card.style.transition = 'none';
}

function updateDrag(x, y) {
    if (!isDragging || !activeCard) return;
    
    currentX = x - startX;
    const rotation = currentX * config.ROTATION_FACTOR;
    
    activeCard.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
    
    // Update visual feedback
    if (currentX > config.SWIPE_THRESHOLD / 2) {
        activeCard.style.boxShadow = `0 4px 20px rgba(76, 175, 80, 0.3)`;
    } else if (currentX < -config.SWIPE_THRESHOLD / 2) {
        activeCard.style.boxShadow = `0 4px 20px rgba(244, 67, 54, 0.3)`;
    } else {
        activeCard.style.boxShadow = '';
    }
}

function endDrag() {
    if (!isDragging || !activeCard) return;
    
    isDragging = false;
    activeCard.style.transition = '';
    activeCard.style.boxShadow = '';
    
    if (currentX > config.SWIPE_THRESHOLD) {
        handleAction('like', activeCard);
    } else if (currentX < -config.SWIPE_THRESHOLD) {
        handleAction('dislike', activeCard);
    } else {
        // Reset position
        activeCard.style.transform = '';
    }
    
    activeCard = null;
}

async function handleAction(action, card) {
    const postId = parseInt(card.dataset.postId);
    
    // Get current post's channel for extra post selection
    const currentPostIndex = queue[currentQueueIndex];
    const currentPost = posts[currentPostIndex];
    const currentChannel = normChannel(currentPost?.channel_username || currentPost?.channel_title);
    
    // Animate card off screen
    if (action === 'like') {
        card.classList.add('swiping-right');
        tg.HapticFeedback.impactOccurred('light');
    } else if (action === 'dislike') {
        card.classList.add('swiping-left');
        tg.HapticFeedback.impactOccurred('light');
        
        // Add extra post from SAME channel on dislike (up to MAX_EXTRA_FROM_DISLIKE total)
        if (extraFromDislike < MAX_EXTRA_FROM_DISLIKE) {
            const extraIdx = findNextAvailablePostFromChannel(currentChannel);
            if (extraIdx !== -1) {
                queue.push(extraIdx);
                extraFromDislike++;
                console.log(`Dislike: added extra post ${extraIdx} from channel ${currentChannel}. Total extras: ${extraFromDislike}/${MAX_EXTRA_FROM_DISLIKE}`);
            }
        }
    } else if (action === 'skip') {
        card.classList.add('swiping-up');
        
        // Add extra post from SAME channel on skip (up to MAX_EXTRA_FROM_SKIP total)
        if (extraFromSkip < MAX_EXTRA_FROM_SKIP) {
            const extraIdx = findNextAvailablePostFromChannel(currentChannel);
            if (extraIdx !== -1) {
                queue.push(extraIdx);
                extraFromSkip++;
                console.log(`Skip: added extra post ${extraIdx} from channel ${currentChannel}. Total extras: ${extraFromSkip}/${MAX_EXTRA_FROM_SKIP}`);
            }
        }
    } else {
        card.classList.add('swiping-up');
    }
    
    // Send interaction to API
    if (action !== 'skip') {
        await sendInteraction(postId, action);
    }
    
    // Wait for animation
    setTimeout(() => {
        currentQueueIndex++;
        updateProgress();
        renderCurrentCard();
        // Preload next post's images
        preloadNextPost();
    }, 300);
}

async function sendInteraction(postId, interactionType) {
    try {
        if (!userId) {
            return;
        }
        // Send interaction to API (don't await to keep UI responsive)
        fetch(`${config.API_BASE_URL}/posts/interactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_telegram_id: userId,
                post_id: postId,
                interaction_type: interactionType,
            }),
        }).catch(err => console.warn('Interaction API error:', err));
        
        // Track rated count locally
        ratedCount++;
    } catch (error) {
        console.error('Error sending interaction:', error);
    }
}

function updateProgress() {
    const total = queue.length;  // Use queue length (grows on dislikes)
    const current = Math.min(currentQueueIndex, total);
    const percent = total > 0 ? (current / total) * 100 : 0;
    
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${current} / ${total}`;
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    instructions.style.display = 'none';
    
    // Update empty state text with i18n
    const emptyTitle = emptyState.querySelector('h2');
    const emptyText = emptyState.querySelector('p');
    
    if (emptyTitle && window.i18n) {
        emptyTitle.textContent = window.i18n.t('emptyTitle');
    }
    if (emptyText && window.i18n) {
        emptyText.textContent = window.i18n.t('emptyText');
    }
    
    tg.MainButton.show();
}

async function finishTraining() {
    // Disable button to prevent double-click
    tg.MainButton.disable();
    tg.MainButton.showProgress();
    
    // First, notify backend that training is complete (reliable method)
    if (userId) {
        try {
            await fetch(`${config.API_BASE_URL}/users/${userId}/training-complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rated_count: ratedCount }),
            });
        } catch (e) {
            console.warn('Failed to notify backend:', e);
        }
    }
    
    // Try sendData (works on desktop, may fail on some mobile)
    try {
        tg.sendData(JSON.stringify({
            action: 'training_complete',
            rated_count: ratedCount,
            user_id: userId,
        }));
    } catch (e) {
        console.warn('sendData failed:', e);
    }
    
    // Small delay before close to ensure data is sent
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Hide progress and close
    tg.MainButton.hideProgress();
    
    // Close the WebApp (try multiple times for desktop compatibility)
    try {
        tg.close();
    } catch (e) {
        console.warn('First close attempt failed:', e);
    }
    
    // Fallback: try again after short delay
    setTimeout(() => {
        try {
            tg.close();
        } catch (e) {
            console.warn('Second close attempt failed:', e);
            // Show success message if close doesn't work
            tg.MainButton.setText('✓ Done! Close manually');
            tg.MainButton.enable();
        }
    }, 500);
}

// Media cache for preloaded images
const mediaCache = new Map();

// Preload a single image and cache it
function preloadImage(url) {
    if (mediaCache.has(url)) {
        return mediaCache.get(url);
    }
    
    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
    });
    
    mediaCache.set(url, promise);
    return promise;
}

// Get media URL for a post
function getMediaUrl(post) {
    const endpoint = post.media_type === 'video' ? 'video' : 'photo';
    return `${config.MEDIA_BASE_URL}/${endpoint}?channel_username=${encodeURIComponent(post.channel_username)}&message_id=${encodeURIComponent(post.telegram_message_id)}`;
}

// Prefetch images with priority - current and next few first
function prefetchAllImages() {
    // Priority order: current post, next 2 posts, then rest
    const priorityOrder = [];
    
    // Add current and next posts first
    for (let i = currentIndex; i < Math.min(currentIndex + 3, posts.length); i++) {
        priorityOrder.push(posts[i]);
    }
    
    // Add remaining posts
    for (let i = 0; i < posts.length; i++) {
        if (i < currentIndex || i >= currentIndex + 3) {
            priorityOrder.push(posts[i]);
        }
    }
    
    // Preload in priority order
    priorityOrder.forEach((post, idx) => {
        if ((post.media_type === 'photo') && post.telegram_message_id && post.channel_username) {
            const url = getMediaUrl(post);
            // Stagger preloading to avoid overwhelming the network
            setTimeout(() => preloadImage(url), idx * 50);
        }
    });
}

// Preload next post's images when current card is shown
function preloadNextPost() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < posts.length) {
        const post = posts[nextIndex];
        if ((post.media_type === 'photo') && post.telegram_message_id && post.channel_username) {
            preloadImage(getMediaUrl(post));
        }
    }
}
