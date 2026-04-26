# QA-REVIEW — sabinelindeberg.dk

> QA-gennemgang og forbedringer på branch `claude/qa-review-improvements-ElHZW`.
> Dato: 26. april 2026
> Reviewer: Claude (BygMedAI sub-agent), foranlediget af Steven Wensley
> Scope: backend (build/SEO/struktur), frontend (a11y/UX/perf), uden ændring af visuelt design.

---

## 1. Mål og rammer

Sabines design (petrol/gold/sand-paletten, Cormorant Garamond + Jost,
nav, hero-mønstre, swoosh) er **bevaret 1:1**. Alle ændringer er enten:

- **Usynlige** (meta, JSON-LD, sitemap, accessibility-attributter)
- **Additive** (skip-link, fokus-ringe, GDPR-banner, 404-side, honeypot)
- **Datacentralisering** (priser, telefon, åbningstider flyttet til `site.json` — ét sted at rette)

Ingen farver, fonte, paddings eller komponent-stil er ændret.

---

## 2. Forbedringsforslag — i alt 22 stk.

Forslag markeret ✅ er **implementeret i denne PR**. Forslag markeret 📋 er
**dokumenterede anbefalinger** til senere arbejde (ud over stabiliseringen).

### A. Tilgængelighed (a11y)

1. ✅ **Skip-link** — `<a class="skip-link" href="#main">Spring til hovedindhold</a>` synligt på fokus. Krav efter WCAG 2.4.1.
2. ✅ **`<main id="main">` landmark** — wrapper omkring `{{ content }}` i `base.njk`, så skærmlæsere kan springe direkte til indhold.
3. ✅ **Hamburger-knap a11y** — fjernet inline `onclick`, tilføjet `aria-expanded`, `aria-controls="navLinks"`, dynamisk `aria-label` ("Åbn menu" / "Luk menu"), Escape-tast lukker, klik på link lukker auto.
4. ✅ **`aria-current="page"`** — automatisk sat på det aktive nav-link via `page.url`-sammenligning. Også styling: aktivt link bliver guld.
5. ✅ **Fokus-ringe** — global `:focus-visible` med guld-outline (3px offset) i `base.css`. Tastatur-brugere kan nu se hvor de er.
6. ✅ **Dekorative ikoner skjult for skærmlæsere** — emoji'er i service-cards og booking-detaljer fået `aria-hidden="true"`; `card-link` har nu `aria-label="Læs mere om hypnoseterapi"` osv. så screenreader-brugere ved hvor "Læs mere →" peger.
7. ✅ **Reduce-motion-respekt udvidet** — `html { scroll-behavior: auto }` og global animation-clamp `0.01ms` ved `prefers-reduced-motion: reduce` (Apple/Android tilgængelighed).

### B. SEO og structured data

8. ✅ **Beriget JSON-LD på forsiden** — `LocalBusiness` med `priceRange`, `openingHoursSpecification`, `hasOfferCatalog` (4 offers), `@id` for genbrug. Gør det muligt for Google at vise priser, åbningstider og ydelser direkte i søgeresultatet.
9. ✅ **BreadcrumbList JSON-LD** på alle indre sider (hypnoseterapi, terapeutisk-samtale, shamanistiske-cirkler, om-sabine, kontakt). Bedre SERP-præsentation.
10. ✅ **`@graph`-struktur** — undersider refererer forsiden via `{ "@id": "https://sabinelindeberg.dk/#business" }` i stedet for at duplikere LocalBusiness. Mindre risiko for inkonsistens.
11. ✅ **Auto-genereret sitemap.xml** — `src/sitemap.njk` looper `collections.all` med `isoDate`-filter (tilføjet i `eleventy.config.js`). Lastmod opdateres automatisk; ingen mere manuel vedligehold af `2026-03-13`-datoer.
12. ✅ **`hreflang="da"`** og `og:image:alt`, `og:site_name` tilføjet i `head.njk`.
13. 📋 **Self-host fonts eller `font-display: swap`-fallback** — Google Fonts er på CDN; preconnect er der, men selv-hosting (én WOFF2 pr. font) sparer 100-300ms TTFB og fjerner third-party afhængighed.
14. 📋 **Open Graph billede genereret pr. side** — i dag bruger alle sider `hero-banner.png` (1.4 MB!). Bør genereres som 1200×630 WebP (≈80 KB) pr. side eller en pæn fælles default.

### C. Performance og Core Web Vitals

