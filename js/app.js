// ============================================
// ChiperFlux Hub — App Logic (Dashboard)
// ============================================

const DATA_URL = 'data/site.json';

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.querySelector('.hamburger');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Share profile
function shareProfile() {
    const url = window.location.origin;
    const text = '⚡ Check out ChiperFlux — Web3 x NFT x AI\n\nCrypto alpha, airdrop guides & trading insights:';
    if (navigator.share) {
        navigator.share({ title: 'ChiperFlux', text, url });
    } else {
        navigator.clipboard.writeText(text + '\n' + url).then(() => {
            showToast('📋 Link copied!');
        });
    }
}

// Toast notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#fff;color:#000;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:fadeInUp 0.3s;box-shadow:0 8px 32px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

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
            el.textContent = price + ' ' + arrow + changeStr + '%';
            el.className = 'ticker-price ' + (change >= 0 ? 'up' : 'down');
        }

        // Update market grid
        renderMarket(data);
        
        // Update trending
        const trending = document.getElementById('trending');
        if (trending) {
            const sorted = Object.entries(data).sort((a, b) => b[1].usd_24h_change - a[1].usd_24h_change);
            trending.textContent = sorted.slice(0, 3).map(([k]) => k.replace('bitcoin','BTC').replace('ethereum','ETH').replace('solana','SOL').replace('binancecoin','BNB').replace('hyperliquid','HYPE')).join(', ');
        }
        
        // Update signals
        const signals = document.getElementById('signals');
        if (signals) {
            const avgChange = Object.values(data).reduce((sum, c) => sum + c.usd_24h_change, 0) / 5;
            signals.textContent = avgChange > 1 ? '🟢 Bullish' : avgChange < -1 ? '🔴 Bearish' : '🟡 Neutral';
        }
        
        // Update last update time
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    } catch (e) {
        console.warn('Price fetch failed:', e);
    }
}

// Render market grid
function renderMarket(data) {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;
    
    const coins = [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
        { id: 'solana', symbol: 'SOL', name: 'Solana' },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
        { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' }
    ];
    
    grid.innerHTML = coins.map(coin => {
        const d = data[coin.id];
        if (!d) return '';
        const price = d.usd >= 1000 
            ? '$' + d.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
            : '$' + d.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const change = d.usd_24h_change;
        const changeClass = change >= 0 ? 'up' : 'down';
        const arrow = change >= 0 ? '▲' : '▼';
        return '<div class="market-item">' +
            '<div class="market-left">' +
                '<span class="market-symbol">' + coin.symbol + '</span>' +
                '<span class="market-name">' + coin.name + '</span>' +
            '</div>' +
            '<div class="market-right">' +
                '<div class="market-price">' + price + '</div>' +
                '<div class="market-change ' + changeClass + '">' + arrow + ' ' + Math.abs(change).toFixed(1) + '%</div>' +
            '</div>' +
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
    if (diff < 7) return diff + 'd ago';
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
}

// Render links
function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = links.map(l => 
        '<a href="' + l.url + '" target="_blank" rel="noopener" class="link-card animate-in">' +
            '<span class="link-icon">' + l.icon + '</span>' +
            '<div class="link-content">' +
                '<div class="link-title">' + l.title + '</div>' +
                '<div class="link-desc">' + l.description + '</div>' +
            '</div>' +
            '<span class="link-arrow">→</span>' +
        '</a>'
    ).join('');
}

// Render threads
function renderThreads(threads) {
    const grid = document.getElementById('threadsGrid');
    grid.innerHTML = threads.map(t => 
        '<a href="thread.html?id=' + t.id + '" class="thread-card animate-in">' +
            '<div class="thread-header">' +
                '<span class="thread-tag">' + t.tag + '</span>' +
                '<span class="thread-date">' + formatDate(t.date) + '</span>' +
                '<span class="thread-read-time">📖 ' + t.readTime + '</span>' +
            '</div>' +
            '<h3 class="thread-title">' + t.title + '</h3>' +
            '<p class="thread-excerpt">' + t.excerpt + '</p>' +
            '<div class="thread-footer">' +
                '<span class="thread-read-btn">Read Thread →</span>' +
                '<span class="thread-share-btn" onclick="event.preventDefault(); event.stopPropagation(); shareThread(\'' + t.id + '\', \'' + t.title.replace(/'/g, "\\'") + '\')">📤</span>' +
            '</div>' +
        '</a>'
    ).join('');
}

// Share thread
function shareThread(id, title) {
    const url = window.location.origin + '/thread.html?id=' + id;
    const text = '🧵 ' + title + '\n\nRead full thread:';
    if (navigator.share) {
        navigator.share({ title, text, url });
    } else {
        navigator.clipboard.writeText(text + '\n' + url).then(() => {
            showToast('📋 Link copied!');
        });
    }
}

// Sidebar navigation
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.dataset.section;
            if (section === 'threads') {
                document.getElementById('section-threads').scrollIntoView({ behavior: 'smooth' });
            } else if (section === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            toggleSidebar();
        });
    });
});

// Init
async function init() {
    fetchPrices();
    setInterval(fetchPrices, 60000);

    const data = await loadData();
    if (!data) {
        document.querySelector('.container').innerHTML = 
            '<div style="text-align:center;padding:100px 20px;">' +
                '<h2 style="font-size:48px;margin-bottom:16px">⚠️</h2>' +
                '<h3>Failed to load data</h3>' +
                '<p style="color:#8888aa;margin-top:8px">Try refreshing the page</p>' +
            '</div>';
        return;
    }

    renderProfile(data.profile);
    renderLinks(data.links);
    renderThreads(data.threads);
    document.getElementById('threadCount').textContent = data.threads.length;
}

document.addEventListener('DOMContentLoaded', init);
