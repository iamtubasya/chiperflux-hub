// ============================================
// ChiperFlux — Thread Page Logic
// ============================================

const DATA_URL = 'data/site.json';

function toggleNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('mobileMenu');
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
}

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
        .replace(/(#\w+)/g, '<span style="color:#ff5c35">$1</span>')
        .replace(/(@\w+)/g, '<span style="color:#ff5c35">$1</span>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#ff5c35">$1</a>')
        .replace(/\n/g, '<br>');
}

function renderThread(thread) {
    document.title = thread.title + ' — ChiperFlux';
    document.getElementById('threadTitle').textContent = thread.title;
    document.getElementById('threadTag').textContent = thread.tag;
    document.getElementById('threadDate').textContent = formatDate(thread.date);
    document.getElementById('threadReadTime').textContent = '📖 ' + thread.readTime;

    const tweetList = document.getElementById('tweetList');
    tweetList.innerHTML = thread.tweets.map((tweet, i) =>
        '<div class="tweet-card">' +
            '<span class="tweet-num">TWEET ' + (i + 1) + ' / ' + thread.tweets.length + '</span>' +
            '<div>' + formatTweetText(tweet) + '</div>' +
        '</div>'
    ).join('');

    const shareText = encodeURIComponent('🧵 ' + thread.title + '\n\nRead full thread:');
    const shareUrl = encodeURIComponent(window.location.href);
    document.getElementById('twitterShareBtn').href =
        'https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl;
}

function renderRelated(threads, currentId) {
    const related = threads.filter(t => t.id !== currentId).slice(0, 2);
    const grid = document.getElementById('relatedThreads');
    if (!grid) return;

    grid.innerHTML = related.map(t =>
        '<a href="thread.html?id=' + t.id + '" class="thread-card">' +
            '<span class="thread-tag">' + t.tag + '</span>' +
            '<h3 class="thread-title">' + t.title + '</h3>' +
            '<p class="thread-excerpt">' + t.excerpt + '</p>' +
            '<div class="thread-meta">' +
                '<span>📖 ' + t.readTime + '</span>' +
            '</div>' +
        '</a>'
    ).join('');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.btn-share');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
        setTimeout(() => {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy link';
        }, 2000);
    });
}

async function init() {
    const threadId = getThreadId();
    if (!threadId) { window.location.href = '/'; return; }

    const data = await loadData();
    if (!data) return;

    const thread = data.threads.find(t => t.id === threadId);
    if (!thread) {
        window.location.href = '/';
        return;
    }

    renderThread(thread);
    renderRelated(data.threads, threadId);
}

document.addEventListener('DOMContentLoaded', init);
