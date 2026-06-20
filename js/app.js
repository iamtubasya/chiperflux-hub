// ============================================
// C h i p e r F l u x Hub — App Logic
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

// Format number
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Render profile
function renderProfile(profile) {
    document.getElementById('name').textContent = profile.name;
    document.getElementById('handle').textContent = profile.handle;
    document.getElementById('bio').textContent = profile.bio;
    document.getElementById('followers').textContent = formatNumber(profile.stats.followers);
    document.getElementById('following').textContent = formatNumber(profile.stats.following);
    document.getElementById('threadCount').textContent = profile.stats.threads;
    
    // Avatar initials
    const initials = profile.name.split(' ')
        .filter(w => w.length > 0)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    document.getElementById('avatar').textContent = initials;
}

// Render links
function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = links.map((link, i) => `
        <a href="${link.url}" target="_blank" rel="noopener" class="link-card animate-in">
            <span class="link-icon">${link.icon}</span>
            <div class="link-content">
                <div class="link-title">${link.title}</div>
                <div class="link-desc">${link.description}</div>
            </div>
            <span class="link-arrow">→</span>
        </a>
    `).join('');
}

// Render threads
function renderThreads(threads) {
    const grid = document.getElementById('threadsGrid');
    grid.innerHTML = threads.map((thread, i) => `
        <a href="thread.html?id=${thread.id}" class="thread-card animate-in">
            <div class="thread-header">
                <span class="thread-tag">${thread.tag}</span>
                <span class="thread-date">${formatDate(thread.date)}</span>
                <span class="thread-read-time">📖 ${thread.readTime}</span>
            </div>
            <h3 class="thread-title">${thread.title}</h3>
            <p class="thread-excerpt">${thread.excerpt}</p>
            <div class="thread-footer">
                <span class="thread-read-btn">Read Thread →</span>
                <span class="thread-share-btn" onclick="event.preventDefault(); shareThread('${thread.id}', '${thread.title}')">📤</span>
            </div>
        </a>
    `).join('');
}

// Share thread
function shareThread(id, title) {
    const url = `${window.location.origin}/thread.html?id=${id}`;
    const text = `🧵 ${title}\n\nRead full thread:`;
    
    if (navigator.share) {
        navigator.share({ title, text, url });
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            alert('Link copied! 📋');
        });
    }
}

// Init
async function init() {
    const data = await loadData();
    if (!data) {
        document.querySelector('.container').innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <h2>⚠️ Failed to load data</h2>
                <p style="color:#a1a1aa; margin-top:8px;">Try refreshing the page</p>
            </div>
        `;
        return;
    }
    
    renderProfile(data.profile);
    renderLinks(data.links);
    renderThreads(data.threads);
    
    // Update thread count
    document.getElementById('threadCount').textContent = data.threads.length;
}

// Run
document.addEventListener('DOMContentLoaded', init);
