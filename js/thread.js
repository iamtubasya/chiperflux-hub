1|// ============================================
2|// ChiperFlux — Thread Page Logic (Premium)
3|// ============================================
4|
5|const DATA_URL = 'data/site.json';
6|
7|async function loadData() {
8|    try {
9|        const res = await fetch(DATA_URL);
10|        return await res.json();
11|    } catch (e) {
12|        console.error('Failed to load data:', e);
13|        return null;
14|    }
15|}
16|
17|function getThreadId() {
18|    return new URLSearchParams(window.location.search).get('id');
19|}
20|
21|function formatDate(str) {
22|    return new Date(str).toLocaleDateString('en-US', {
23|        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
24|    });
25|}
26|
27|function formatTweetText(text) {
28|    return text
29|        .replace(/(#\w+)/g, '<span style="color:#00ffaa">$1</span>')
30|        .replace(/(@\w+)/g, '<span style="color:#00ffcc">$1</span>')
31|        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#00ffaa">$1</a>')
32|        .replace(/\n/g, '<br>');
33|}
34|
35|function renderThread(thread) {
36|    document.title = `${thread.title} — ChiperFlux`;
37|    document.getElementById('threadTitle').textContent = thread.title;
38|    document.getElementById('threadTag').textContent = thread.tag;
39|    document.getElementById('threadDate').textContent = formatDate(thread.date);
40|    document.getElementById('threadReadTime').textContent = `📖 ${thread.readTime}`;
41|
42|    const metaDesc = document.querySelector('meta[name="description"]');
43|    if (metaDesc) metaDesc.content = thread.excerpt;
44|
45|    const tweetList = document.getElementById('tweetList');
46|    tweetList.innerHTML = thread.tweets.map((tweet, i) => `
47|        <div class="tweet-card animate-in">
48|            <span class="tweet-number">TWEET ${i + 1} / ${thread.tweets.length}</span>
49|            <div>${formatTweetText(tweet)}</div>
50|        </div>
51|    `).join('');
52|
53|    const shareText = encodeURIComponent(`🧵 ${thread.title}\n\nRead full thread:`);
54|    const shareUrl = encodeURIComponent(window.location.href);
55|    document.getElementById('twitterShareBtn').href =
56|        `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
57|}
58|
59|function renderRelated(threads, currentId) {
60|    const related = threads.filter(t => t.id !== currentId).slice(0, 3);
61|    const grid = document.getElementById('relatedThreads');
62|    grid.innerHTML = related.map(t => `
63|        <a href="thread.html?id=${t.id}" class="thread-card animate-in">
64|            <div class="thread-header">
65|                <span class="thread-tag">${t.tag}</span>
66|                <span class="thread-date">${t.readTime}</span>
67|            </div>
68|            <h3 class="thread-title">${t.title}</h3>
69|            <p class="thread-excerpt">${t.excerpt}</p>
70|        </a>
71|    `).join('');
72|}
73|
74|function copyLink() {
75|    navigator.clipboard.writeText(window.location.href).then(() => {
76|        const toast = document.createElement('div');
77|        toast.textContent = '📋 Link copied!';
78|        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00ff88;color:#000;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:fadeInUp 0.3s;box-shadow:0 8px 32px rgba(0,255,136,0.4)';
79|        document.body.appendChild(toast);
80|        setTimeout(() => toast.remove(), 2000);
81|    });
82|}
83|
84|async function init() {
85|    const threadId = getThreadId();
86|    if (!threadId) { window.location.href = '/'; return; }
87|
88|    const data = await loadData();
89|    if (!data) {
90|        document.querySelector('.thread-page').innerHTML = `
91|            <div style="text-align:center;padding:100px 20px;">
92|                <h2 style="font-size:48px;margin-bottom:16px">⚠️</h2>
93|                <h3>Failed to load data</h3>
94|                <a href="/" class="btn btn-primary" style="margin-top:16px">← Back</a>
95|            </div>
96|        `;
97|        return;
98|    }
99|
100|    const thread = data.threads.find(t => t.id === threadId);
101|    if (!thread) {
102|        document.querySelector('.thread-page').innerHTML = `
103|            <div style="text-align:center;padding:100px 20px;">
104|                <h2 style="font-size:48px;margin-bottom:16px">🔍</h2>
105|                <h3>Thread not found</h3>
106|                <a href="/" class="btn btn-primary" style="margin-top:16px">← Back</a>
107|            </div>
108|        `;
109|        return;
110|    }
111|
112|    renderThread(thread);
113|    renderRelated(data.threads, threadId);
114|}
115|
116|document.addEventListener('DOMContentLoaded', init);
117|