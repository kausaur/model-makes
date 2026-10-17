# 🧊 Model Makes

A static e-commerce website for showcasing and selling 3D-printed models. No backend needed — runs entirely on HTML, CSS, and vanilla JavaScript.

## Quick Start

### View the Storefront
```bash
# Option 1: Python (built-in)
cd model-makes
python -m http.server 3000 --directory public

# Option 2: Node.js
npx http-server ./public -p 3000

# Then open http://localhost:3000
```

### Use the Admin Panel
1. Double-click `admin/admin.html` to open it in your browser
2. Import existing products or start fresh
3. Add, edit, or delete products with images/videos
4. Click **Export JSON** to download the updated `products.json`
5. Copy the exported file to `public/data/products.json`
6. Copy any new media files to `public/assets/images/` or `public/assets/videos/`
7. Commit and push — Render auto-deploys!

## Project Structure

```
model-makes/
├── public/                  ← DEPLOYED TO RENDER (static site root)
│   ├── index.html           ← Main storefront page
│   ├── css/
│   │   ├── base.css         ← Design system, variables, typography
│   │   ├── layout.css       ← Page layout, header, hero, footer
│   │   └── components.css   ← Cards, buttons, modals, cart
│   ├── js/
│   │   ├── app.js           ← Main entry point
│   │   ├── products.js      ← Product catalog rendering & filtering
│   │   ├── cart.js           ← Shopping cart (localStorage)
│   │   ├── lightbox.js      ← Image/video lightbox viewer
│   │   └── theme.js         ← Dark/light mode toggle
│   ├── data/
│   │   └── products.json    ← Product catalog data
│   └── assets/
│       ├── images/          ← Product images (SVG/WebP/PNG)
│       └── videos/          ← Product videos (MP4/WebM)
│
├── admin/                   ← LOCAL ONLY — never deployed
│   ├── admin.html           ← Admin dashboard
│   ├── admin.js             ← CRUD logic, import/export
│   └── admin.css            ← Admin panel styles
│
└── README.md
```

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Static Site
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory**: `public`
   - **Build Command**: _(leave empty)_
   - **Publish Directory**: `.`
5. Deploy — your site is live!

### Updating Products
1. Open `admin/admin.html` locally
2. Make changes → Export JSON
3. Replace `public/data/products.json`
4. `git commit` + `git push`
5. Render auto-deploys in ~30 seconds

## Features

- **Dark/Light Mode** — System-aware with manual toggle
- **Product Catalog** — JSON-driven, filterable by category
- **Image Galleries** — Multi-image carousel per product
- **Media Lightbox** — Full-screen viewer for images and videos
- **Shopping Cart** — Persistent via localStorage
- **WhatsApp Ordering** — Auto-generates order message
- **Responsive** — Works on mobile, tablet, and desktop
- **Admin Panel** — Local-only CRUD tool for products

## Tech Stack

- HTML5 + CSS3 + Vanilla JavaScript (ES Modules)
- Zero dependencies, zero build step
- Google Fonts: Space Grotesk, Inter, JetBrains Mono
