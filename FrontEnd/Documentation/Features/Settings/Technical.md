# Settings and Localization — Technical Documentation

## Main files

- `core/services/language.service.ts`
- `core/services/document-title.service.ts`
- `features/settings/pages/settings-page/settings-page.component.ts`
- `assets/i18n/en.json`
- `assets/i18n/ar.json`

`LanguageService` resolves the initial language, starts the ngx-translate HTTP loader, updates its signal, and sets the document `lang` and `dir` attributes.

`DocumentTitleService` listens to both route navigation and language changes. Route data stores translation keys, so browser titles change at runtime.

## Adding translations

1. Add the same nested key to `en.json` and `ar.json`.
2. Reference the key through `TranslatePipe`; do not hardcode visible UI text.
3. Keep API values such as enum members untranslated.
4. Test both directions on mobile and desktop.

The CSS uses logical directions (`start`, `end`, `ms`, and `border-e`) wherever layout direction matters.
