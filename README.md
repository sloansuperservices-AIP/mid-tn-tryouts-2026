# 🏐 Mid TN Tryouts 2026

**Mid Tennessee Volleyball Club** — Murfreesboro, TN  
Tryout management app for the 2025–2026 season.

---

## What This Is

A self-contained single-file web app for running volleyball tryouts.  
No build step. No dependencies to install. Open the HTML file and go.

---

## Modules

| Station | Description |
|---|---|
| ✅ Sign In | Athlete check-in, walkup registration |
| 📏 Physical (S1) | Height, reach, vertical measurements |
| ⏱ Agility (S2) | Shuttle run timer |
| 🏐 Drill Score | Skill scoring (1–10) |
| 📋 Head Coach | Depth chart, team assignments, email/offer tools |

---

## Usage

1. Open `tryouts/index.html` in a browser
2. Staff login → runs sign-in, physical, agility, drill stations
3. Head coach login → views all athletes, builds depth chart, assigns teams

### Walkup Mode
Append `?mode=walkup` to the URL for a simplified athlete self-registration screen.

---

## Deployment

Hosted via GitHub Pages at:  
`https://sloansuperservices-aip.github.io/mid-tn-tryouts-2026/tryouts/`

---

## Stack

- [Preact](https://preactjs.com/) 10.x (via CDN)
- [htm](https://github.com/developit/htm) 3.x (no JSX build step)
- Vanilla CSS — dark athletic theme, amber `#f0a500` accent
- Zero build tools — single HTML file

---

## Notes

- Athlete data is stored in `localStorage` — persists across page refreshes
- Multi-tab sync via `storage` event listener
- All data is local/browser-only; no backend or API calls

---

*Mid TN VBC · Est. 1995 · midtnvbc.com*
