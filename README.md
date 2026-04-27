# Medistat

A React dashboard for exploring Swedish prescription drug dispensing trends across regions, age bands, and gender, covering 2006–2024.

**Live demo:** https://medistat.tiberiusgh.com

## What this is

Medistat turns the Swedish National Board of Health and Welfare's prescription dataset into an interactive dashboard. You pick a drug (by ATC code or name), optionally narrow it down by region, year, gender, or age band, and the dashboard rebuilds itself around that selection — KPI cards, trend lines, an age × gender heatmap, a choropleth map of Sweden, and a regional ranking, all wired together so the active filters propagate everywhere.

## What I built

The frontend is a single-page React 19 + TypeScript app, styled with Tailwind v4 and HeroUI v3 components. There is no charting library — every visualization is hand-built with SVG and [d3-geo](https://github.com/d3/d3-geo) for the map projection.

### Features

- **Omni-search command palette** — one search bar that accepts drugs and regions, turns matches into filter chips, and reshapes the dashboard based on which dimensions are active.
- **KPI cards** with year-over-year deltas, comparisons against the national average, and contextual tooltips (Total Patients, Dispensings per 1,000, Chronic Use Ratio).
- **Dispensing trend chart** — national vs regional line chart over 19 years, with a clickable year axis that drives every other chart.
- **Age band sparklines** — one mini line per age group, plus bars for the selected year.
- **Demographic heatmap** — age × gender intensity grid, the highest-signal view for spotting "this drug is mostly prescribed to women in their 50s" at a glance.
- **Choropleth map of Sweden** — D3-projected SVG, with hover/click linked to a sortable regional ranking list.
- **Gender gap chart** — mirrored bars showing per-1000 dispensing by gender across years.
- **Drug info card** — pulls substance information from external sources for the selected ATC code.
- **Saved medications sidebar** — keep a working set of drugs to switch between without re-searching.
- **GitHub OAuth login** with PKCE, JWT in `localStorage`, and decoded user context propagated via React context.

### Architecture notes

- **Hooks-first state** — [`useDashboard`](src/hooks/useDashboard.ts) is the single source of dashboard state; it composes smaller hooks ([`useDashboardInsights`](src/hooks/useDashboardInsights.ts), [`useDrugInsights`](src/hooks/useDrugInsights.ts), [`useFilters`](src/hooks/useFilters.ts), etc.) so [`Dashboard.tsx`](src/components/Dashboard.tsx) stays purely presentational.
- **GraphQL client** — a tiny custom client in [`src/lib/graphql.ts`](src/lib/graphql.ts) with all queries colocated in [`src/lib/queries.ts`](src/lib/queries.ts). No Apollo, no urql.
- **PKCE auth flow** — verifier/challenge generated in [`src/lib/pkce.ts`](src/lib/pkce.ts), exchanged through the backend in [`src/App.tsx`](src/App.tsx).
- **Containerized build** — multi-stage [Dockerfile](Dockerfile) builds the Vite bundle and serves it from nginx with a custom [nginx.conf](nginx.conf) for SPA routing.
- **SEO + social previews** — Open Graph and Twitter card meta tags wired up in [index.html](index.html).

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- HeroUI v3 (beta)
- d3-geo for map projection
- ESLint with `typescript-eslint` and React hooks rules
- nginx + Docker for production serving

## Data sources

- Prescription data: Swedish National Board of Health and Welfare, exposed through a separate backend.
- Region geometry: [Sveriges län](https://www.dataportal.se/en/datasets/197_4312) via dataportal.se.
- Substance information: RxNav and MedlinePlus.
