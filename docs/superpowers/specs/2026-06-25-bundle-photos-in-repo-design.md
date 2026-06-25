# Design: Bundle site photos in the repository

**Date:** 2026-06-25
**Status:** Approved design (pending user review)
**Topic:** Serve the Hero carousel and Mídia → Fotos images from the repository instead of Firebase Storage.

> Supersedes the earlier Firebase-Storage hosting spec (removed). The decision was reversed: photos are now bundled
> in the repo.

## Problem

The Hero carousel ([`Hero.jsx`](../../../src/components/Hero.jsx)) and the Mídia → Fotos gallery
([`Midia.jsx`](../../../src/components/Midia.jsx)) build image URLs that point at Firebase Storage, but the files
aren't reliably hosted there, so the images don't render. We want these photos to live in the git repository and be
served as ordinary static assets.

Today three components each carry an identical private helper:

```js
const FIREBASE_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/'
function getImageUrl(path) {
  return `${FIREBASE_STORAGE_BASE}${encodeURIComponent(path)}?alt=media`
}
```

The content data (live Firebase Realtime DB, mirrored offline in
[`websiteFallback.json`](../../../src/data/websiteFallback.json)) stores each image as a relative `src`, e.g.
`home/FB_IMG_1526579537656.jpg` or `fotos/album1/FB_IMG_1526582851926.jpg`. Those relative paths map cleanly onto a
local `public/` folder, so no data changes are needed.

## Decision

Add one shared helper, `src/utils/imageUrl.js`, that resolves a data `src` to a **local** URL under the site base
path, and use it from Hero and Midia:

```js
export function getImageUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}
```

Place the referenced image files in `public/` mirroring the exact `src` paths (`public/home/…`,
`public/fotos/albumN/…`). Vite serves `public/` at the site root in dev and copies it into `dist/` on build, so a
`src` of `home/x.jpg` resolves to `/home/x.jpg`.

Titles and all other content continue to come from the Firebase Realtime DB (authoritative); this change touches only
how image files are located, not the data.

## Scope

In scope:

1. Extract the **14 referenced** Hero `home/` photos and the **9** `fotos/` photos from this repo's git history
   (commit `cb6e57f`) into `public/home/` and `public/fotos/albumN/`.
2. Add `src/utils/imageUrl.js` with the local `getImageUrl(path)` helper.
3. Refactor `Hero.jsx` and `Midia.jsx` to import that helper and delete their inline `FIREBASE_STORAGE_BASE` +
   `getImageUrl` copies.
4. Verify the Hero carousel and all 3 Fotos albums render from the bundled files; build and tests pass.

Out of scope (explicitly unchanged):

- **Hippussuit** — its image (`4A525824-…jpg`) is not in git history and the user is ignoring it for now.
  [`Hippussuit.jsx`](../../../src/components/Hippussuit.jsx) keeps its own Firebase-Storage `getImageUrl` and is left
  untouched. This means Hippussuit temporarily diverges from Hero/Midia (still points at Firebase). Accepted.
- **Historia** — currently renders no image; left exactly as-is. No historia files are bundled.
- **Titles / data** — no edits to the DB or `websiteFallback.json`; `src` paths already match the `public/` layout.
- The **2 unreferenced** files in the original `home/` folder (`FB_IMG_1526579047329.jpg`,
  `FB_IMG_1526582851926.jpg`) are not copied — only files the data references are bundled.
- `contato/` icons — already served locally from `public/contato/`; unchanged.

## Files to bundle

Extracted from commit `cb6e57f` (`src/resources/images/…`) via `git show cb6e57f:<path> > public/<path>`.

### Hero — `public/home/` (14 files, from data keys `home.foto1…fotoz14`)

```
FB_IMG_1526579537656.jpg  FB_IMG_1526579797013.jpg  FB_IMG_1526579813114.jpg
FB_IMG_1526579880959.jpg  FB_IMG_1526579932897.jpg  FB_IMG_1526579963187.jpg
FB_IMG_1526579991299.jpg  FB_IMG_1526580011702.jpg  FB_IMG_1526580019545.jpg
FB_IMG_1526580085053.jpg  FB_IMG_1526580223761.jpg  FB_IMG_1526580449757.jpg
FB_IMG_1526579791775.jpg  FB_IMG_1526583032060.jpg
```

### Fotos — `public/fotos/albumN/` (9 files)

| Album | File |
| --- | --- |
| album1 | `FB_IMG_1526582851926.jpg` |
| album1 | `FB_IMG_1526579797013.jpg` |
| album1 | `FB_IMG_1526579813114.jpg` |
| album2 | `FB_IMG_1526579880959.jpg` |
| album2 | `FB_IMG_1526579932897.jpg` |
| album2 | `FB_IMG_1526579963187.jpg` |
| album3 | `FB_IMG_1526579991299.jpg` |
| album3 | `FB_IMG_1526580011702.jpg` |
| album3 | `FB_IMG_1526580019545.jpg` |

Total: 23 files, ~1.6 MB. (`public/` is not gitignored, so these are committed.)

## Resolution mechanics

- The shared helper concatenates `import.meta.env.BASE_URL` (default `/`) with the relative `src`. Unlike the Firebase
  helper, it does **not** percent-encode the path — slashes must stay as path separators, and all filenames here are
  URL-safe (`FB_IMG_*.jpg`).
- Using `BASE_URL` keeps the app correct if the site is ever deployed under a sub-path.

## Verification

1. `npm run dev` — Hero background carousel cycles through the home photos; Mídia → Fotos shows 3 albums, 3 thumbnails
   each, all loaded from `/home/…` and `/fotos/…` (check the Network tab shows local requests, not
   `firebasestorage.googleapis.com`).
2. Lightbox still opens, navigates (next/prev/keyboard), and closes.
3. `npm run build` succeeds and `dist/` contains the `home/` and `fotos/` folders.
4. `npm test` passes (existing Contato/fetchData tests; add a small unit test for `getImageUrl` if practical).
5. Hippussuit section is visually unchanged from its current state (still Firebase-backed).

## Risks

- **Base-path assumption** — if deployed under a sub-path without Vite `base` set, root-absolute URLs could break.
  Mitigated by using `import.meta.env.BASE_URL` rather than a hard-coded `/`.
- **Hippussuit divergence** — Hippussuit still depends on Firebase Storage and may remain broken until its image is
  sourced. Called out as out of scope, not a regression introduced here.
- **Stale Firebase references** — after this change, the `projetoliberdade-afe28` Storage bucket is no longer used by
  Hero/Midia; that's expected, not an error.