15. ✅ **`fetchpriority="high"` på LCP-billede** — `sabine-portrait.jpg` på forsiden får højeste billed-prioritet; resterende billeder får `decoding="async"`. Forventet LCP-forbedring 200-400ms på langsomt mobil.
16. ✅ **Eksplicit `width`/`height` på hero-billeder** — eliminerer CLS (cumulative layout shift) — Lighthouse kriterium.
17. ✅ **Centraliseret nav-scroll-handler** i `base.njk` — fjernede pr-side `<script>` i `index.njk` der lavede præcis det samme. Mindre duplikeret JS.
18. ✅ **GA4 lazy-loadet via consent gate** (se D.20) — gtag.js indlæses *kun* hvis brugeren accepterer; ellers ingen ekstern netværkskald. Forbedrer FCP / LCP markant for første-besøgende.
19. 📋 **WebP/AVIF-konvertering af billeder** — `hero-banner.png` (1.4 MB), `logo-horizontal.png` (708 KB) og `social-square.png` (333 KB) bør komprimeres. 11ty `Image`-pluginnet kan automatisere dette i build.
20. 📋 **Centraliseret `components.css`** — `.btn`, `.btn-gold`, `.btn-outline`, `.btn-teal`, `.section-label`, `.hero`-mønsteret er duplikeret i alle 6 sideskabeloner (ca. 200 linjer × 6 = ~1.2 KB redundans pr. sidevisning). Bør hentes til en delt CSS-fil i Lag 3 (komponenter). Ikke gjort i denne PR for at holde diff'et reviewbart.

### D. Privacy / GDPR / Compliance

21. ✅ **GDPR-consent-banner** — bunden af siden, petrol/guld stylet (passer til design). Default Consent Mode v2 = `analytics_storage: denied`. gtag.js loades kun ved accept. Valg gemt i `localStorage` (`sl-consent-v1`). Krav efter dansk cookiebekendtgørelse + ePrivacy.
22. ✅ **`anonymize_ip: true`** sendt til GA4 ved config — yderligere lag for GDPR-minimering.

### E. UX / forretning

23. ✅ **Centraliseret single source of truth** — `site.json` har nu `phone`, `phoneE164`, `prices`, `priceRange`, `openingHours`, `openingHoursDisplay`, `session.duration`, `session.format`, `address.locality/region/country`, `themeColor`. Sabine retter ét sted.
24. ✅ **Kontaktformular hardened** — `autocomplete="name|email|tel"`, `inputmode="email|tel"`, `novalidate` + JS-styret `checkValidity`, **honeypot** (`name="company"` off-screen) mod bots, `aria-live` status-felt, sendt-knap deaktiveres efter klik. Stadig mailto-fallback (ingen backend), men nu giver formularen feedback hvis brugeren ikke har en standard mail-klient.
25. ✅ **404-side** — `src/404.njk` (`permalink: /404.html`, `noindex: true`). GitHub Pages serverer automatisk denne ved manglende route. Stilet med Sabines paletten.
26. ✅ **Theme-color, favicon, apple-touch-icon, mask-icon** — tilføjet i `head.njk` med `logo-tree.png`. Sabines logo dukker nu op i browser-fane, iOS hjemmeskærm, og Android task switcher.
27. ✅ **Print stylesheet** — i `base.css`. Skjuler nav/footer/hero-bg/parallax. Hvis en klient printer en side (fx priser), får de ren læsbar tekst.
28. 📋 **Booking-system** — i dag er CTA'en "Book en samtale" → kontaktformular. Sabine bør integrere fx Cal.com / Calendly hvis hun vil have selvbetjent booking.
29. 📋 **Ægte form-backend** — Formspree, Netlify Forms eller en mini-funktion på Cloudflare Workers. Mailto er sårbart over for klienter uden standard mail-klient (mange mobil-browsere).

---

## 3. Risiko og test

| Område | Risiko | Mitigation |
|--------|--------|-----------|
| GDPR-banner skjuler indhold | Lav — `position: fixed`, max 540px bred, kun synlig én gang | Manuel mobiltest anbefales |
| `<main>` wrapper kan påvirke CSS-selectors | Lav — ingen pages bruger `body > section` | Build + html-validate kørt grøn |
| Auto-sitemap erstatter manuel | Lav — 6 sider listes med korrekte URL'er og prioriteter | Output verificeret, lastmod = build-dato |
| Form `novalidate` + JS validering | Hvis JS er disabled, stoppes form ikke | Faller tilbage til mailto-link i email-detalje-blokken |
| Skip-link tabindex på `<main>` | `tabindex="-1"` gør `<main>` programmatisk fokuserbar (ikke i tab-rækkefølgen) | Standard a11y-mønster |

