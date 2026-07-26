# Settings and Localization — Functional Documentation

The Settings page at `/settings` lets the user switch between English and Arabic instantly.

- No reload or rebuild is required.
- English uses left-to-right layout.
- Arabic uses right-to-left layout and mirrors navigation and directional spacing.
- The selected language is remembered on the current device.
- On the first visit, the browser language is used when it is Arabic; otherwise English is used.

Only the language code is stored locally. No sensitive or task data is stored in `localStorage`.
