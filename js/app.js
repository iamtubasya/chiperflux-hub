// ============================================
// ChiperFlux Hub — App Logic (Premium)
// ============================================

const DATA_URL = 'data/site.json';

// CoinGecko price fetcher
async function fetchPrices() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,hyperliquid&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        const coins = {
            'btc-price': data.bitcoin,
            'eth-price': data.ethereum,
            'sol-price': data.solana,
            'bnb-price': data.binancecoin,
            'hype-price': data.hyperliquid
        };

        for (const [id, coin] of Object.entries(coins)) {
            const el = document.getElementById(id);
            if (!el || !coin) continue;
            const price = coin.usd >= 1000 
                ? '$' + coin.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
                : '$' + coin.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const change = coin.usd_24h_change;
            const arrow = change >= 0 ? '▲' : '▼';
            const changeStr = Math.abs(change).toFixed(1);
            el.textContent = `${price} ${arrow}${changeStr}%`;
            el.className = 'ticker-price ' + (change >= 0 ? 'up' : 'down');
        }
    } catch (e) {
        console.warn('Price fetch failed:', e);
    }
}

// Load site data
async function loadData() {
    try {
        const res = await fetch(DATA_URL);
        return await res.json();
    } catch (e) {
        console.error('Failed to load data:', e);
        return null;
    }
}

// Format number
function formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

// Format date
function formatDate(str) {
    const d = new Date(str);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// Render profile
function renderProfile(p) {
    document.getElementById('name').textContent = p.name;
    document.getElementById('handle').textContent = p.handle;
    document.getElementById('bio').textContent = p.bio;
    document.getElementById('followers').textContent = formatNumber(p.stats.followers);
    document.getElementById('following').textContent = formatNumber(p.stats.following);
    document.getElementById('threadCount').textContent = p.stats.threads;

    const initials = p.name.split(' ').filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('avatar').textContent = initials;
}

// Render links
function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = links.map((l, i) => `
        <a href="${l.url}" target="_blank" rel="noopener" class="link-card animate-in">
            <span class="link-icon">${l.icon}</span>
            <div class="link-content">
                <div class="link-title">${l.title}</div>
                <div class="link-desc">${l.description}</div>
            </div>
            <span class="link-arrow">→</span>
        </a>
    `).join('');
}

// Render threads
function renderThreads(threads) {
    const grid = document.getElementById('threadsGrid');
    grid.innerHTML = threads.map((t, i) => `
        <a href="thread.html?id=${t.id}" class="thread-card animate-in">
            <div class="thread-header">
                <span class="thread-tag">${t.tag}</span>
                <span class="thread-date">${formatDate(t.date)}</span>
                <span class="thread-read-time">📖 ${t.readTime}</span>
            </div>
            <h3 class="thread-title">${t.title}</h3>
            <p class="thread-excerpt">${t.excerpt}</p>
            <div class="thread-footer">
                <span class="thread-read-btn">Read Thread →</span>
                <span class="thread-share-btn" onclick="event.preventDefault(); event.stopPropagation(); shareThread('${t.id}', '${t.title.replace(/'/g, "\\'")}')">📤</span>
            </div>
        </a>
    `).join('');
}

// Share
function shareThread(id, title) {
    const url = `${window.location.origin}/thread.html?id=${id}`;
    const text = `🧵 ${title}\n\nRead full thread:`;
    if (navigator.share) {
        navigator.share({ title, text, url });
    } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            const toast = document.createElement('div');
            toast.textContent = '📋 Link copied!';
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00ff88;color:#000;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:fadeInUp 0.3s;box-shadow:0 8px 32px rgba(0,255,136,0.4)';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        });
    }
}

// Init
async function init() {
    fetchPrices();
    setInterval(fetchPrices, 60000);

    const data = await loadData();
    if (!data) {
        document.querySelector('.container').innerHTML = `
            <div style="text-align:center;padding:100px 20px;">
                <h2 style="font-size:48px;margin-bottom:16px">⚠️</h2>
                <h3>Failed to load data</h3>
                <p style="color:#8888aa;margin-top:8px">Try refreshing the page</p>
            </div>
        `;
        return;
    }

    renderProfile(data.profile);
    renderLinks(data.links);
    renderThreads(data.threads);
    document.getElementById('threadCount').textContent = data.threads.length;
}

document.addEventListener('DOMContentLoaded', init);
