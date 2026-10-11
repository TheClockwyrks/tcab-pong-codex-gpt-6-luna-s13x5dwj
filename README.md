# Carom

Carom is a browser paddle duel built around spin and bank shots. Curve the ball with paddle movement, route it around the paired gold obstacles, and race to match point against the reactive Solo AI or another local player.

## Install and run

```sh
npm ci
npm run dev
```

Vite prints the local development URL. To make the static production site:

```sh
npm run build
```

The complete site is written to `dist/`; serve that directory from the root of any static host.

## Controls

- **Solo:** `W` / `S` moves your left paddle. The AI defends the right.
- **Versus:** `W` / `S` controls the left paddle; `↑` / `↓` controls the right.
- `Enter` or `Space` selects. `↑` / `↓` also navigates menus.
- `P` or `Escape` pauses/resumes. `M` toggles sound.
- Menus also support pointer and touch selection.

First to 11 points wins, with a two point lead required. Move a paddle as it strikes to add spin.
