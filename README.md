# Medistat — web

A single-page React + TypeScript app built with Vite, styled with Tailwind and shadcn. Everything revolves around one search bar: pick a drug, optionally narrow by region, and the dashboard reshapes around the selection. It shows trends over time, age and gender demographics, and a map of Sweden. The charts are a mix of custom SVG (d3) and ECharts.

Signed-in users can save their medications and switch between them without re-searching.

## How it's put together

- Dashboard state lives in hooks ([src/hooks/](src/hooks/)), so the components stay presentational.
- The GraphQL client is a small fetch wrapper in [src/lib/graphql.ts](src/lib/graphql.ts), with all queries colocated in [src/lib/queries.ts](src/lib/queries.ts). No Apollo.
- Login is OAuth with PKCE against GitHub and Google. The frontend runs the authorization flow, the backend completes the exchange and returns a JWT.
- The production image is built in two stages: the first builds the static bundle, the second serves it with nginx and a small config for SPA routing.

## CI/CD

Every push to `main` builds the Docker image, pushes it to GHCR, and POSTs to a webhook on the server that pulls the new image and restarts the container.

## Data sources

- Region geometry: [Sveriges län](https://www.dataportal.se/en/datasets/197_4312) via dataportal.se
- Substance information: RxNav and MedlinePlus

The prescription statistics come from the Medistat API, see the [`graphql`](https://github.com/Medistat-Tiberiusgh/graphql) repository.
