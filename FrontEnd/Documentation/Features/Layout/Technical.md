# Layout — Technical Documentation

`AppLayoutComponent` references `/assets/logo.png` directly and translates the meaningful `brand.logoAlt` text. It does not embed image data.

Logical spacing utilities (`start`, `ms`, and `border-e`) preserve LTR/RTL behavior. The New Task container and navigation both use `px-3`, while the link uses `w-full`; their outer edges therefore align exactly. The `lg` responsive breakpoint and existing mobile overlay behavior are unchanged.
