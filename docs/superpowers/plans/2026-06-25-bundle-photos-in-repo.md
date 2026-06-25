# Bundle Site Photos in the Repository — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the Hero carousel and Mídia → Fotos images from bundled repository assets instead of Firebase Storage, via one shared local URL helper.

**Architecture:** Add a single `getImageUrl` helper that resolves a data `src` (e.g. `home/x.jpg`) to a local URL under `import.meta.env.BASE_URL`. Place the referenced image files in `public/` mirroring those exact paths so Vite serves them at the site root. Refactor Hero and Midia to use the helper. Hippussuit (Firebase) and Historia (no image) are left untouched.

**Tech Stack:** React 19, Vite 8, Vitest 4, @testing-library/react.

## Global Constraints

- Image `src` values in the content data are unchanged; `public/` paths must mirror them exactly (`home/<file>.jpg`, `fotos/albumN/<file>.jpg`).
- The helper uses `import.meta.env.BASE_URL` (not a hard-coded `/`) and does NOT percent-encode the path (slashes stay as separators).
- Only files referenced by the data are bundled — 14 `home/` files and 9 `fotos/` files (23 total).
- Do NOT modify `Hippussuit.jsx`, `Historia.jsx`, the Firebase Realtime DB, or `websiteFallback.json`.
- Source files are extracted from git commit `cb6e57f` under `src/resources/images/…`.
- Commit after each task.

---

### Task 1: Shared `getImageUrl` helper

**Files:**
- Create: `src/utils/imageUrl.js`
- Test: `src/utils/imageUrl.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `getImageUrl(path: string): string` — returns `` `${import.meta.env.BASE_URL}${path}` ``. Imported by Hero and Midia in Task 3.

- [ ] **Step 1: Write the failing test**

Create `src/utils/imageUrl.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getImageUrl } from './imageUrl'

