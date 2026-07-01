# features

One folder per page/feature (home, historia, servicos, momentos, contato).
Each feature owns its route component and local pieces. Built in a later phase.

Rule: features read content ONLY via `useContent` / `ContentRepository`
(`src/content`). Never import `content.json` directly; never reference Firebase.
