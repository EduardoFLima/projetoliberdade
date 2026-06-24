# Design: Introduce Fotos via Firebase Storage

**Date:** 2026-06-24
**Status:** Approved design (pending user review)
**Topic:** Make the Mídia → Fotos albums render by hosting the photos in Firebase Storage.

## Problem

The Mídia → Fotos tab is wired up in [`Midia.jsx`](../../../src/components/Midia.jsx) but shows no images, because the
photo files the data references have never been placed in Firebase Storage.

The Firebase Realtime DB `fotos` node (and its offline mirror,
[`websiteFallback.json`](../../../src/data/websiteFallback.json)) already lists 3 albums of 3 photos each, with
`src` paths like `fotos/album1/FB_IMG_1526582851926.jpg`. At render time
[`getImageUrl()`](../../../src/components/Midia.jsx) turns each `src` into a tokenless Firebase Storage download URL:

```
https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/<encoded path>?alt=media
```

So the only thing missing is the actual files in the bucket (plus real-ish album titles).

## Decision

Keep the existing architecture. Host the photos in **Firebase Storage** at the exact paths the data already
references, rather than bundling them in the repository. This matches how the other image-bearing sections work
(the Hero `home/` carousel uses the same `getImageUrl` + Storage pattern) and keeps the Firebase Realtime DB as the
single source of truth, consistent with the rest of the site content.

Rejected alternatives:

- **Bundle in the repo** as static assets — simpler for a small, dev-managed set, but it contradicts "Firebase is
  authoritative" and would carve the Fotos section into a different model than every other section.
- **Hybrid (bundle in repo but keep Firebase-shaped paths)** — same divergence, with two image conventions in one
  codebase.

## Scope

In scope:

1. Extract the 9 original photos from this repo's git history into a ready-to-upload local folder.
2. User manually uploads those 9 files to Firebase Storage, preserving the `fotos/albumN/<file>.jpg` paths.
3. Confirm public read access so the tokenless `?alt=media` URLs resolve.
4. Replace placeholder album titles with generic ones (`Álbum 1`, `Álbum 2`, `Álbum 3`) in the Firebase Realtime DB
   `fotos` node (authoritative) and mirror the change in `websiteFallback.json`.
5. Verify the Fotos tab renders all 3 albums and the lightbox works.

Out of scope:

- No changes to the gallery/lightbox UI in `Midia.jsx`.
- Not consolidating the duplicated `getImageUrl` helper (present in Hero, Hippussuit, Midia). Noted as a future
  cleanup, intentionally excluded here to keep this change focused.
- Per-photo titles — the gallery only renders the album cover title (`capa.titulo`), so individual `foto*.titulo`
  values are left as-is (they are not displayed).

## Source of the files

The 9 originals live in git history at commit `cb6e57f` ("Projeto Liberdade - first version") under
`src/resources/images/fotos/`. They are extracted with `git show cb6e57f:<path>` — no need to clone the old project
or re-download anything.

| Album | Storage path | File |
| --- | --- | --- |
| album1 | `fotos/album1/` | `FB_IMG_1526582851926.jpg` |
| album1 | `fotos/album1/` | `FB_IMG_1526579797013.jpg` |
| album1 | `fotos/album1/` | `FB_IMG_1526579813114.jpg` |
| album2 | `fotos/album2/` | `FB_IMG_1526579880959.jpg` |
| album2 | `fotos/album2/` | `FB_IMG_1526579932897.jpg` |
| album2 | `fotos/album2/` | `FB_IMG_1526579963187.jpg` |
| album3 | `fotos/album3/` | `FB_IMG_1526579991299.jpg` |
| album3 | `fotos/album3/` | `FB_IMG_1526580011702.jpg` |
| album3 | `fotos/album3/` | `FB_IMG_1526580019545.jpg` |

Total: 9 files, ~511 KB. The cover (`capa.src`) of each album points at the album's first file, which is included
above.

## Hosting details

- **Bucket:** `projetoliberdade-afe28.appspot.com`.
- **Paths:** must match the data exactly, e.g. `fotos/album1/FB_IMG_1526582851926.jpg`. The Firebase Console "Create
  folder" flow (`fotos` → `album1` …) reproduces these paths.
- **Public read:** the app uses `?alt=media` with no download token, so the objects must be publicly readable. This is
  the same access the existing Hero `home/` photos depend on. Verification step below confirms it; if a 403 occurs,
  the Storage security rules need `allow read` on the `fotos/**` path (or the objects made public).

## Data changes

The repo-side change is limited to `websiteFallback.json`: set the three album cover titles to generic values.

| Album | Current `capa.titulo` | New `capa.titulo` |
| --- | --- | --- |
| album1 | `Titulo album 11` | `Álbum 1` |
| album2 | `Festa Junina` | `Álbum 2` |
| album3 | `Titulo album 3` | `Álbum 3` |

The same three titles must be set in the Firebase Realtime DB `fotos.albumList.*.capa.titulo` fields, since the DB is
authoritative in production. All `src` paths are already correct and remain unchanged.

## Verification

1. Upload complete: all 9 objects visible in the Firebase Console under `fotos/album1|2|3/`.
2. Each download URL resolves publicly — opening
   `https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/fotos%2Falbum1%2FFB_IMG_1526582851926.jpg?alt=media`
   in a browser returns the image (not a 403/404).
3. Run the site (`npm run dev`); the Mídia → Fotos tab shows 3 albums titled `Álbum 1/2/3`, each with 3 thumbnails.
4. Clicking a thumbnail opens the lightbox; next/prev/close and keyboard navigation work.
5. Existing tests still pass (`npm test`).

## Risks

- **Public-read not configured** → images 403. Mitigation: verification step 2 catches it before declaring done; fix via
  Storage rules.
- **Path/filename mismatch on upload** (e.g., wrong casing, missing subfolder) → broken thumbnail. Mitigation: the
  exact path table above and verification step 3.
- **DB vs fallback drift** — production reads the DB, so titles must be updated in both places. Called out explicitly in
  Data changes.
