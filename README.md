# 🕹️ Alex Largo — 8-bit Portfolio

An interactive, retro-game styled portfolio for **Alex Largo**, Fullstack Developer.
Built as a love letter to 8-bit games: pixel fonts, CRT scanlines, a running dog,
collectible coins, a Konami easter egg and a tiny jump mini-game — all while staying
a fast, accessible, bilingual marketing site.

**Live:** _deploys on Vercel_ · **Languages:** 🇪🇸 ES / 🇬🇧 EN

---

## ✨ Features

- **8-bit "kraft" theme** — pixel fonts (`Press Start 2P`, `VT323`), CRT overlay, hard-shadow panels.
- **Fully data-driven** — every section reads from typed data files in `src/data/`. Add 1 or 100 projects; the UI adapts.
- **i18n (ES/EN)** with [`next-intl`](https://next-intl.dev) — UI strings in `messages/`, content is bilingual in the data layer.
- **Arcade layer** — running dog, day/night cycle, collectible coins, retro sound (opt-in), and a discoverable Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) with an on-screen hint + mobile D-pad.
- **Mini-game** — a Chrome-dino-style jump game starring the dog.
- **Working contact form** — React Server Action + [Resend](https://resend.com), with validation and a honeypot.
- **Responsive** everywhere and respects `prefers-reduced-motion`.

## 🧱 Tech stack

| Area      | Choice                                   |
| --------- | ---------------------------------------- |
| Framework | Next.js 16 (App Router) + Turbopack      |
| Language  | TypeScript                               |
| Styling   | Tailwind CSS v4 + a small design system  |
| i18n      | next-intl                                |
| Email     | Resend (Server Action)                   |
| Hosting   | Vercel                                   |

## 🚀 Getting started

```bash
pnpm install
cp .env.example .env.local   # add your Resend key (optional in dev)
pnpm dev                     # http://localhost:3000
```

## 🗂️ Editing the content (no code required)

Everything lives in `src/data/` — strings are `{ es, en }` objects:

- `profile.ts` — name, role, summary, socials, stats.
- `skills.ts` — skill categories & tools.
- `projects.ts` — projects ("quests"); add/remove freely.
- `experience.ts` — career timeline ("levels").

UI labels (buttons, section titles) live in `messages/es.json` and `messages/en.json`.

## ✉️ Contact form

The form posts to a Server Action (`src/app/actions/contact.ts`). To send real email,
create a free key at [resend.com](https://resend.com) and set:

```env
RESEND_API_KEY=...
CONTACT_TO=alexlar163@gmail.com
```

Without a key the UI still validates and degrades gracefully.

## 📦 Scripts

```bash
pnpm dev      # dev server
pnpm build    # production build
pnpm start    # run the build
pnpm lint     # eslint
```

## 🎨 Credits

Animal sprites in `public/sprites/` are placeholders — swap them for CC0 assets
(e.g. [Kenney.nl](https://kenney.nl)) before going fully public.

---

Built with Next.js, TypeScript and lots of pixels. 🤖
