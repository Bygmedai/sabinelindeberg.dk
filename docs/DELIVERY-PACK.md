# DELIVERY-PACK — sabinelindeberg.dk

> Teknisk overdragelsesdokument for sabinelindeberg.dk.
> Genereret: 13. marts 2026
> Ansvarlig: Steven Wensley, BygMedAI

---

## 1. Repository

| Felt | Værdi |
|------|-------|
| **URL** | `https://github.com/stevenwensley-a11y/sabinelindeberg.dk` |
| **Branch-strategi** | `main` = produktion. Push til main trigger deploy. |
| **CI status** | Quality Gate (build + HTML-validering + Lighthouse + Smoke tests) → Deploy via GitHub Actions |
| **Teknologi** | Eleventy (11ty) v3.1.2, Nunjucks templates |
| **Node version** | 20 LTS |
| **Build kommando** | `npm run build` |
| **Output mappe** | `_site/` |

### Repo-struktur

```
├── src/
│   ├── _includes/
│   │   ├── base.njk         # Base layout (nav + footer + Layer 2 CSS)
│   │   ├── partials/
│   │   │   ├── head.njk     # <head> meta, fonts, CSS loading
│   │   │   ├── nav.njk      # Navigation (image+text logo, 5 links + CTA)
│   │   │   └── footer.njk   # 3-kolonne footer (kontakt, links, info)
│   │   └── components/
│   │       └── cta.njk      # CTA button macros
│   ├── _data/
│   │   └── site.json        # Global site config (SINGLE SOURCE OF TRUTH)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── base.css         # Layer 1: CSS reset + design tokens
│   │   │   └── sabinelindeberg.css  # Layer 4: Site-specifik skin
│   │   └── materiale/           # Billeder (logo, hero, Sabine-foto)
│   ├── index.njk               # Forside
│   ├── hypnoseterapi.njk       # Tjeneste: Hypnoseterapi
│   ├── terapeutisk-samtale.njk # Tjeneste: Terapeutisk samtale
│   ├── shamanistiske-cirkler.njk # Tjeneste: Shamanistiske cirkler
│   ├── om-sabine.njk           # Om Sabine
│   ├── kontakt.njk             # Kontakt/booking
│   ├── robots.txt
│   └── sitemap.xml
├── eleventy.config.js          # 11ty konfiguration
├── package.json                # Dependencies
├── CNAME                       # Custom domain
└── .github/workflows/
    ├── test.yml                # Quality Gate
    └── deploy.yml              # Build + Deploy til GitHub Pages
```

---

## 2. Deploy

| Felt | Værdi |
|------|-------|
| **Platform** | GitHub Pages via GitHub Actions |
| **Deploy trigger** | Push til `main` branch |
| **Build step** | `npm ci && npx @11ty/eleventy` |
| **Validering** | YAML-lækage check + style tag balance |
| **Output** | `_site/` → GitHub Pages artifact |
| **Custom domain** | sabinelindeberg.dk (CNAME) |
| **SSL** | Automatisk via GitHub Pages (Let's Encrypt) |

### Deploy-flow

```
Push til main
  → test.yml: Quality Gate
    → Build 11ty
    → HTML-validering
    → Broken links check
    → Lighthouse audit
    → Smoke tests
  → deploy.yml: Build & Deploy
    → Build 11ty
    → Artifact validering
    → Upload pages artifact
    → Deploy til GitHub Pages
  → LIVE på sabinelindeberg.dk
```

---

## 3. DNS

| Felt | Værdi |
|------|-------|
| **Registrar + DNS** | one.com (Sabines konto) |
| **Nameservers** | one.com standard |

### DNS Records

| Type | Navn | Værdi |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | stevenwensley-a11y.github.io |

> **NB:** one.com har en ubetalt faktura (1.953 DKK). Sørg for at betaling er i orden for at undgå at domænet suspenderes.

---

## 4. Credentials & Adgange

> **SIKKERHED:** Ingen passwords eller tokens i dette dokument.

| Adgang | Placering | Ansvarlig |
|--------|-----------|-----------|
| GitHub repo | stevenwensley-a11y konto | Steven (overdrages til Sabine) |
| one.com (DNS + domæne) | Sabines one.com konto | Sabine |
| Google Analytics | GA4: G-1T736SKWVT | Steven (overdrages til Sabine) |

### Adgangsoverdragelse

- [ ] Sabine inviteret som collaborator på GitHub repo
- [ ] GA4 property delt med Sabines Google-konto
- [ ] one.com faktura betalt (1.953 DKK)
- [ ] Dokumentation overdraget (denne pakke)

---

## 5. Kendte Begrænsninger

### Browser-kompatibilitet

- Parallax (`background-attachment: fixed`) virker ikke på iOS Safari — fallback til scroll
- Google Fonts kræver internetforbindelse (ikke self-hosted)

### Performance

- Billeder i `/assets/materiale/` bør komprimeres til WebP (maks 200KB)
- Hero-banner er stort — overvej at komprimere
- Lighthouse mål: Performance ≥ 90, Accessibility ≥ 90

### Kendte issues

| Issue | Beskrivelse | Workaround |
|-------|-------------|------------|
| one.com ubetalt faktura | 1.953 DKK ubetalt — risiko for domæne-suspension | Betal faktura hurtigst muligt |
| Manglende priser | Priser på tjenester er ikke offentliggjort endnu | Sabine skal levere priser |
| Manglende indhold-godkendelse | Sabine har ikke formelt godkendt alt indhold | Afventer Sabines gennemlæsning |

---

## 6. Dependencies & Tredjepartstjenester

| Tjeneste | Bruges til | Konto-ejer | Status |
|----------|-----------|------------|--------|
| GitHub Pages | Hosting + deploy | Steven → Sabine | Aktiv |
| Google Analytics 4 | Analytics (G-1T736SKWVT) | Steven → Sabine | Aktiv |
| Google Fonts | Cormorant Garamond + Jost | Ingen konto nødvendig | CDN |

### NPM Dependencies

| Package | Version | Formål |
|---------|---------|--------|
| @11ty/eleventy | ^3.1.2 | Static site generator |
| @playwright/test | ^1.58.2 | E2E testing (CI) |
| http-server | ^14.1.1 | Lokal testserver (CI) |

---

## Underskrift

| | Dato | Underskrift |
|--|------|------------|
| **Leverandør (BygMedAI)** | | |
| **Kunde (Sabine Lindeberg)** | | |

---

*Genereret af BygMedAI. Fase 3 pilot — sabinelindeberg.dk.*
