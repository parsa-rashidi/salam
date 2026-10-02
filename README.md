# سلام · Salaam

**A clickable UI prototype** for a location-based search & booking platform for beauty and barber
services — in the salon *and* at the customer's location.

> سامانهٔ هوشمند جست‌وجو و رزرو خدمات آرایشی در سالن و محل مشتری

This repository is an **interactive front-end prototype only**. Every screen is wired to
in-memory mock data so the flows can be clicked through end to end. There is intentionally
**no backend, no database, no auth and no payment** — nothing leaves the browser.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server on `0.0.0.0:3000`          |
| `npm run build`     | Production build (33 routes)          |
| `npm start`         | Serve the production build            |
| `npm run typecheck` | `tsc --noEmit` — currently clean      |
| `npm run lint`      | ESLint (flat config, `next/core-web-vitals`) — currently clean |

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — design tokens declared in `@theme` inside `src/app/globals.css`
- **Leaflet + OpenStreetMap** — no API key required
- **lucide-react** icons, **Vazirmatn** (Persian) + **Inter** (Latin) typefaces
- Charts are hand-rolled SVG/CSS (`src/components/ui/chart.tsx`) — no chart dependency

## Bilingual & RTL

Everything is bilingual **Persian / English** with a live switcher in the header
(and in both panel top bars).

- Persian renders **RTL**, English renders **LTR**; `<html lang dir>` is flipped at runtime.
- Digits follow the locale: `۴۵۰٬۰۰۰` vs `450,000`.
- Dates convert to the **Jalali (Shamsi)** calendar in Persian, with the Iranian week
  starting on **Saturday** (`src/lib/jalali.ts`, `src/lib/format.ts`).
- Translations live in one flat dictionary: `src/i18n/dictionary.ts`
  (`fa as const` is the source of truth, `en` is type-checked against it).
- Preferences persist to `localStorage` **and** cookies so the first server render is correct.

## Accessibility / senior mode

A global **"senior mode"** toggle (sun icon) enlarges type to 118% and adds `.senior-mode`
to `<html>`. It is a first-class feature of the brief, not an afterthought:

- `/accessibility` explains it and lists senior-friendly stylists.
- Booking supports **reserving on behalf of someone else** (parent, spouse, client…),
  **sharing the appointment with a companion**, and structured **mobility / hearing / vision notes**
  that travel with the request to the stylist.

---

## Routes

### Customer

| Route                  | Screen                                                                    |
| ---------------------- | ------------------------------------------------------------------------- |
| `/`                    | Landing: hero, live map preview, value props, categories, how-it-works     |
| `/explore`             | Split-view search: filter panel + result list + Leaflet map                |
| `/providers/[id]`      | Stylist profile: portfolio, price list, reviews, working hours, map        |
| `/book/[id]`           | 5-step booking wizard (services → mode/address → time → beneficiary → confirm) |
| `/deals`               | Flash deals, sorted by distance & countdown, with a map overlay            |
| `/bookings`            | My appointments, grouped upcoming / past                                   |
| `/bookings/[id]`       | Appointment detail: status hero, timeline, map, cost breakdown, actions    |
| `/favorites`           | Saved stylists                                                             |
| `/login`               | Mock phone + OTP sign-in (demo code `12345`) → choose customer or stylist  |
| `/accessibility`       | Senior mode explainer + live preview + suitable stylists                   |

### Stylist panel — `/provider`

| Route                    | Screen                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| `/provider`              | Dashboard: today's schedule, KPIs, new requests, active deals        |
| `/provider/requests`     | Booking **requests** with accept / propose-time / decline flows      |
| `/provider/calendar`     | Week & day grid; block, unblock and bulk-generate slots              |
| `/provider/services`     | Price list CRUD grouped by category, with at-home surcharge          |
| `/provider/deals`        | Flash-deal manager: active / scheduled / ended, boost tiers          |
| `/provider/deals/new`    | Deal builder with **live preview** of the card and the map radius    |
| `/provider/portfolio`    | Portfolio gallery + upload & moderation states                       |
| `/provider/reviews`      | Rating summary, review list, reply box, report action                |
| `/provider/customers`    | Customer book: visits, spend, cancellations, no-shows                |
| `/provider/settings`     | Profile, modes, **draggable map pin**, radius, travel zones, hours, verification |

