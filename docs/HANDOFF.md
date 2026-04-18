# Investment Command — Handoff para nuevo chat

> Pegá este archivo entero al arrancar un chat nuevo así el asistente retoma con todo el contexto.

---

## 1. Qué es este proyecto

**Investment Command**: mesa de análisis de inversiones local tipo Bloomberg terminal.

- Analyzer de tickers con 10 tabs (Overview, Fundamentals, Technicals, Valuation, Risk, Moats, Catalysts, Peers, News, AI Verdict + Pre-Trade Checklist).
- News feed con sentiment, portfolio tracker (Binance + CSV broker), screener multi-factor, alertas, briefing diario AI, charts profesionales.
- Todo local, con Next.js 15 + FastAPI (Python) + SQLite + Claude API.
- UX pensada para no-expertos (español argentino, glosario inline, "en criollo" en cada card).

Repo: `salomon1210/Acciones`  
Rama de desarrollo: **`claude/investment-command-app-LpmlR`** (no la `main`).

---

## 2. Estado actual

Las **10 fases del plan original están completas** y commiteadas:

| Fase | Commit |
|---|---|
| 0 — Setup | `chore: project scaffold` |
| 1 — Shell UI | `feat: dark shell with command bar` |
| 2 — Data layer | `feat: data layer with cache and rate-limit` |
| 3 — Analyzer 10 tabs | `feat: full ticker analyzer` |
| 4 — News | `feat: live news feed with sentiment` |
| 5 — Portfolio | `feat: portfolio tracker with Binance sync and CSV import` |
| 6 — AI layer | `feat: Claude AI analysis layer with verdict + news summarization` |
| 7 — Screener | `feat: multi-factor screener with presets` |
| 8 — Alertas | `feat: Phase 8 — alert engine with cron polling` |
| 9 — Briefing | `feat: Phase 9 — daily AI briefing` |
| 10 — Polish | `polish: Phase 10 — loading/error states, not-found, unit tests` |
| Extra | `chore: add seed script for demo watchlist` |
| Extra | `feat: mobile-ready UI (sidebar drawer, responsive TopBar, LAN dev)` |
| Fix | `fix: DATABASE_URL path, node-cron bundling, pandas-ta install` |
| Fix | `fix: Windows-compatible Python dev script` |
| Extra | `feat: one-click Windows start script with firewall setup` |

Checks que pasan:

- `npm run typecheck` → limpio
- `npm run lint` → sin warnings
- `npm test` → 9 tests pasan (vitest)
- `next build` → 24 rutas compilan

---

## 3. Stack

- **Frontend**: Next.js 15 App Router + TS estricto + Tailwind v3 + shadcn/ui + Recharts + Zustand + Zod + sonner.
- **Backend Node**: API Routes de Next.
- **Backend Python** (`py-backend/`): FastAPI en 8001 con yfinance, pandas, ta, numpy, scipy para indicadores, DCF, backtest, Monte Carlo.
- **DB**: SQLite vía Prisma (watchlist, alerts, positions, news, briefings, api cache, análisis history).
- **AI**: `@anthropic-ai/sdk` — Opus para análisis profundos, Haiku para sentiment/resúmenes.
- **Dev runner**: `concurrently` levanta Next + FastAPI. En Windows: `start.cmd` hace todo de un toque.

---

## 4. Estructura

```
Acciones/
├── app/                       # Next.js App Router
│   ├── page.tsx               # Dashboard
│   ├── analyzer/[ticker]/     # 10 tabs de análisis
│   ├── news/, portfolio/, screener/, alerts/, briefing/, glossary/
│   └── api/                   # Routes: analyze, news, portfolio, alerts, briefing, claude, dcf, screener, health
├── components/
│   ├── ui/                    # shadcn primitives + Explain (glosario inline)
│   ├── shell/                 # Sidebar (drawer en mobile), TopBar, CommandBar (Cmd+K), OnboardingTour
│   ├── analyzer/              # las 10 tabs
│   ├── news/, portfolio/, alerts/, briefing/, screener/, charts/
├── lib/
│   ├── api/                   # finnhub, alphavantage, fmp, marketaux, newsapi, coingecko, binance, fred, edgar, claude, yfinance bridge, unified (fallback)
│   ├── analysis/              # fundamentals, technicals, valuation, risk, moats
│   ├── alerts/engine.ts       # motor de alertas (corre cada 60s cliente-side)
│   ├── briefing/service.ts    # briefing generator con Claude + fallback heurístico
│   ├── db/prisma.ts
│   ├── glossary.ts            # diccionario de términos financieros
│   └── utils/                 # format, cache TTL, rate-limiter p-queue
├── py-backend/
│   ├── main.py, requirements.txt
│   └── services/              # dcf, indicators, backtest, montecarlo, yfinance_bridge
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db                 # se crea al correr prisma migrate
├── scripts/
│   ├── seed.ts                # puebla 10 tickers demo
│   └── broker-csv-template.csv
├── tests/fundamentals.test.ts # 9 tests vitest
├── .env, .env.example
├── instrumentation.ts         # NO-OP (dejado así a propósito — ver sección 7)
├── next.config.mjs
├── package.json
├── vitest.config.ts
├── start.cmd                  # one-click Windows
└── docs/HANDOFF.md            # este archivo
```

