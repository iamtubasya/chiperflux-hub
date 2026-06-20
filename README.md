# 🎖️ C h i p e r F l u x Hub

Link-in-bio + Twitter Thread Hub untuk @Chiperflux

## 🚀 Features

- **Profile Card** — Bio, stats, dan avatar
- **Quick Links** — Twitter, Telegram, GitHub
- **Thread Library** — Semua thread tersimpan permanen
- **Share** — Copy link atau share langsung ke Twitter
- **Dark Theme** — Crypto vibes
- **Mobile Responsive** — Perfect di HP
- **Fast Loading** — Static site, no framework

## 📁 Structure

```
chiperflux-hub/
├── index.html          # Halaman utama
├── thread.html         # Detail thread
├── css/
│   └── style.css       # Styling
├── js/
│   ├── app.js          # Main page logic
│   └── thread.js       # Thread page logic
├── data/
│   └── site.json       # Data threads & links
└── vercel.json         # Vercel config
```

## 🛠️ Tambah Thread Baru

Edit `data/site.json`, tambah object baru di array `threads`:

```json
{
    "id": "thread-baru",
    "title": "Judul Thread",
    "excerpt": "Deskripsi pendek",
    "date": "2026-06-20",
    "tag": "🏷️ Tag",
    "readTime": "5 min",
    "tweets": [
        "Tweet 1...",
        "Tweet 2...",
        "Tweet 3..."
    ]
}
```

## 🚀 Deploy ke Vercel

1. Push ke GitHub
2. Connect ke Vercel (vercel.com)
3. Auto-deploy setiap push

## 📱 Live

**chiperflux.vercel.app**

---

Built with ❤️ by @Chiperflux | Powered by CACAMINE 🔥