### Admin panel — `/admin`

| Route                     | Screen                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| `/admin`                  | KPIs, trends, revenue mix, home-vs-salon split, approval queue, activity feed |
| `/admin/providers`        | **Approve / reject stylists** with document & ID verification checks |
| `/admin/users`            | User directory with role, status, search, block / unblock         |
| `/admin/blocked`          | Blocked accounts with reasons                                     |
| `/admin/bookings`         | All bookings, commission per row, detail modal                    |
| `/admin/reports`          | Moderation queue: hide / show content, warn user, resolve         |
| `/admin/content`          | Portfolio, review and legal-page moderation                       |
| `/admin/categories`       | Service categories: reorder, rename, activate                     |
| `/admin/cities`           | City rollout: activate, district & provider counts, add city      |
| `/admin/deals`            | Platform-wide flash-deal oversight, manual deactivation           |
| `/admin/revenue`          | Revenue by model, rate editor and a live **revenue simulator**    |
| `/admin/notifications`    | Broadcast composer with audience/city targeting + notification feed |
| `/admin/settings`         | Commission, subscription, cancellation rules, privacy, maintenance mode |

Both panels ship their own chrome (dark sidebar + sticky top bar); the public site header and
footer hide themselves on `/provider*` and `/admin*`.

---

## What the prototype demonstrates

**Requests, not a fixed calendar.** Customers send a *request*; the stylist accepts, proposes a
different time, or declines with a reason. Every status from the brief is modelled:
`آزاد / درخواست‌شده / در انتظار تأیید / تأییدشده / ردشده / لغوشده / انجام‌شده / عدم مراجعه`.

**Salon vs. at-home.** Mode drives surcharge, travel fee by distance zone, address capture and
privacy. The customer's **exact address stays hidden until the stylist confirms**.

**Flash deals for empty slots.** Service, original price, deal price, date/time, validity window,
capacity and a **visibility radius** on the map. Deals auto-deactivate once the last slot is booked.

**Seniors & limited mobility.** Book for someone else, share with a companion, structured care
notes, senior-friendly badges, simplified large-type mode.

**Trust & safety.** Verification badges, masked phone numbers, content moderation queue,
report flow, blocking, and a privacy rule enforced in the UI.

---

## Project layout

```
src/
  app/                33 routes (customer, /provider/**, /admin/**)
  components/
    ui/               buttons, fields, modal, tabs, toast, rating, charts, …
    layout/           site header, footer, mobile tab bar, logo
    map/              providers-map.tsx, location-picker.tsx (Leaflet, SSR-disabled)
    customer/         provider card, deal card, filter panel, portfolio, reviews, booking card
    landing/          hero, map preview, landing sections
  i18n/               dictionary.ts (fa/en) + provider.tsx (locale, RTL, senior mode)
  lib/                format.ts, jalali.ts, queries.ts (filters/sort/slots), mock-data.ts
  store/              app-store.tsx — all client-side state (bookings, deals, requests, …)
  types.ts            domain model
public/images/        generated placeholder photography
```

`src/lib/mock-data.ts` is the single source of truth for the demo: 12 stylists around Tehran,
20 services, 6 flash deals, 12 reviews, 5 appointments, 6 incoming requests, a 7-day calendar,
plus the admin datasets (pending approvals, users, reports, cities, revenue, activity).

---

## Prototype boundaries

- All state is client-side and resets on reload.
- Sign-in is mocked; the demo OTP code is **`12345`**.
- Money is in **Toman** and never charged anywhere.
- Map tiles come from OpenStreetMap; coordinates are fictional but geographically plausible
  (Tehran, centred on `35.7805, 51.4215`).
- One portfolio image (`public/images/portfolio/at-home.jpg`) is referenced by the mock data but
  not present; `SmartImage` renders a graceful placeholder for it.
