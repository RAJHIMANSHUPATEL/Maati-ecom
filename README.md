# Maati website

Customer storefront (React + Vite). COD checkout only.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_URL` must point at the backend ecommerce API, e.g. `http://localhost:5001/api/ecommerce`.
`VITE_API_TOKEN` must match backend `API_TOKEN`.
For local seed images use `VITE_IMAGE_URL=http://localhost:5001/uploads/`.

Website demo login after `npm run seed` in the backend: `customer@greenfarm.test` / `Customer@123`.

## Build

```bash
npm run dev            # local API (Vite mode development)
npm run build:demo     # demo / portfolio API
npm run build          # production API
npm run preview
```

Vercel hosts this app. The API stays on Render (`https://maati-api.onrender.com`).

## Deploy (own GitHub repo, like the API)

Push **this folder** as the repo root (`package.json` at the top). Then:

1. [vercel.com](https://vercel.com) → Add New Project → import that repo.
2. Framework **Vite**. **Root Directory** empty (not `maati_retail_ecommerce`).
3. Env vars are already in `.env.production` / `.env.demo`. You can still set them in the dashboard:

```
VITE_API_URL=https://maati-api.onrender.com/api/ecommerce
VITE_API_TOKEN=cant_change
VITE_IMAGE_URL=https://res.cloudinary.com/vdm8qifg/image/upload/
```

4. Deploy. After you have the `*.vercel.app` URL, add it to Render `CORS_ORIGINS` (or keep `*.vercel.app`) and restart the API.

Website demo login: `customer@greenfarm.test` / `Customer@123`.
