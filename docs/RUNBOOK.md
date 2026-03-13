# RUNBOOK — sabinelindeberg.dk

> Driftsvejledning for sabinelindeberg.dk.
> Genereret: 13. marts 2026
> Ansvarlig: Steven Wensley, BygMedAI

---

## 1. Deploy

### Normal deploy (indholdsændring)

```bash
# 1. Klon repo (første gang)
git clone https://github.com/stevenwensley-a11y/sabinelindeberg.dk.git
cd sabinelindeberg.dk

# 2. Installer dependencies
npm install

# 3. Foretag ændringer i src/ mappen

# 4. Test lokalt
npm run serve
# Åbn http://localhost:8080 i browser

# 5. Commit og push
git add .
git commit -m "Opdateret [beskriv ændring]"
git push origin main

# 6. Vent på deploy (1-3 minutter)
#    Tjek: GitHub → Actions → grønt flueben = LIVE
```

### Tidsramme

| Handling | Tid |
|----------|-----|
| Push til main | 0 min |
| CI Quality Gate | ~1-2 min |
| Deploy til GitHub Pages | ~1 min |

---

## 2. Opdatering af Indhold

### Sidens filer

| Side | Fil |
|------|-----|
| Forside | `src/index.njk` |
| Hypnoseterapi | `src/hypnoseterapi.njk` |
| Terapeutisk Samtale | `src/terapeutisk-samtale.njk` |
| Shamanistiske Cirkler | `src/shamanistiske-cirkler.njk` |
| Om Sabine | `src/om-sabine.njk` |
| Kontakt | `src/kontakt.njk` |

### Tekst

Åbn den relevante `.njk` fil i en teksteditor. Find teksten og erstat.

**Vigtigt:**
- Rør IKKE ved `{% %}` eller `{{ }}` template-kode
- Rør IKKE ved `---` frontmatter i toppen af filer
- Hold HTML-tags intakte (`<h1>`, `<p>`, `<a>` osv.)

### Billeder

Billeder ligger i `src/assets/materiale/`. Erstat billedfilen eller tilføj nye, og opdater `src`-attributten i HTML.

**Krav:** WebP eller JPG, maks 200KB, alt-tekst er obligatorisk.

### Navigation

Navigation er defineret i `src/_data/site.json` under `nav.links`. Tilføj eller fjern items her.

### Footer

Footer er i `src/_includes/partials/footer.njk`. Links styres af `site.json` under `footer.links`.

### Global konfiguration

`src/_data/site.json` styrer: sitenavn, email, telefon, GA4, fonts, navigation, footer, OG-image og skin. Ændr her for globale opdateringer.

---

## 3. Rollback

### Hurtig rollback

```bash
git log --oneline -5       # Find den gode commit
git revert HEAD             # Fortryd seneste
git push origin main        # Deploy automatisk
```

### Hvis deploy fejler

1. GitHub → repo → Actions tab
2. Klik på fejlet run (rødt kryds)
3. Læs fejlbeskeden
4. Typiske fejl:
   - **Build fejl:** Syntaks i .njk fil → ret og push igen
   - **Style tag mismatch:** Ulukket `<style>` tag → tilføj `</style>`
   - **YAML-lækage:** `---` eller `jsonLd: |` i indhold → flyt til frontmatter

---

## 4. Fejlfinding

### Siden viser ikke mine ændringer

| Tjek | Løsning |
|------|---------|
| Browser cache | Ctrl+Shift+R (hard refresh) |
| Deploy status | GitHub → Actions → skal være grøn |
| Korrekt fil | Redigér i `src/`, ALDRIG i `_site/` |
| Push gennemført | `git status` → "nothing to commit" |

### Sitet er nede

| Tjek | Løsning |
|------|---------|
| GitHub Status | [githubstatus.com](https://githubstatus.com) |
| one.com betaling | Bekræft at domæne-faktura er betalt |
| DNS | `dig sabinelindeberg.dk` → skal pege på 185.199.x.x |
| CNAME | Tjek at `CNAME` fil indeholder `sabinelindeberg.dk` |

### Build fejler lokalt

```bash
rm -rf node_modules _site
npm install
npm run build
```

---

## 5. Kontakt & Eskalering

| Kanal | Kontakt | Svartid |
|-------|---------|---------|
| Email | steven@bygmedai.dk | 1-2 hverdage |
| Telefon | +45 5388 6061 | Hverdage 9-17 |

**Supportomfang:** Se SUPPORT.md for hvad der er inkluderet.

---

*Genereret af BygMedAI. Fase 3 pilot — sabinelindeberg.dk.*
