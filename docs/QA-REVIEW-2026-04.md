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

> **Status — opfølgning fra 26. april 2026:** alle 5 oprindelige
> "next-steps" er nu implementeret i samme PR. Se sektion 7 for detaljer
> og setup-instruktioner. Punkterne herunder er nye anbefalinger.

1. **Lighthouse-budget i CI** — sæt `performance >= 85`, `accessibility >= 95` som hard gates (ikke kun warnings).
2. **`Permissions-Policy` og `Content-Security-Policy`** via `<meta>` (GitHub Pages tillader ikke headers, men meta-CSP virker for de fleste regler).
3. **Service Worker** med Workbox — offline-fallback + cache-first strategi for fonts/billeder. Især nyttigt på mobil med dårligt netværk.
4. **Sproghåndtering** — hvis Sabine ønsker at tilbyde sider på engelsk, sæt 11ty op med locale-collections (`en/` + `da/` mapper, hreflang-pairs).
5. **Newsletter-tilmelding** (fx Buttondown, Mailchimp) hvis Sabine vil have en mailingliste til workshops/cirkler.
6. **PostCSS / autoprefixer** i build-pipelinen — automatisk vendor-prefix.

---

## 7. Follow-up implementering — 26. april 2026

De 5 oprindelige "anbefalede næste skridt" blev færdiggjort i samme PR via et follow-up commit. Her er hvad det dækker:

### 7.1 components.css (Lag 3 — fælles komponenter)

Filer: `src/assets/css/components.css` (ny), alle 6 `*.njk` siders
`extraHead` er slankede ned. Linket i `head.njk` efter `base.css`.

**Indhold flyttet ud:** `.btn` + `.btn-gold` + `.btn-outline` + `.btn-teal`,
`.section-label`, hele hero-mønsteret (`.hero`, `.hero-bg`, `.hero-gradient`,
`.hero-swoosh`, `.hero-content`, `.hero-label`, `.hero h1`, `.hero-tagline`),
intro-pattern, content-section pattern, CTA-pattern, view-transitions, og
`@property` gradient-animationen.

**Effekt:** ca. 25 KB færre genererede HTML-bytes pr. sidesæt; CSS caches på
første besøg og deles på tværs af alle sider; ét sted at rette
fælles styling.

**Side-unik CSS** ligger stadig i hver sides `extraHead` — kun den unikke
del. Service-sider er nu kun 4 linjer CSS hver (kun `hero-bg` baggrund).

### 7.2 Self-hostede fonts (Cormorant Garamond + Jost)

Filer: `src/assets/fonts/*.woff2` (6 filer, ~200 KB total),
`src/assets/fonts/fonts.css` (20 `@font-face` regler — latin + latin-ext
subsets), `head.njk` opdateret, `site.json` `fonts.url` peger på den
lokale CSS. `preconnect` til Google's CDN er fjernet — ingen tredjeparts-
afhængighed mere.

**Preload:** to vigtigste vægte (Cormorant 500 normal og Jost 400) er
preloadede via `<link rel="preload" as="font" crossorigin>` i head, så de
hentes parallelt med CSS — vigtig for LCP.

**Effekt:** ingen FOIT (Flash of Invisible Text) på første besøg, ingen
data sendt til Google, hurtigere første-render (-1 DNS-handshake -1 TLS
til fonts.gstatic.com).

### 7.3 Billed-optimering + dedikeret OG-image

Filer: `scripts/optimize-images.js` (ny — sharp-baseret), nye filer i
`src/assets/materiale/`: `og-image.jpg` (96 KB, 1200×630), 5 `.webp`
companions, optimeret `logo-tree.png` (105 KB → 27 KB) og `logo-tree.webp`.
Ubrugte tunge filer (`hero-banner.png` 1.4 MB, `logo-horizontal.png`,
`logo-vertical.png`, `social-square.png`, `hero-brand-banner.jpg`) flyttet
til `src/assets/_archive/` — ikke shippet til prod.

`eleventy.config.js` opdateret med eksplicit passthrough (kun
`materiale/`, `css/`, `fonts/`) så `_archive/` ikke følger med i build.

`site.json` `og.defaultImage` peger nu på `/assets/materiale/og-image.jpg`.

`index.njk` hero-portræt bruger nu `<picture>` med WebP-source +
JPG-fallback. Modern browsere får 54 KB WebP, ældre får 67 KB JPG.