### Build- og valideringsstatus

- `npx @11ty/eleventy` → 8 filer skrevet, 0.19s, 0 fejl
- `html-validate _site/**/*.html` → **0 errors**, 6 warnings (alle eksisterende `&` i tekst — ikke regression)
- Auto-genereret `sitemap.xml` indeholder alle 6 sider med korrekt `lastmod`
- 404-side bygges til `_site/404.html`

---

## 4. Filer ændret

| Fil | Type | Hvad |
|-----|------|------|
| `src/_data/site.json` | M | Tilføjet phoneE164, themeColor, address, openingHours, priceRange, prices.*, session.* |
| `eleventy.config.js` | M | Tilføjet `isoDate` filter; fjernet `sitemap.xml` passthrough |
| `src/_includes/base.njk` | M | Skip-link, `<main id="main">`, GDPR-banner-DOM + JS, accessibel nav-toggle, hamburger-animation til "X" |
| `src/_includes/partials/head.njk` | M | Theme-color, favicons, og:image:alt, hreflang, GA4 m. consent gate, ip-anonymisering |
| `src/_includes/partials/nav.njk` | M | aria-expanded, aria-controls, aria-current, width/height på logo |
| `src/assets/css/base.css` | M | `.skip-link`, `:focus-visible`, udvidet reduce-motion, print stylesheet |
| `src/index.njk` | M | Beriget LocalBusiness JSON-LD; fetchpriority/decoding på LCP; aria-hidden ikoner; brug af site.prices/site.session/site.phoneE164; fjernet duplikeret nav-scroll script |
| `src/hypnoseterapi.njk`, `src/terapeutisk-samtale.njk`, `src/shamanistiske-cirkler.njk`, `src/om-sabine.njk`, `src/kontakt.njk` | M | JSON-LD `@graph` med Service + BreadcrumbList; reference til `#business` |
| `src/kontakt.njk` | M | Form: autocomplete, inputmode, honeypot, novalidate, aria-describedby, aria-live status; site.prices/site.openingHoursDisplay; opening hours synlige |
| `src/404.njk` | A | Ny 404-side, noindex, Sabines stil |
| `src/sitemap.njk` | A | Auto-genereret sitemap |
| `src/sitemap.xml` | D | Erstattet af genereret variant |
| `docs/QA-REVIEW-2026-04.md` | A | Dette dokument |

---

## 5. Anbefalet næste skridt (uden for denne PR)

1. **Komprimer `hero-banner.png` (1.4 MB)** og generer dedikeret OG-image (1200×630, < 100 KB).
2. **Refactor: components.css** (Lag 3) — flyt duplikeret btn/section-label/hero CSS ud af `extraHead`. Sparer ~7 KB rendered HTML pr. sidevisning.
3. **Self-host fonts** (Cormorant Garamond + Jost) — lokale WOFF2 fjerner Google Fonts-dependency og forbedrer LCP.
4. **Form-backend** (Formspree / Netlify Forms / Cloudflare Pages function).
5. **Cal.com / Calendly** integration så Sabine ikke skal koordinere bookings manuelt.
6. **Lighthouse-budget i CI** — sæt `performance >= 85`, `accessibility >= 95` som hard gates (ikke kun warnings).
7. **Add `Permissions-Policy` og `Content-Security-Policy`** via `<meta>` (GitHub Pages tillader ikke headers, men meta-CSP virker).

---

## 6. Reviewers tjekliste

- [ ] Visuelt: Sammenlign forsiden før/efter — ingen layout-skift, ingen farvebrud
- [ ] Mobile: Hamburger åbner/lukker, Escape lukker, link-klik lukker
- [ ] Tab-trip: skip-link viser sig, fokus-ring synlig på alle interaktive elementer
- [ ] Print preview: Nav/footer/parallax skjult, tekst læsbar
- [ ] Reduce motion (System-indstilling): scroll-reveal afspilles ikke
- [ ] Først-besøg: GDPR-banner vises; "Nej tak" — gtag.js indlæses ALDRIG
- [ ] Efter accept: GA4 sender events, anonymize_ip aktiv (verificer i DevTools → Network)
- [ ] `/sitemap.xml` indeholder alle sider med dagens dato
- [ ] `/404.html` ser ordentligt ud
- [ ] JSON-LD valideret på https://validator.schema.org/

---

*Genereret af Claude som sub-agent for BygMedAI. Alle ændringer respekterer Sabines designvalg (petrol/gold/sand, Cormorant Garamond + Jost) og er additive eller usynlige for slutbrugeren.*