---

## 5. Variables de entorno

`.env` activo tiene solo:
```
DATABASE_URL="file:./dev.db"
```

`.env.example` documenta todas las keys opcionales. Sin keys, la app corre con mocks/fallbacks informando al usuario. Lista completa:

| Key | Feature | Fallback sin key |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI Verdict, Moat, News summary, Briefing, 10-K risks | Stub "AI deshabilitado" + heurística |
| `FINNHUB_API_KEY` | Quotes real-time, earnings, insider, news | yfinance + mocks |
| `ALPHAVANTAGE_API_KEY` | Overview, statements | yfinance |
| `FMP_API_KEY` | DCF inputs, analyst estimates, peers | yfinance + peers por sector |
| `NEWSAPI_KEY` | News cross-market | solo Marketaux o mock |
| `MARKETAUX_API_KEY` | News financieras con sentiment | solo NewsAPI o mock |
| `COINGECKO_API_KEY` | Cripto | free tier sin key |
| `BINANCE_API_KEY` + `BINANCE_API_SECRET` | Portfolio crypto live | portfolio vacío |
| `FRED_API_KEY` | Macro events (CPI, FOMC, NFP) | calendario mock |

SEC EDGAR y yfinance no requieren key.

---

## 6. Cómo correr

### Windows (usuario actual: HP, user `shelo`)

```
cd C:\Users\shelo\Acciones
git checkout claude/investment-command-app-LpmlR
git pull origin claude/investment-command-app-LpmlR
start.cmd
```

`start.cmd` hace:
1. `npm install` si falta node_modules
2. crea `.env` si falta
3. corre `prisma migrate deploy` + `prisma generate` si falta la DB
4. agrega regla de firewall para puerto 3000 (requiere Administrador)
5. muestra la IP de LAN para acceso desde celu
6. arranca `next dev -H 0.0.0.0 -p 3000`

**No cerrar esa ventana mientras lo uses.** El server se muere cuando la cerrás.

### Mac/Linux

```
npm install
cp .env.example .env
npx prisma migrate deploy
npm run dev:next    # solo Next
npm run dev          # Next + Python (necesita python3)
```

### Acceso desde el celu

Mismo WiFi → Safari/Chrome → `http://<IP-LAN>:3000`  
La IP sale del `ipconfig` (ej. `192.168.2.52`). `start.cmd` la imprime al arrancar.

---

## 7. Decisiones técnicas importantes (no tocar sin pensar)

### 7.1 `instrumentation.ts` es NO-OP a propósito

Durante Fase 8/9 se intentó correr crons server-side con `node-cron` y después con `setInterval`. Webpack trazaba estáticamente `lib/cron/index.ts` → `lib/briefing/service.ts` → `lib/portfolio/service.ts` → `lib/api/binance.ts` (que importa `node:crypto`), y fallaba el build. Los `await import()` dinámicos no rompían la traza estática.

**Solución**: `instrumentation.ts` quedó vacío. Los jobs corren:
- **Alertas**: cliente-side con `setInterval` 60s + fetch a `/api/alerts/check` (ver `components/alerts/AlertsClient.tsx`).
- **Briefing**: manual desde `/briefing` (botón "Generar ahora"). Un cron externo puede llamar a `POST /api/briefing/generate`.

`lib/cron/index.ts` existe pero **no se invoca**. Dejado para futuro uso si se migra a un worker dedicado.