describe('getImageUrl', () => {
  it('prefixes a top-level path with the Vite base URL', () => {
    expect(getImageUrl('home/FB_IMG_1.jpg')).toBe('/home/FB_IMG_1.jpg')
  })

  it('preserves nested album path separators (no percent-encoding)', () => {
    expect(getImageUrl('fotos/album1/FB_IMG_2.jpg')).toBe('/fotos/album1/FB_IMG_2.jpg')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/imageUrl.test.js`
Expected: FAIL — cannot resolve `./imageUrl` / `getImageUrl is not a function`.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/imageUrl.js`:

```js
export function getImageUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/utils/imageUrl.test.js`
Expected: PASS (2 passing). Note: Vitest sets `import.meta.env.BASE_URL` to `/`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/imageUrl.js src/utils/imageUrl.test.js
git commit -m "feat: add shared local getImageUrl helper"
```

---

### Task 2: Bundle referenced photos into `public/`

**Files:**
- Create: `public/home/` (14 `.jpg` files)
- Create: `public/fotos/album1/`, `public/fotos/album2/`, `public/fotos/album3/` (3 `.jpg` each)

**Interfaces:**
- Consumes: nothing.
- Produces: static files at the exact `public/` paths the data `src` values map to. Consumed at runtime by Hero/Midia after Task 3.

- [ ] **Step 1: Create destination folders**

Run:

```bash
mkdir -p public/home public/fotos/album1 public/fotos/album2 public/fotos/album3
```

- [ ] **Step 2: Extract the 14 Hero `home/` photos from git history**

Run:

```bash
for f in FB_IMG_1526579537656 FB_IMG_1526579797013 FB_IMG_1526579813114 \
         FB_IMG_1526579880959 FB_IMG_1526579932897 FB_IMG_1526579963187 \
         FB_IMG_1526579991299 FB_IMG_1526580011702 FB_IMG_1526580019545 \
         FB_IMG_1526580085053 FB_IMG_1526580223761 FB_IMG_1526580449757 \
         FB_IMG_1526579791775 FB_IMG_1526583032060; do
  git show "cb6e57f:src/resources/images/home/$f.jpg" > "public/home/$f.jpg"
done
```

- [ ] **Step 3: Extract the 9 Fotos photos from git history**

Run:

```bash
git show cb6e57f:src/resources/images/fotos/album1/FB_IMG_1526582851926.jpg > public/fotos/album1/FB_IMG_1526582851926.jpg
git show cb6e57f:src/resources/images/fotos/album1/FB_IMG_1526579797013.jpg > public/fotos/album1/FB_IMG_1526579797013.jpg
git show cb6e57f:src/resources/images/fotos/album1/FB_IMG_1526579813114.jpg > public/fotos/album1/FB_IMG_1526579813114.jpg
git show cb6e57f:src/resources/images/fotos/album2/FB_IMG_1526579880959.jpg > public/fotos/album2/FB_IMG_1526579880959.jpg
git show cb6e57f:src/resources/images/fotos/album2/FB_IMG_1526579932897.jpg > public/fotos/album2/FB_IMG_1526579932897.jpg
git show cb6e57f:src/resources/images/fotos/album2/FB_IMG_1526579963187.jpg > public/fotos/album2/FB_IMG_1526579963187.jpg
git show cb6e57f:src/resources/images/fotos/album3/FB_IMG_1526579991299.jpg > public/fotos/album3/FB_IMG_1526579991299.jpg
git show cb6e57f:src/resources/images/fotos/album3/FB_IMG_1526580011702.jpg > public/fotos/album3/FB_IMG_1526580011702.jpg
git show cb6e57f:src/resources/images/fotos/album3/FB_IMG_1526580019545.jpg > public/fotos/album3/FB_IMG_1526580019545.jpg
```

- [ ] **Step 4: Verify counts and integrity**

Run:

```bash
ls public/home/*.jpg | wc -l            # expect 14
find public/fotos -name '*.jpg' | wc -l # expect 9
file public/home/*.jpg public/fotos/album*/*.jpg | grep -vc 'JPEG image data' # expect 0
```

Expected: `14`, `9`, and `0` (every file is a valid JPEG, none empty/corrupt).

- [ ] **Step 5: Commit**

```bash
git add public/home public/fotos
git commit -m "feat: bundle Hero and Fotos photos as static assets"
```

---

### Task 3: Use the helper in Hero and Midia

**Files:**
- Modify: `src/components/Hero.jsx` (remove inline `FIREBASE_STORAGE_BASE` + `getImageUrl`, lines 4-8; add import)
- Modify: `src/components/Midia.jsx` (remove inline `FIREBASE_STORAGE_BASE` + `getImageUrl`, lines 3-7; add import)
- Test: `src/components/Midia.test.jsx` (new — integration check that fotos resolve to local paths)

**Interfaces:**
- Consumes: `getImageUrl` from `src/utils/imageUrl.js` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing integration test for Midia**

Create `src/components/Midia.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Midia from './Midia'

const fotos = {
  albumList: {
    album1: {
      capa: { titulo: 'Álbum 1', src: 'fotos/album1/FB_IMG_1526582851926.jpg' },
      fotos: {
        foto1: { src: 'fotos/album1/FB_IMG_1526582851926.jpg', titulo: 'foto 1' },
      },
    },
  },
}

describe('Midia fotos', () => {
  it('renders album thumbnails from local public paths, not Firebase', () => {
    render(<Midia fotos={fotos} videos={{}} />)
    const sources = screen.getAllByRole('img').map((img) => img.getAttribute('src'))
    expect(sources).toContain('/fotos/album1/FB_IMG_1526582851926.jpg')
    expect(sources.every((src) => !src.includes('firebasestorage'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/Midia.test.jsx`
Expected: FAIL — current `Midia.jsx` builds `https://firebasestorage.googleapis.com/...` URLs, so `/fotos/album1/...` is not found.

- [ ] **Step 3: Refactor `Midia.jsx` to use the shared helper**

In `src/components/Midia.jsx`, change the top of the file from:

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'

const FIREBASE_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/'

function getImageUrl(path) {
  return `${FIREBASE_STORAGE_BASE}${encodeURIComponent(path)}?alt=media`
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
```

to:

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { getImageUrl } from '../utils/imageUrl'

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
```

(Leave the rest of the file, including the `getImageUrl(f.src)` call site, unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/Midia.test.jsx`
Expected: PASS.

- [ ] **Step 5: Refactor `Hero.jsx` to use the shared helper**

In `src/components/Hero.jsx`, change the top of the file from:

```jsx
import { useState, useEffect, useCallback } from 'react'
import logo from '../assets/logo.png'

const FIREBASE_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/'

function getImageUrl(path) {
  return `${FIREBASE_STORAGE_BASE}${encodeURIComponent(path)}?alt=media`
}

export default function Hero({ data }) {
```

to:

```jsx
import { useState, useEffect, useCallback } from 'react'
import logo from '../assets/logo.png'
import { getImageUrl } from '../utils/imageUrl'

export default function Hero({ data }) {
```

(Leave the rest of the file, including the `getImageUrl(item.src)` call site, unchanged.)

- [ ] **Step 6: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: all tests pass (including the existing `Contato.test.jsx` and `fetchData.test.js`); lint reports no errors. Confirm `Hippussuit.jsx` still contains its own `getImageUrl` (Firebase) and was not modified.

- [ ] **Step 7: Verify the production build**

Run: `npm run build`
Expected: build succeeds; `dist/home/` and `dist/fotos/` exist (`ls dist/home/*.jpg | wc -l` → 14).

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.jsx src/components/Midia.jsx src/components/Midia.test.jsx
git commit -m "refactor: load Hero and Fotos images from bundled assets"
```

---

## Manual Verification (after Task 3)

1. `npm run dev` → Hero background carousel cycles the home photos; Mídia → Fotos shows the albums with thumbnails. In the Network tab, image requests go to `/home/…` and `/fotos/…`, not `firebasestorage.googleapis.com`.
2. Clicking a Fotos thumbnail opens the lightbox; next/prev/Escape/arrow keys work.
3. The Hippussuit section is unchanged (still Firebase-backed, may show no image — expected).
