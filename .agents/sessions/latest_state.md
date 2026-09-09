# HafalanKu - Agent Session Context & State
**Last Updated:** Wed Sep 09 2026

## 📌 Project Overview
- **Name:** HafalanKu
- **URL:** `https://hafalanku.forapp.id`
- **Repo:** `hus3n/HafalanKu` (Main branch)
- **Tech Stack:** Next.js (App Router), TailwindCSS, TypeScript, Framer Motion for animations. Backend containers (Postgres, Redis, Mongo, Express/Node).
- **Deployment:** Managed via Coolify.
- **Docker Compose ID:** `h11u152o814w6bx18pyhp1or` (CRITICAL: Do not manually touch/stop the containers via CLI).

## ✅ What We Accomplished in This Session
1. **Container Revival:** Restarted previously stopped Coolify containers (`frontend`, `backend`, `postgres`, `redis`, `mongo`).
2. **Bug Fixes:** 
   - Fixed mapping error (`kelasiData?.kelas.map` to `kelasiData?.map`) in `/absensi` page.
   - Restored UI notification by mounting `<ToastProvider />` at root `layout.tsx`.
3. **UI/UX & Dashboard Improvements:**
   - Appended "Absensi Harian" for Ustadz/Admin and "Data Santri Global" + "Absensi Harian" for Superadmin in `QuickActionGrid.tsx`.
   - Upgraded grid structure to be responsive for 6 items (`grid-cols-2 sm:grid-cols-3 xl:grid-cols-6`).
   - Squeezed spacing (`gap-4 md:gap-5` & `gap-4 md:gap-6` with `max-w-6xl`) on Landing Page (`Features.tsx` & `Pricing.tsx`) to make cards cohere tighter.
4. **Advanced SEO Upgrades (Google Search Console Ready):**
   - Configured absolute Base URLs, standard tags, `robots.txt`, and `sitemap.ts`.
   - Built a dynamic OpenGraph Image generation via `next/og` (`opengraph-image.tsx`).
   - Injected `google-site-verification` into global `layout.tsx` metadata (`96kbXzz1KBySpd-ssTyVX3ATgRdcm3gFMe6LpKOJy_s`).
   - Added Rich Snippet JSON-LD for `SoftwareApplication` (`(landing)/layout.tsx`).
   - Added Rich Snippet JSON-LD for `FAQPage` inside `FAQ.tsx`.
   - Defined strict `canonical` URLs for `/`, `/privacy`, and `/terms` to prevent duplicate indexation.
5. **PWA updates:** 
   - Auto-regenerated and pushed updated `sw.js` (Service Worker cache).

## 🚀 Next Steps / Pending Actions
1. **Google Indexing:** User needs to manually verify ownership in GSC and submit `https://hafalanku.forapp.id/sitemap.xml`.
2. **Monitoring:** Await Google Crawl, fix any Rich Result errors if they appear on GSC.
3. **Database/Backend Next Steps:** (Depends on user request, but core frontend stability has been reached).

## 🔑 Crucial Notes for Next Agent
- All GitHub pushes are done explicitly using the PAT provided in `git config credential.helper '... '`.
- UI changes require maintaining Tailwind class conventions (e.g. `bg-card`, `border-border`, `text-foreground`).
- Icons predominantly use `lucide-react`. Animations use `motion/react` (Framer Motion).
- `next-pwa` handles offline caching, so always expect `sw.js` alterations after asset additions.
