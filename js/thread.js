// ============================================
// ChiperFlux — Thread Page Logic (Premium)
// ============================================

const DATA_URL = 'data/site.json';

async function loadData() {
    try {
        const res = await fetch(DATA_URL);
        return await res.json();
    } catch (e) {
        console.error('Failed to load data:', e);
        return null;
    }
}

function getThreadId() {
    return new URLSearchParams(window.location.search).get('id');
}

function formatDate(str) {
    return new Date(str).toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function formatTweetText(text) {
    return text
        .replace(/(#\w+)/g, '<span style="color:#ccc">$1</span>')
        .replace(/(@\w+)/g, '<span style="color:#aaa">$1</span>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#ccc">$1</a>')
        .replace(/\n/g, '<br>');
}

function renderThread(thread) {
    document.title = `${thread.title} — ChiperFlux`;
    document.getElementById('threadTitle').textContent = thread.title;
    document.getElementById('threadTag').textContent = thread.tag;
    document.getElementById('threadDate').textContent = formatDate(thread.date);
    document.getElementById('threadReadTime').textContent = `📖 ${thread.readTime}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = thread.excerpt;

    const tweetList = document.getElementById('tweetList');
    tweetList.innerHTML = thread.tweets.map((tweet, i) => `
        <div class="tweet-card animate-in">
            <span class="tweet-number">TWEET ${i + 1} / ${thread.tweets.length}</span>
            <div>${formatTweetText(tweet)}</div>
        </div>
    `).join('');

    const shareText = encodeURIComponent(`🧵 ${thread.title}\n\nRead full thread:`);
    const shareUrl = encodeURIComponent(window.location.href);
    document.getElementById('twitterShareBtn').href =
        `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
}

function renderRelated(threads, currentId) {
    const related = threads.filter(t => t.id !== currentId).slice(0, 3);
    const grid = document.getElementById('relatedThreads');
    grid.innerHTML = related.map(t => `
        <a href="thread.html?id=${t.id}" class="thread-card animate-in">
            <div class="thread-header">
                <span class="thread-tag">${t.tag}</span>
                <span class="thread-date">${t.readTime}</span>
            </div>
            <h3 class="thread-title">${t.title}</h3>
            <p class="thread-excerpt">${t.excerpt}</p>
        </a>
    `).join('');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const toast = document.createElement('div');
        toast.textContent = '📋 Link copied!';
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#fff;color:#000;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:fadeInUp 0.3s;box-shadow:0 8px 32px rgba(255,255,255,0.1)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    });
}

async function init() {
    const threadId = getThreadId();
    if (!threadId) { window.location.href = '/'; return; }

    const data = await loadData();
    if (!data) {
        document.querySelector('.thread-page').innerHTML = `
            <div style="text-align:center;padding:100px 20px;">
                <h2 style="font-size:48px;margin-bottom:16px">⚠️</h2>
                <h3>Failed to load data</h3>
                <a href="/" class="btn btn-primary" style="margin-top:16px">← Back</a>
            </div>
        `;
        return;
    }

    const thread = data.threads.find(t => t.id === threadId);
    if (!thread) {
        document.querySelector('.thread-page').innerHTML = `
            <div style="text-align:center;padding:100px 20px;">
                <h2 style="font-size:48px;margin-bottom:16px">🔍</h2>
                <h3>Thread not found</h3>
                <a href="/" class="btn btn-primary" style="margin-top:16px">← Back</a>
            </div>
        `;
        return;
    }

    renderThread(thread);
    renderRelated(data.threads, threadId);
}

document.addEventListener('DOMContentLoaded', init);
