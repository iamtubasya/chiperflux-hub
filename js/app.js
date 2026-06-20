1|// ============================================
2|// ChiperFlux Hub — App Logic (Premium)
3|// ============================================
4|
5|const DATA_URL = 'data/site.json';
6|
7|// CoinGecko price fetcher
8|async function fetchPrices() {
9|    try {
10|        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,hyperliquid&vs_currencies=usd&include_24hr_change=true');
11|        const data = await res.json();
12|        
13|        const coins = {
14|            'btc-price': data.bitcoin,
15|            'eth-price': data.ethereum,
16|            'sol-price': data.solana,
17|            'bnb-price': data.binancecoin,
18|            'hype-price': data.hyperliquid
19|        };
20|
21|        for (const [id, coin] of Object.entries(coins)) {
22|            const el = document.getElementById(id);
23|            if (!el || !coin) continue;
24|            const price = coin.usd >= 1000 
25|                ? '$' + coin.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })
26|                : '$' + coin.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
27|            const change = coin.usd_24h_change;
28|            const arrow = change >= 0 ? '▲' : '▼';
29|            const changeStr = Math.abs(change).toFixed(1);
30|            el.textContent = `${price} ${arrow}${changeStr}%`;
31|            el.className = 'ticker-price ' + (change >= 0 ? 'up' : 'down');
32|        }
33|    } catch (e) {
34|        console.warn('Price fetch failed:', e);
35|    }
36|}
37|
38|// Load site data
39|async function loadData() {
40|    try {
41|        const res = await fetch(DATA_URL);
42|        return await res.json();
43|    } catch (e) {
44|        console.error('Failed to load data:', e);
45|        return null;
46|    }
47|}
48|
49|// Format number
50|function formatNumber(n) {
51|    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
52|    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
53|    return n.toString();
54|}
55|
56|// Format date
57|function formatDate(str) {
58|    const d = new Date(str);
59|    const now = new Date();
60|    const diff = Math.floor((now - d) / 86400000);
61|    if (diff === 0) return 'Today';
62|    if (diff === 1) return 'Yesterday';
63|    if (diff < 7) return `${diff}d ago`;
64|    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
65|}
66|
67|// Render profile
68|function renderProfile(p) {
69|    document.getElementById('name').textContent = p.name;
70|    document.getElementById('handle').textContent = p.handle;
71|    document.getElementById('bio').textContent = p.bio;
72|    document.getElementById('followers').textContent = formatNumber(p.stats.followers);
73|    document.getElementById('following').textContent = formatNumber(p.stats.following);
74|    document.getElementById('threadCount').textContent = p.stats.threads;
75|
76|    const initials = p.name.split(' ').filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join('').toUpperCase();
77|    document.getElementById('avatar').textContent = initials;
78|}
79|
80|// Render links
81|function renderLinks(links) {
82|    const grid = document.getElementById('linksGrid');
83|    grid.innerHTML = links.map((l, i) => `
84|        <a href="${l.url}" target="_blank" rel="noopener" class="link-card animate-in">
85|            <span class="link-icon">${l.icon}</span>
86|            <div class="link-content">
87|                <div class="link-title">${l.title}</div>
88|                <div class="link-desc">${l.description}</div>
89|            </div>
90|            <span class="link-arrow">→</span>
91|        </a>
92|    `).join('');
93|}
94|
95|// Render threads
96|function renderThreads(threads) {
97|    const grid = document.getElementById('threadsGrid');
98|    grid.innerHTML = threads.map((t, i) => `
99|        <a href="thread.html?id=${t.id}" class="thread-card animate-in">
100|            <div class="thread-header">
101|                <span class="thread-tag">${t.tag}</span>
102|                <span class="thread-date">${formatDate(t.date)}</span>
103|                <span class="thread-read-time">📖 ${t.readTime}</span>
104|            </div>
105|            <h3 class="thread-title">${t.title}</h3>
106|            <p class="thread-excerpt">${t.excerpt}</p>
107|            <div class="thread-footer">
108|                <span class="thread-read-btn">Read Thread →</span>
109|                <span class="thread-share-btn" onclick="event.preventDefault(); event.stopPropagation(); shareThread('${t.id}', '${t.title.replace(/'/g, "\\'")}')">📤</span>
110|            </div>
111|        </a>
112|    `).join('');
113|}
114|
115|// Share
116|function shareThread(id, title) {
117|    const url = `${window.location.origin}/thread.html?id=${id}`;
118|    const text = `🧵 ${title}\n\nRead full thread:`;
119|    if (navigator.share) {
120|        navigator.share({ title, text, url });
121|    } else {
122|        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
123|            const toast = document.createElement('div');
124|            toast.textContent = '📋 Link copied!';
125|            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00ff88;color:#000;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:fadeInUp 0.3s;box-shadow:0 8px 32px rgba(0,255,136,0.4)';
126|            document.body.appendChild(toast);
127|            setTimeout(() => toast.remove(), 2000);
128|        });
129|    }
130|}
131|
132|// Init
133|async function init() {
134|    fetchPrices();
135|    setInterval(fetchPrices, 60000);
136|
137|    const data = await loadData();
138|    if (!data) {
139|        document.querySelector('.container').innerHTML = `
140|            <div style="text-align:center;padding:100px 20px;">
141|                <h2 style="font-size:48px;margin-bottom:16px">⚠️</h2>
142|                <h3>Failed to load data</h3>
143|                <p style="color:#8888aa;margin-top:8px">Try refreshing the page</p>
144|            </div>
145|        `;
146|        return;
147|    }
148|
149|    renderProfile(data.profile);
150|    renderLinks(data.links);
151|    renderThreads(data.threads);
152|    document.getElementById('threadCount').textContent = data.threads.length;
153|}
154|
155|document.addEventListener('DOMContentLoaded', init);
156|