### 7.2 `DATABASE_URL="file:./dev.db"` (no `file:./prisma/dev.db`)

Prisma resuelve paths relativos desde el directorio de `schema.prisma`, no desde la raíz del proyecto. La DB vive en `prisma/dev.db`.

### 7.3 `pandas-ta` → `ta`

`pandas-ta==0.3.14b0` no tiene wheels para Python 3.11+. Se reemplazó por `ta==0.11.0` en `py-backend/requirements.txt`.

### 7.4 Script `dev:py` en Windows

Usa sintaxis cmd (`.venv\Scripts\`, `&` separador, `2>nul`). Hay `dev:py:unix` para Mac/Linux con `.venv/bin/`.

### 7.5 Next dev bind a `0.0.0.0`

`"dev:next": "next dev -H 0.0.0.0"` — necesario para acceder desde otro dispositivo en la LAN.

---

## 8. Problemas conocidos y estado

| Issue | Estado |
|---|---|
| Build limpio en 24 rutas | ✅ resuelto |
| Typecheck, lint, tests | ✅ verde |
| Mobile UI (sidebar drawer, safe-area, input zoom iOS) | ✅ resuelto |
| Windows Python script fallaba en bash | ✅ resuelto con `dev:py` cmd-native |
| node-cron + webpack | ✅ bypassed (client polling) |
| Acceso LAN desde celu | ⚠️ depende del firewall de Windows — `start.cmd` crea la regla si se corre como admin |

---

## 9. UX no-expertos — reglas transversales

1. **Glosario inline** (`components/ui/Explain.tsx`): ícono `?` junto a cada término técnico, tooltip con definición llana + por qué importa + qué valores son buenos/malos. Todo en `lib/glossary.ts`.
2. **Números con contexto**: ningún ratio crudo; siempre con badge (barato/razonable/caro/muy caro) vs benchmark sector.
3. **"En criollo"**: cada card tiene una línea inicial que resume en humano.
4. **AI Verdict en lenguaje humano**: 3 bullets bull / 3 bullets bear escritos para alguien sin formación financiera.
5. **Onboarding tour** (primera visita) + disclaimer en footer de cada página.
6. **Errores en humano**: "No pude traer data de Finnhub, falta la API key. Seguimos con Yahoo Finance." — nunca un código HTTP crudo.
7. **Idioma**: código en inglés, UI en español argentino neutro.

---

## 10. Reglas de código

- TS estricto, cero warnings.
- Zod en todo boundary externo.
- Variables/funciones/comentarios en inglés.
- UI strings en español neutro.
- Commit descriptivo, typecheck + lint + tests verdes antes de pushear.
- No dependencias nuevas sin necesidad.

---

## 11. Próximos pasos sugeridos

Lo que NO está hecho y podría ser "fase 11":

- Cargar las API keys reales (ANTHROPIC, FINNHUB, FMP, MARKETAUX, BINANCE) y verificar el swap-in real vs mocks.
- Seed de producción con la watchlist personal del usuario.
- Deploy opcional: Vercel para Next + Fly/Render para el servicio Python + Turso/Neon para DB.
- PWA (manifest.json + service worker) para "instalar" desde iOS.
- Webhook de alertas a Telegram/Discord (hoy solo toast + Web Notifications).
- Generación de PDF del análisis completo de un ticker (`react-pdf`).
- Página `/settings` para gestionar keys desde la UI en vez de editar `.env`.

---

## 12. Comandos de emergencia

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Tests
npm test

# Build de producción (verifica todo)
npx next build

# Reset de la DB (borra todo)
rm -f prisma/dev.db && npx prisma migrate deploy

# Borrar y reinstalar deps Node
rm -rf node_modules package-lock.json && npm install

# Borrar y reinstalar venv Python
rm -rf py-backend/.venv && cd py-backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

---

## 13. Cómo retomar con un chat nuevo

Mensaje inicial sugerido para el nuevo chat:

> Estoy trabajando en Investment Command, repo `salomon1210/Acciones`, rama `claude/investment-command-app-LpmlR`. Leé `docs/HANDOFF.md` del repo y retomá desde ahí. [Describí el problema puntual o la siguiente feature que querés]

El asistente nuevo debería:
1. Leer `docs/HANDOFF.md`
2. Correr `git status` + `git log --oneline -20`
3. Preguntarte qué querés hacer a continuación si no está claro.