**Effekt på shippet `_site/`:** 4.1 MB → 1.2 MB i `_site/assets/materiale/`
(70% reduktion). LCP forventet ~25-40% hurtigere på langsom mobil.

`npm run optimize:images` kører pipelinen igen hvis Sabine tilføjer nye
billeder.

### 7.4 Form-backend (Formspree-ready, mailto-fallback)

Filer: `kontakt.njk` (form har nu `data-endpoint`-attribut og `extraScripts`
har en branch til ægte POST + mailto-fallback), `site.json` har et nyt
`forms.endpoint` felt.

**Setup-instruktion til Sabine:**

1. Opret konto på https://formspree.io (gratis tier: 50 indsendelser/måned).
2. Opret en ny form, kopier dens endpoint-URL (formatet
   `https://formspree.io/f/xxxxxxxx`).
3. Indsæt URL'en i `src/_data/site.json` under `forms.endpoint`.
4. Commit og push — formularen poster nu direkte til Formspree, og Sabine
   får en email pr. besked uden at brugeren skal åbne sin mail-klient.

Hvis feltet er tomt, falder formularen automatisk tilbage til mailto-link
som før — ingen brugeroplevelse-regression.

### 7.5 Cal.com booking-widget (lazy-loaded)

Filer: `kontakt.njk` (ny `{% if site.booking.calcom %}` sektion lige under
hero med en `#cal-booking-placeholder` der lazy-loader Cal.coms inline-
embed via IntersectionObserver), `site.json` har et nyt `booking.calcom`
felt.

**Setup-instruktion til Sabine:**

1. Opret konto på https://cal.com (gratis tier).
2. Opret event-types Sabine vil tilbyde online (fx "30 min afklarende
   samtale", "Hypnoseterapi 60 min").
3. Notér Sabines Cal.com-namespace (fx hvis hendes link er
   `cal.com/sabine-lindeberg/30min`, så er namespace
   `sabine-lindeberg/30min`).
4. Indsæt namespace i `src/_data/site.json` under `booking.calcom`.
5. Commit og push — booking-kalenderen vises nu på `/kontakt/`-siden.

Embed'et er themed med Sabines guld (`--cal-brand: #D4AF37`) og loades
KUN når brugeren scroller ned til sektionen — så ingen perf-regression
for besøgende der bare vil ringe.

Hvis feltet er tomt, vises sektionen slet ikke — kontaktformularen som
før.

---

## 8. Filer ændret i follow-up

| Fil | Type | Hvad |
|-----|------|------|
| `src/assets/css/components.css` | A | Ny Lag 3-fil — delte komponenter |
| `src/assets/fonts/*.woff2` | A | 6 selv-hostede font-filer |
| `src/assets/fonts/fonts.css` | A | 20 `@font-face` regler (latin/latin-ext) |
| `src/assets/_archive/` | A | 5 ubrugte legacy-filer flyttet hertil |
| `src/assets/materiale/og-image.jpg` | A | Dedikeret 1200×630 OG-image |
| `src/assets/materiale/*.webp` | A | 6 WebP-companions |
| `src/assets/materiale/logo-tree.png` | M | Re-encoded (105 KB → 27 KB) |
| `src/assets/materiale/sabine-*.jpg` | M | mozjpeg q82 (gennemsnitligt 25% mindre) |
| `scripts/optimize-images.js` | A | Sharp-baseret billed-optimering |
| `package.json` | M | `sharp` devDep + `optimize:images` script |
| `eleventy.config.js` | M | Eksplicit passthrough (ekskluderer `_archive/`) |
| `src/_data/site.json` | M | `fonts.url` peger lokalt; `fonts.preload`; `forms.endpoint`; `booking.calcom`; `og.defaultImage` opdateret |
| `src/_includes/partials/head.njk` | M | Self-hosted fonts; preload; preconnect-fjernet; components.css link |
| `src/index.njk`, `src/hypnoseterapi.njk`, `src/terapeutisk-samtale.njk`, `src/shamanistiske-cirkler.njk`, `src/om-sabine.njk`, `src/kontakt.njk` | M | Slankede `extraHead`; index har `<picture>` på hero |
| `src/kontakt.njk` | M | Form: `data-endpoint`, async POST-branch; Cal.com lazy-embed sektion |
| `docs/QA-REVIEW-2026-04.md` | M | Denne sektion 7 + 8 |

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
