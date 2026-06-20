// ============================================
// ChiperFlux — App Logic (zyloo.io style)
// ============================================

const DATA_URL = 'data/site.json';

// Mobile nav toggle
function toggleNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('mobileMenu');
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
}

// Fetch prices from CoinGecko
async function fetchPrices() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,hyperliquid&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();

        const coins = [
            { id: 'bitcoin', symbol: 'BTC' },
            { id: 'ethereum', symbol: 'ETH' },
            { id: 'solana', symbol: 'SOL' },
            { id: 'binancecoin', symbol: 'BNB' },
            { id: 'hyperliquid', symbol: 'HYPE' }
        ];

        // Update live index in hero card
        coins.forEach(coin => {
            const d = data[coin.id];
            if (!d) return;

            const priceEl = document.getElementById('idx-' + coin.symbol.toLowerCase());
            const changeEl = document.getElementById('idx-' + coin.symbol.toLowerCase() + '-change');

            if (priceEl) {
                priceEl.textContent = d.usd >= 1000
                    ? '$' + d.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    : '$' + d.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            if (changeEl) {
                const change = d.usd_24h_change;
                const arrow = change >= 0 ? '↑' : '↓';
                changeEl.textContent = arrow + Math.abs(change).toFixed(0) + '%';
                changeEl.className = 'index-change ' + (change >= 0 ? 'up' : 'down');
            }
        });

        // Update market table
        renderMarket(data, coins);

    } catch (e) {
        console.warn('Price fetch failed:', e);
    }
}

// Render market table
function renderMarket(data, coins) {
    const container = document.getElementById('marketRows');
    if (!container) return;

    container.innerHTML = coins.map((coin, i) => {
        const d = data[coin.id];
        if (!d) return '';

        const price = d.usd >= 1000
            ? '$' + d.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
            : '$' + d.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const change = d.usd_24h_change;
        const changeClass = change >= 0 ? 'up' : 'down';
        const arrow = change >= 0 ? '↑' : '↓';

        return '<div class="market-row">' +
            '<span class="market-rank">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<div class="market-info">' +
                '<span class="market-symbol">' + coin.symbol + '</span>' +
                '<span class="market-name">' + coin.id.charAt(0).toUpperCase() + coin.id.slice(1) + '</span>' +
            '</div>' +
            '<span class="market-price">' + price + '</span>' +
            '<span class="market-change ' + changeClass + '">' + arrow + Math.abs(change).toFixed(1) + '%</span>' +
        '</div>';
    }).join('');
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

// Format date
function formatDate(str) {
    const d = new Date(str);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return diff + 'd ago';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// Render threads
function renderThreads(threads) {
    const grid = document.getElementById('threadsGrid');
    if (!grid) return;

    grid.innerHTML = threads.map(t =>
        '<a href="thread.html?id=' + t.id + '" class="thread-card">' +
            '<span class="thread-tag">' + t.tag + '</span>' +
            '<h3 class="thread-title">' + t.title + '</h3>' +
            '<p class="thread-excerpt">' + t.excerpt + '</p>' +
            '<div class="thread-meta">' +
                '<span>📖 ' + t.readTime + '</span>' +
                '<span>' + formatDate(t.date) + '</span>' +
            '</div>' +
        '</a>'
    ).join('');
}

// Render links
function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    if (!grid) return;

    grid.innerHTML = links.map(l =>
        '<a href="' + l.url + '" target="_blank" rel="noopener" class="connect-card">' +
            '<span class="connect-icon">' + l.icon + '</span>' +
            '<div class="connect-info">' +
                '<div class="connect-title">' + l.title + '</div>' +
                '<div class="connect-desc">' + l.description + '</div>' +
            '</div>' +
            '<span class="connect-arrow">→</span>' +
        '</a>'
    ).join('');
}

// Init
async function init() {
    fetchPrices();
    setInterval(fetchPrices, 60000);

    const data = await loadData();
    if (!data) return;

    // Update stats
    const followersEl = document.getElementById('followers');
    const followingEl = document.getElementById('following');
    const threadCountEl = document.getElementById('threadCount');

    if (followersEl) followersEl.textContent = data.profile.stats.followers;
    if (followingEl) followingEl.textContent = data.profile.stats.following;
    if (threadCountEl) threadCountEl.textContent = data.threads.length;

    renderThreads(data.threads);
    renderLinks(data.links);
}

document.addEventListener('DOMContentLoaded', init);
