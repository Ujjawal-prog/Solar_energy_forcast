# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Microgrid dashboard (`/grid`)

Frontend for the HackSphere 3.0 microgrid challenge, added on top of SkyCheck.

- `src/pages/Grid.jsx` is the page; widgets live in `src/components/grid/`.
- `src/grid/controller.js` holds the switching rules (160 kW / 18:00-22:00 / 200 kW), CSV cleaning and the outage maths.
- `src/grid/fakeForecast.json` is the sample data shown on first load.
- `src/api/grid.js` calls the forecast backend when `VITE_GRID_API_URL` is set. Otherwise a stand-in model runs in the browser.

Expected API contract:

```
POST VITE_GRID_API_URL
{ "rows": [ { "timestamp": "2024-01-01 00:00:00", "ambient_temp_c": 28.1, "humidity_pct": 66, "solar_irradiance_wm2": 0 }, ... x24 ] }

200 -> { "forecast": [ { "timestamp": "...", "predicted_demand_kw": 125.2 }, ... ] }
```

`grid_mode`, `overload` and `battery_soc_pct` are optional per row. If missing, the dashboard computes them from the rules in the problem statement.
