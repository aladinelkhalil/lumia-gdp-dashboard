## US GDP Dashboard (Vite + React + TS)

Setup

```bash
npm install
npm run dev
```

Environment

```
VITE_HERMES_BASE_URL=https://hermes.pyth.network
VITE_PYTH_GDP_FEED_ID=<pyth_feed_id>
```

Notes

- Single `lib` folder (no `src`).
- Tailwind for styling, Recharts for charts, axios for API calls.
- If `VITE_PYTH_GDP_FEED_ID` is empty, charts render mock data.
