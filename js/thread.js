// ============================================
// Thread Page Logic
// ============================================

const DATA_URL = 'data/site.json';

// Load data
async function loadData() {
    try {
        const response = await fetch(DATA_URL);
        return await response.json();
    } catch (error) {
        console.error('Failed to load data:', error);
        return null;
    }
}

// Get thread ID from URL
function getThreadId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Render thread
function renderThread(thread) {
    // Update title
    document.title = `${thread.title} — C h i p e r F l u x 🎖️`;
    document.getElementById('threadTitle').textContent = thread.title;
    document.getElementById('threadTag').textContent = thread.tag;
    document.getElementById('threadDate').textContent = formatDate(thread.date);
    document.getElementById('threadReadTime').textContent = `📖 ${thread.readTime}`;

    // Update meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = thread.excerpt;

    // Render tweets
    const tweetList = document.getElementById('tweetList');
    tweetList.innerHTML = thread.tweets.map((tweet, i) => `
        <div class="tweet-card animate-in">
            <span class="tweet-number">Tweet ${i + 1}/${thread.tweets.length}</span>
            <div>${formatTweetText(tweet)}</div>
        </div>
    `).join('');

    // Twitter share button
    const shareText = encodeURIComponent(`🧵 ${thread.title}\n\nRead full thread:`);
    const shareUrl = encodeURIComponent(window.location.href);
    document.getElementById('twitterShareBtn').href = 
        `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
}

// Format tweet text (add line breaks, highlight hashtags/mentions)
function formatTweetText(text) {
    return text
        .replace(/(#\w+)/g, '<span style="color:#8b5cf6">$1</span>')
        .replace(/(@\w+)/g, '<span style="color:#8b5cf6">$1</span>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#8b5cf6">$1</a>')
        .replace(/\n/g, '<br>');
}

// Render related threads
function renderRelated(threads, currentId) {
    const related = threads.filter(t => t.id !== currentId).slice(0, 3);
    const grid = document.getElementById('relatedThreads');
    
    grid.innerHTML = related.map(thread => `
        <a href="thread.html?id=${thread.id}" class="thread-card animate-in">
            <div class="thread-header">
                <span class="thread-tag">${thread.tag}</span>
                <span class="thread-date">${thread.readTime}</span>
            </div>
            <h3 class="thread-title">${thread.title}</h3>
            <p class="thread-excerpt">${thread.excerpt}</p>
        </a>
    `).join('');
}

// Copy link
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.btn-secondary');
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = '📋 Copy Link';
        }, 2000);
    });
}

// Init
async function init() {
    const threadId = getThreadId();
    if (!threadId) {
        window.location.href = '/';
        return;
    }

    const data = await loadData();
    if (!data) {
        document.querySelector('.thread-page').innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <h2>⚠️ Failed to load data</h2>
                <p style="color:#a1a1aa; margin-top:8px;">Try refreshing the page</p>
                <a href="/" class="btn btn-primary" style="margin-top:16px;">← Back</a>
            </div>
        `;
        return;
    }

    const thread = data.threads.find(t => t.id === threadId);
    if (!thread) {
        document.querySelector('.thread-page').innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <h2>🔍 Thread not found</h2>
                <p style="color:#a1a1aa; margin-top:8px;">Thread with ID "${threadId}" doesn't exist</p>
                <a href="/" class="btn btn-primary" style="margin-top:16px;">← Back</a>
            </div>
        `;
        return;
    }

    renderThread(thread);
    renderRelated(data.threads, threadId);
}

// Run
document.addEventListener('DOMContentLoaded', init);
