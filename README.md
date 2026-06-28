# Projeto Liberdade

Single-page institutional website for **Projeto Liberdade**, a Brazilian
equine-therapy and rehabilitation project. The site presents the project's history, mission, services,
the *Hippussuit* program, a media gallery, and contact information.

Content is loaded at runtime from a **Firebase Realtime Database**, with a bundled JSON snapshot used as
a fallback when the network request fails — so the page always renders, even offline.

## Table of Contents

- [Architecture](#architecture)
- [Tooling](#tooling)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Content Model](#content-model)
- [Project Structure](#project-structure)
- [License](#license)

## Architecture

The app is a client-rendered React SPA. On mount, `App` calls `fetchData()`, which tries the Firebase
endpoint and falls back to `src/data/websiteFallback.json` on any error. The resulting object is sliced
by section and passed down to presentational components.

## Tooling

- **React 19** — UI library
- **Vite 8** — dev server and build tool
- **Tailwind CSS 4** — styling, via the `@tailwindcss/vite` plugin
- **Vitest 4** + **Testing Library** + **jsdom** — component and unit tests
- **oxlint** — linting

## Prerequisites

- **Node.js** 18+ and **npm**

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server (Vite, with HMR):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Testing

Tests run with Vitest in a jsdom environment (configured in `vite.config.js`):

```bash
npm test
```

## Content Model

`fetchData()` returns a single object whose top-level keys map to page sections:

| Key          | Section                     |
| ------------ | --------------------------- |
| `home`       | Hero                        |
| `historia`   | Project history             |
| `missao`     | Mission, vision, and values |
| `servicos`   | Services                    |
| `hippussuit` | Hippussuit program          |
| `fotos`      | Photo gallery (Mídia)       |
| `videos`     | Video gallery (Mídia)       |
| `contato`    | Contact information         |

The remote source is the Firebase Realtime Database URL defined in `src/utils/fetchData.js`. The local
fallback lives in `src/data/websiteFallback.json`.

## Project Structure

```
src/
  main.jsx              App entry point
  App.jsx               Loads data and composes the page sections
  index.css             Tailwind entry + global styles
  components/           Section components (Header, Hero, Historia, ...)
  utils/
    fetchData.js        Firebase fetch with local fallback
    imageUrl.js         Resolves asset paths against the Vite base URL
  data/
    websiteFallback.json  Offline content snapshot
  assets/               Logo and hero/program images
  test/setup.js         Testing Library / jest-dom setup
public/                 Static images (home, fotos, contato) and icons
```

## License

See [LICENSE.MD](./LICENSE.MD).
</content>
