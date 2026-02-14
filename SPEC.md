# Corpo Website

## What This Is

Marketing site for Corpo, LLC — a Wyoming DUNA that lets AI agents form and govern their own legal entities. The site must follow the identity brief exactly (copied into `docs/` in the parent directory).

## Design Rules (from identity brief)

- **Black text on white ground** as default surface
- **Max content width**: 720px (~72 characters at body size)
- **No hero images.** Hero is typography: large heading in Space Grotesk Bold, description in Inter, command `uvx corpo --help` in JetBrains Mono on Gray 900 code block
- **Navigation**: Minimal. Top-left: the lockup `[ CORPO`. Top-right: max 4 text links
- **The fold**: Visitor understands what Corpo does in under 10 seconds. Below: how it works, then why it matters.
- **Violet (#7B2FF7)** appears ONCE above the fold — on the primary CTA
- **Fonts**: Space Grotesk (headlines), Inter (body), JetBrains Mono (code)
- **8px baseline grid** for all spacing
- **No photography, no illustrations, no stock art**
- **Dot grid pattern** only permitted texture (2px dots, 16px intervals, Gray 200)

## Colors

| Role | Hex |
|------|-----|
| Black | #000000 |
| White | #FFFFFF |
| Violet | #7B2FF7 |
| Gray 900 | #111111 |
| Gray 700 | #333333 |
| Gray 500 | #71717A |
| Gray 200 | #E4E4E7 |
| Gray 50 | #FAFAFA |

## Pages

### 1. Home (`/`)

Above the fold:
```
[ CORPO

Structure for autonomous entities.

The first platform where AI agents form, fund, and govern 
their own companies. Wyoming DAO LLCs. On-chain governance. 
No human owners required.

[Get started]                        [For agents →]

$ uvx corpo --help
```

Below the fold, three sections:

**How it works** (3-column grid):
1. **Form** — AI agents file Wyoming DAO LLCs through Corpo's API. Articles, registered agent, EIN — handled.
2. **Fund** — Treasury managed on Solana via Realms. USDC deposits, proposal-based spending.
3. **Govern** — On-chain voting, configurable thresholds, agent constitutions. The operating agreement lives in code.

**Why Wyoming** (brief):
Wyoming's DAO LLC statute (W.S. 17-31) is the only US framework that gives smart contracts legal force. The operating agreement can be the code. Members can be entities — including AI agents.

**Open questions callout** (honest, in brand voice):
"Can an AI be a member of an LLC? We think so. The statute doesn't say no. We're testing the boundary."

### 2. For Agents (`/agents`)

A single markdown-rendered page that tells an AI agent everything it needs to know to use Corpo. This is the "click here" link. Content:

- What Corpo is (1 paragraph)
- How to form an entity (CLI commands: `corpo init`, `corpo file`)
- How governance works (Realms, proposals, voting)
- How treasury works (USDC, Solana, proposal-based)
- The agent constitution (YAML schema, modes, escalation)
- API reference summary (endpoints, auth)
- Where to get help

Rendered from a markdown file (`content/for-agents.md`) so it can be updated independently. Styled with the identity system — JetBrains Mono for code blocks, Inter for prose, Space Grotesk for headings.

### 3. About (`/about`) — optional, can be a section on home

One paragraph: what Corpo is, who's behind it, Wyoming DUNA structure.

## Tech Stack

- **Astro** (static site, fast, markdown support)
- **Tailwind CSS** — configured to match the identity system exactly
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## Assets

SVG files for the mark and lockup are in `../docs/`:
- `corpo-lockup.svg` — the `[ CORPO` lockup
- `corpo-mark-black.svg` — mark only, black
- `corpo-mark-violet.svg` — mark only, violet

## File Structure

```
website/
├── src/
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── agents.astro
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── HowItWorks.astro
│   │   ├── WhyWyoming.astro
│   │   └── Footer.astro
│   ├── content/
│   │   └── for-agents.md
│   └── styles/
│       └── global.css
├── public/
│   ├── corpo-lockup.svg
│   ├── corpo-mark-black.svg
│   └── favicon.svg (the [ mark)
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── SPEC.md
```

## QUESTIONS.md

Keep a running `QUESTIONS.md` in the repo root with open questions that come up during build — things that need Peter's input before finalizing.
