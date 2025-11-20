# Copilot / AI Agent Instructions for this repository

This file contains concise, actionable guidance for code-writing AI agents working on this repo.

**Project Summary**
- React + Vite TypeScript single-page app located at the repository root.
- UI is component-driven under `components/` and `App.tsx` centralizes app state and handlers.
- Backend integration is via Supabase (`supabaseClient.ts`). Authentication, profiles, cards and favorites are stored in Supabase tables.
- The project uses the `@google/genai` package for AI features and expects a Gemini API key (`GEMINI_API_KEY`) for AI services.

**Important files to read before editing**
- `App.tsx` — application entry, central state (auth, cards, favorites), and most Supabase interactions.
- `supabaseClient.ts` — Supabase client config; env vars: `SUPABASE_URL`, `SUPABASE_KEY` (anon key).
- `components/` — UI building blocks. Notable components: `LoginScreen.tsx`, `HomeScreen.tsx`, `AdminModal.tsx`, `AICardGenerator.tsx`, `AIQuizModal.tsx`.
- `types.ts` and `constants.ts` — project types and category constants used across components.
- `package.json` — dev scripts: `npm run dev`, `npm run build`, `npm run preview`.

**Big-picture architecture & data flow**
- Single-page app: `index.tsx` mounts `<App />`. `App.tsx` handles auth lifecycle and fetches data from Supabase on sign-in.
- Auth flow: `supabase.auth.getSession()` at startup and `supabase.auth.onAuthStateChange` listener in `App.tsx` — follow this pattern when adding auth-sensitive features.
- Database reads/writes: performed directly in the frontend via the `supabase` client. Typical pattern in `App.tsx`:

```ts
// read
const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false });

// write
await supabase.from('cards').insert(payload);
```

- Mapping: Supabase uses snake_case DB columns while frontend expects camelCase. See `fetchCards` in `App.tsx` where `image_url` -> `imageUrl` and `background_color` -> `backgroundColor`.
- Roles: user roles are stored in `profiles.role`. `Role.ADMIN` gates admin UI (modals, add/update/delete card handlers).

**Project-specific conventions & patterns**
- Central state in `App.tsx`: prefer adding new global handlers there and pass callbacks as props to `HomeScreen` rather than duplicating Supabase logic inside components.
- Naming: DB fields use snake_case; TS types and component props use camelCase. Always convert between them at the boundary (see `fetchCards` mapping).
- Theme persistence: theme is stored under `localStorage` key `kpss-theme` and controlled in `App.tsx`.
- Admin-only actions: check `currentUser?.role === Role.ADMIN` before rendering admin UI or executing DB mutations.

**Environment & secrets**
- Required env vars: `GEMINI_API_KEY` (for `@google/genai`), `SUPABASE_URL`, `SUPABASE_KEY` (anon/public key). Local dev uses `.env.local` per README.
- `supabaseClient.ts` includes fallback values — do not commit secrets when changing these. Prefer adding to `.env.local` or CI secrets.

**Build / dev / run**
- Install: `npm install`
- Dev server: `npm run dev` (Vite)
- Build for production: `npm run build` and preview with `npm run preview`.

**How to add features safely (checklist for agents)**
- Read `App.tsx` and `supabaseClient.ts` to understand current Supabase usage before creating new DB queries.
- Preserve snake_case ↔ camelCase conversion on DB boundaries.
- If adding AI calls, use `@google/genai` and require `GEMINI_API_KEY`; keep keys out of source.
- For UI changes, prefer composing existing components in `components/` and follow existing Tailwind-like utility classes.
- When modifying auth flows, ensure `supabase.auth.onAuthStateChange` handling and session initialization logic remains intact.

**Examples / snippets taken from the repo**
- Auth listener (from `App.tsx`):

```ts
const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) { /* fetch profile, cards, favorites */ }
  else if (event === 'SIGNED_OUT') { /* clear state */ }
});
```

- DB mapping example (from `fetchCards`):

```ts
const mappedCards: Card[] = (data || []).map((item: any) => ({
  id: item.id,
  category: item.category,
  text: item.text,
  imageUrl: item.image_url,
  backgroundColor: item.background_color,
  created_at: item.created_at
}));
```

**Where to check for related logic when changing behavior**
- `App.tsx` — main handlers and state.
- `components/HomeScreen.tsx` — category UI, modals and admin buttons.
- `components/*Modal.tsx` — admin forms (`AdminModal.tsx`, `AICardGenerator.tsx`) implement card creation/update UX.
- `supabaseClient.ts` — confirm correct env var usage.

---
If any section is unclear or you want more examples (e.g., adding a new table, or wiring a new AI endpoint), tell me which area to expand and I will iterate.
