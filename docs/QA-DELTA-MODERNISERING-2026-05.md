# Sirius Briefing: sabinelindeberg.dk — QA, Delta & Moderniserings-analyse

**Repo:** `stevenwensley-a11y/sabinelindeberg.dk`
**Branch:** `claude/wizardly-goldberg-4tOv7` → draft-PR mod `main`
**Dispatch-sti:** `docs/QA-DELTA-MODERNISERING-2026-05.md`

---

**Afsender:** Claude (QA-/analyse-subagent, foranlediget af Steven Wensley)
**Til:** Sirius (Enterprise Architect)
**Dato:** 2026-05-26
**Version:** v1.0
**Format:** Analysis request + Review request (PRE-DISPATCH)
**Status:** ⛔ Ingen build udført. Dette dokument er review-artefakt forud for en evt. G33 build dispatch. Afventer Sirius-ruling.

---

## 0. Formål

Steven rapporterer at "en tidligere opdatering har forstyrret frontend" og at Sabine
oplever **visuelle fejl**. Opgaven er tredelt:

1. Kør QA på `sabinelindeberg.dk` og find årsagen til de visuelle fejl.
2. Hold fundene op mod **delta** — dvs. gappet mod (a) de åbne anbefalinger fra
   `QA-REVIEW-2026-04.md` og (b) den nyere fabriks-baseline der demonstreres i
   `vaidas-suiten` (Reflex.studio).
3. Lever en dybere moderniserings-analyse, så kodebasen bliver tidssvarende.
   Sitet blev kodet for ~3 måneder siden (pilot-migration 2026-03-13); fabrikken
   har lært meget siden.

Rapporten stiles til Sirius til review **før** der gives en bygge-dispatch.

---

## 1. Kontekst

- **Stack:** Statisk site, 11ty (`@11ty/eleventy ^3.1.2`) + Nunjucks. Kilde i `src/`,
  bygges til `_site/`. Deploy via GitHub Actions (`.github/workflows/deploy.yml`) til
  GitHub Pages. Self-hostede fonte, GA4 bag consent-gate, hand-rullet service worker.
- **Build-status:** `npx @11ty/eleventy` → 9 sider skrevet, 0 fejl. Grøn.
- **Seneste to commits:**
  - `504de01` (#1, 2026-05-11) — QA-review (a11y/SEO/perf/GDPR) + **introducerede service worker** + finaliserede `base.css`/`components.css`.
  - `1fe4658` (#2, 2026-05-14) — **critical-CSS inlining + async-defer af stylesheets**. Dette er "den tidligere opdatering".
- **Verifikations-begrænsning (G13/G25):** Jeg har **ingen browser** i dette miljø.
  Alle visuelle fund herunder er udledt ved statisk kode-/build-analyse. Visuel
  signoff er ikke mit mandat og skal ske i verify-fasen (Steven G25 / G34). Hvor jeg
  skriver "synligt", mener jeg "deterministisk udledt af koden", ikke "observeret i browser".

---

## 2. Del A — QA-fund

| # | Sev | Fund | Indført af |
|---|-----|------|-----------|
| RED-1 | 🔴 | Knapper (inkl. primær hero-CTA) flasher ustylet ved hver fresh load | #2 |
| RED-2 | 🔴 | Service worker er cache-first på statiske assets med fastlåst, aldrig-bumpet `VERSION` og uden fil-fingerprinting → vedvarende stale-frontend-risiko | #1 |
| YEL-1 | 🟡 | OG-/Twitter-titel dubleres på forsiden ("…Frederikssund — Indre Kald og Kraft") | template-logik |
| YEL-2 | 🟡 | 6 forældede rod-`*.html`-filer i git med **ubetinget GA4 uden consent** (GDPR), gamle fonte-CDN, gammelt OG-image | pre-migration rester |
| YEL-3 | 🟡 | Critical-CSS dublerer design-tokens som hardkodede værdier der skal hånd-synces med skin | #2 |
| YEL-4 | 🟡 | Ingen rigtige HTTP security-headers / CSP (GitHub Pages-begrænsning) | platform |
| INFO | ⚪ | Smoke-tests targeter også de døde rod-`*.html`-filer | testsuite |

### RED-1 — Ustylede knapper ved fresh load (primær mistænkte for Sabines symptom)

Commit #2 inlinede ~5 KB critical CSS i `<head>` og flyttede `base.css`, `components.css`
og skin til **async** load via `preload + onload="this.rel='stylesheet'"`.

Problemet: knap-styling (`.btn`, `.btn-gold`, `.btn-outline`, `.btn-teal`) ligger i
`components.css` — som nu loades async — men er **ikke** med i den inlinede critical CSS.

- `critical-css.njk`: `.btn` forekomster = **0**
- `components.css`: `.btn` forekomster = **8**
- Forsidens primære CTA `<a class="btn btn-gold">Book en samtale</a>` ligger i
  `_site/index.html` linje **780** — dvs. i hero, **over folden**.

Konsekvens: ved hver friske indlæsning renderes alle knapper (inkl. den vigtigste
hero-CTA) som **nøgne tekstlinks** indtil async `components.css` er hentet og anvendt.
På hurtig forbindelse er vinduet kort; på langsom 4G-mobil (Sabines klienter) eller
ved SW-/netværks-interaktion er det tydeligt og vedvarende nok til at ligne en "fejl".
Det er en deterministisk regression indført af #2 på det vigtigste konverteringselement.

Critical CSS dækker reset + tokens + nav + hero-skal, men ikke knapper, intro,
content-sektioner, CTA-sektion eller footer — alt det er async.

### RED-2 — Service worker: vedvarende stale-frontend-risiko

`src/sw.js`:
- Statiske assets (`.css/.js/.woff2/.png/...`) serveres **cache-first**.
- Cache-nøglen er hardkodet: `const VERSION = 'sl-v1'`. Kommentaren i filen siger
  selv *"Versionsnøgle bumpes når CSS/JS-strukturen ændres så gamle caches ryddes."*
- Commit #2 **ændrede CSS-loading-strukturen markant** men **bumpede ikke** `VERSION`.
- Assets har ingen fingerprint i filnavnet (`base.css`, ikke `base.[hash].css`), så
  SW-version-bump er den **eneste** invaliderings-mekanisme.

For #1→#2 specifikt var `base.css`/`components.css` *indhold* uændret, så denne
sekvens udløste sandsynligvis ikke i sig selv afvigende styling. Men mekanismen er en
ægte strukturel defekt: en tilbagevendende besøgende — og Sabine er den hyppigste —
risikerer at SW'en serverer en cachet asset-tilstand der ikke matcher den friske
(network-first) HTML. **Næste** CSS-indholds-ændring uden version-bump vil bide hårdt
og vedvarende. Anbefalet hand-rullet SW erstattes ideelt af build-genereret cache med
fingerprintede assets (se Del C).

### YEL-1 — Dubleret OG-titel på forsiden

`head.njk:22`: `content="{{ ogTitle or title }} — {{ site.name }}"`. Forsidens
`ogTitle` indeholder allerede brandet ("Indre Kald og Kraft — Hypnoseterapi i
Frederikssund"), og templaten appender `site.name` igen → resultat:
`"Indre Kald og Kraft — Hypnoseterapi i Frederikssund — Indre Kald og Kraft"`.
Påvirker social-deling/SEO, ikke selve siden. Fix: drop suffiks når `ogTitle` er sat,
eller ret forsidens `ogTitle`.

### YEL-2 — Forældede rod-HTML-filer (GDPR-landmine)

`index.html`, `hypnoseterapi.html`, `kontakt.html`, `om-sabine.html`,
`shamanistiske-cirkler.html`, `terapeutisk-samtale.html` ligger stadig i repo-roden,
trackes i git, og er **pre-11ty-versioner**. De indeholder bl.a. **ubetinget
`gtag.js` uden consent-gate** (i modstrid med den GDPR-compliance #1 indførte),
gammelt Google-Fonts-CDN-link og OG-image der peger på det arkiverede 1,4 MB
`hero-banner.png`.

De er døde *hvis* Pages deployer build-artefakten (`_site/`) via Actions — hvilket
workflowet gør. Men hvis Pages-source nogensinde sættes til "Deploy from branch
(root)", serveres disse forældede, ikke-compliant filer i stedet. Anbefaling: **slet
dem**. De er rådne rester og forurener desuden testsuiten (INFO).

### YEL-3 — Critical-CSS token-duplikering

`critical-css.njk` hardkoder hele `:root`-token-blokken som dublet af
`skins/sabinelindeberg.css`. Pt. er de **i sync** (verificeret), så ingen aktiv farve-bug.
Men det er en vedligeholdelses-fælde: ændrer Sabine en farve ét sted og ikke det andet,
får første paint forkerte farver indtil async-skin loader. Bør genereres ved build-tid
(se Del C), ikke hånd-synces.

### YEL-4 — Ingen HTTP security-headers / CSP

`head.njk` har 0 CSP/Permissions-Policy meta. GitHub Pages kan ikke sætte rigtige
HTTP-headers. Til sammenligning sætter `vaidas-suiten/vercel.json` `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy` og `Permissions-Policy` på alle ruter.
Dette er kernen i "backend"-delta'en (Del C).

### Grøn status (ingen regression)

11ty-build, sitemap, robots, manifest, JSON-LD (1 blok/forside), SW-registrering,
self-hostede fonte, consent-gated GA4 og Lighthouse-hard-gates i `test.yml` er alle
intakte. Playwright-smoke-suite eksisterer (browser kunne ikke køres her — kør i CI/verify).

---

## 3. Del B — Delta

### B.1 Delta mod `QA-REVIEW-2026-04.md`

| April-anbefaling | Status nu | Note |
|---|---|---|
| Self-host fonts | ✅ Lukket | §7.2 |
| WebP/AVIF + dedikeret OG-image | ✅ Lukket | §7.3 |
| `components.css` (Lag 3) | ✅ Lukket | §7.1 — men se RED-1: async-load af denne fil er årsag til knap-FOUC |
| Lighthouse hard-gate i CI | ✅ Lukket | `test.yml` job `lighthouse` |
| Formspree form-backend | 🟡 Klargjort, **inaktiv** | `site.json forms.endpoint = ""` → falder tilbage til mailto |
| Cal.com booking | 🟡 Klargjort, **inaktiv** | `site.json booking.calcom = ""` → ingen widget |
| Service Worker (anbefalet: Workbox) | ⚠️ Delvist | Hand-rullet SW i stedet → indførte RED-2 |
| CSP / Permissions-Policy | ❌ Åben | Ikke muligt med headers på Pages; kun meta-CSP delvist muligt |
| i18n (EN/DE) | ❌ Åben | Ikke påbegyndt |
| PostCSS/autoprefixer | ❌ Åben | Ikke påbegyndt |
| Newsletter | ❌ Åben | Ikke påbegyndt |

**Residual:** OG-titel-dubleringen (YEL-1) er en *ny* regression der ikke fandtes i
April-rapportens scope.

### B.2 Delta mod nyere fabriks-baseline (`vaidas-suiten`)

Vaidas er ~2 mdr nyere og repræsenterer fabrikkens aktuelle mønstre. Sabine er bagud på:

| Dimension | Vaidas (nu) | Sabine (3 mdr gl.) | Delta |
|---|---|---|---|
| Hosting | Vercel | GitHub Pages | Ingen rigtige headers/serverless på Pages |
| Security headers | `vercel.json` (4 headers) | Ingen | Åben |
| Booking | cal.com indtænkt i flow | cal.com klargjort, inaktiv | Aktivér |
| Backend turn-key | AI-styret CMS, EN+DE planlagt | Hånd-redigeret `site.json` | Ingen self-service-redigering |
| Design-tokens | `oklch()` | hex + legacy-alias-lag (`--black:#FFFFFF`) | Token-modernisering |

---

## 4. Del C — Moderniserings-analyse (tidssvarende)

Prioriteret. Hver post er en *anbefaling til Sirius*, ikke en udført ændring.

**P0 — Stop blødningen (lille, lav-risiko, retter Sabines symptom):**
1. Fix RED-1: enten (a) flyt knap-styling ind i critical CSS, eller (b) gør
   `components.css` render-blocking igen (rul #2's async-del tilbage for delt CSS),
   eller (c) build-tids critical-CSS-ekstraktion (se P1). Anbefalet: (c), men (a) er
   den hurtige hotfix.
2. Fix RED-2: bump SW `VERSION` til `sl-v2` (rydder gamle caches via `activate`-handler),
   og overvej network-first/stale-while-revalidate for CSS indtil fingerprinting er på plads.
3. Fix YEL-1 (OG-titel) og slet YEL-2 (rod-HTML-filer).

**P1 — Byg-pipeline modernisering:**
4. **Asset-fingerprinting** (`base.[hash].css`) + **build-tids critical-CSS** (fx
   `@11ty/eleventy` + `critical`/`penthouse` eller PostCSS). Fjerner BÅDE FOUC (RED-1)
   OG token-sync-fælden (YEL-3) OG stale-cache-problemet (RED-2) i ét greb — critical
   CSS bliver altid korrekt og assets cache-bustes deterministisk.
5. PostCSS + autoprefixer i pipelinen (April-åben).

**P2 — Platform/"backend" (Vaidas-mønster):**
6. **Migrér hosting GitHub Pages → Vercel** (eller Cloudflare Pages). Giver: rigtige
   HTTP security-headers + CSP (YEL-4), `Cache-Control` på asset-niveau (afhjælper
   stale-problemet på platform-lag), og **serverless functions** til ægte form-backend
   uden tredjeparts-afhængighed (erstatter Formspree-planen). `vercel.json` fra Vaidas
   er en direkte skabelon.
7. **Aktivér forms + booking** (udfyld `forms.endpoint` / `booking.calcom`), evt. mod
   en egen serverless-funktion frem for Formspree når P2.6 er på plads.

**P3 — Indhold & rækkevidde:**
8. **Headless/git-baseret CMS** (Decap/Sveltia/TinaCMS) så Sabine selv kan redigere
   tekst/priser uden at røre kode — fabrikkens "AI-styret CMS"-retning i let udgave.
9. **i18n (EN/DE)** via 11ty locale-collections + hreflang-par (April-åben; Vaidas-baseline).
10. Token-modernisering: ryd det forvirrende legacy-alias-lag (`--black:#FFFFFF`,
    `--pink:#D4AF37`) og overvej `oklch()` som i Vaidas.

---

## 5. Foreslåede Acceptance Criteria (for en kommende build dispatch)

| # | Krav | Verifikation |
|---|------|-------------|
| AC-1 | Hero-CTA + alle `.btn` er fuldt stylet ved first paint | Browser/Playwright: ingen ustylet-knap-frame; visuel diff |
| AC-2 | SW serverer ikke stale CSS efter en CSS-ændring | Deploy-test: ændr CSS, verificér ny version hentes uden hard-reload |
| AC-3 | OG-titel ikke dubleret | `grep og:title _site/**` viser ingen dublet |
| AC-4 | Rod-`*.html` slettet; testsuite targeter kun `_site/` | `git ls-files '*.html'` = kun under src/_site-flow |
| AC-5 | Build grøn + Lighthouse-gates holdes | CI |
| AC-6 (P2) | Rigtige security-headers aktive | `curl -I` mod deploy viser X-Frame-Options m.fl. |

---

## 6. Routing & Gates

- **G33 (Build Dispatch Gate):** Ingen kode-ændring er foretaget. P0–P3 kræver en
  eksplicit dispatch med `[G33:A]`/`[G33:B:<dev_id>]`, TARGET SCOPE og WHY-mandat.
- **§11.8 red-zone:** P1 (`package.json`, build-config, workflows) og P2 (`vercel.json`,
  ny ekstern service/CDN, hosting-skift) er **dependency/config red-zone** → kræver
  Sirius-ruling, ikke autonom udførelse.
- **G34 / G13 / G25:** RED-1 er visuel; final korrekthed skal verificeres i browser
  (Steven G25 / visuel signoff). Jeg afgiver ingen visuel signoff.
- **Eksekutor-valg (RACI v2.0):** P0 er single-repo → Ted-skala. P2-hosting-skift er
  arkitektonisk → Sirius-ruling før eksekvering.

---

## 7. Risici

| # | Risiko | Mitigation |
|---|--------|-----------|
| R1 | Async→render-blocking rollback fjerner #2's LCP-gevinst | Brug build-tids critical (P1.4) frem for fuld rollback |
| R2 | SW version-bump alene rydder ikke klienter der aldrig revisiter | Tilføj network-first/SWR for CSS; fingerprinting i P1 |
| R3 | Hosting-skift (Pages→Vercel) berører CNAME/DNS, deploy, CI | Kun under Sirius-ruling; behold Pages til Vercel er verificeret |
| R4 | Min visuelle diagnose er kode-udledt, ikke browser-observeret | Reproducér RED-1 i verify-fasen før hotfix mærkes "done" |

---

## 8. Hvad jeg IKKE gjorde (dispatch-grænse / click-tax)

- Ingen kildekode-ændringer på det brugervendte site. Ingen build dispatch udført.
- Ingen push til `main`, ingen merge, ingen ændring af red-zone-filer.
- Dette dokument er committet til arbejdsbranchen som review-artefakt og åbnet som
  **draft-PR**. Næste skridt tilhører Sirius (ruling) → evt. build dispatch til eksekutor.

---

*End of briefing. Afventer Sirius-review før build dispatch.*
