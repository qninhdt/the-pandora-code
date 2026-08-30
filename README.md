<p align="center">
  <img src="apps/web/public/images/pages/hero-vista.png" alt="A bioluminescent Pandoran forest under the gaze of Polyphemus" width="100%" />
</p>

<h1 align="center">
  🌿 The Pandora Code
</h1>

<p align="center">
  <em>Where wonder becomes understanding,<br/>and an alien moon teaches us the science of our own world.</em>
</p>

<p align="center">
  <a href="#about"><strong>About</strong></a> ·
  <a href="#the-journey"><strong>The Journey</strong></a> ·
  <a href="#what-youll-find-inside"><strong>Inside</strong></a> ·
  <a href="#getting-started"><strong>Get Started</strong></a> ·
  <a href="#credits"><strong>Credits</strong></a> ·
  <a href="#license"><strong>License</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/languages-EN_%7C_VI-ff5da8?style=for-the-badge&labelColor=0e1320" />
  <img src="https://img.shields.io/badge/license-MIT-ffb454?style=for-the-badge&labelColor=0e1320" />
</p>

---

## About

> *Stand on a high ridge on Pandora a little before midday and watch the sky do something the sky on Earth has never once done in four and a half billion years...*

**The Pandora Code** is not a wiki. It is not a fan page. It is a love letter — written in science, illustrated in starlight, addressed to anyone who ever looked up at a fictional sky and wondered: *could this be real?*

Every chapter begins with something strange about the world of Pandora — floating mountains defying gravity, a forest that breathes through fans instead of lungs, a neural network woven from the roots of an entire planet — and ends by pressing a real scientific principle into your hand. Something you can carry back to Earth. Something *true*.

<p align="center">
  <img src="apps/web/public/images/pages/descent-deep.png" alt="Descending into Pandora's bioluminescent depths" width="720" />
  <br/>
  <sub><em>Every chapter is a descent into wonder — fiction is the question, science is the answer.</em></sub>
</p>

## The Journey

The current journey is defined by [`OUTLINE`](apps/web/lib/content/outline.ts), the source of truth for part labels, chapter titles, and reading order.

<p align="center">
  <img src="apps/web/public/images/pages/codex-field.png" alt="Woodsprites drifting through Pandora's bioluminescent forest — seeds of Eywa" width="720" />
  <br/>
  <sub><em>The seeds of the sacred tree drift through the dark, and beneath the soil, the roots remember everything.</em></sub>
</p>

## What You'll Find Inside

- **A science-first journey** — every chapter turns a Pandoran question into a real scientific principle
- **Bilingual content** — every word in both English and Vietnamese
- **A scientific glossary** — an interactive codex of real science, cross-linked and searchable
- **Original painterly illustrations** — speculative-biology field plates, not screenshots
- **3D concept constellation** — an interactive knowledge graph connecting ideas across chapters
- **⌘K instant search** — find anything, diacritic-insensitive, lightning-fast
- **Bookmarks & reading position** — pick up exactly where you left off
- **Chapter audio** — one continuous narration per chapter, opt-in, with a segmented scrubber and speed control
- **SEO, RSS, dynamic OG images** — every chapter is a first-class citizen of the web

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 16 + React 19 |
| Content | MDX via Fumadocs |
| Styling | Tailwind CSS 4 |
| 3D | Three.js + React Three Fiber |
| Animation | Framer Motion |
| Search | MiniSearch (client-side) |
| i18n | next-intl |
| Testing | Vitest + Playwright + Lighthouse CI |
| Package Manager | pnpm 11 (monorepo) |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/qninhdt/the-pandora-code.git
cd the-pandora-code

# Install dependencies (requires Node.js ≥ 22, pnpm ≥ 9)
pnpm install

# Start the development server
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) and step through the airlock.

### Static media and chapter audio

Each chapter is delivered as **one continuous MP3** plus a `*.sections.json`
marker sidecar; the reader's player uses those markers to label and scrub
segments inside that single track. Local development serves images from
`apps/web/public/`, and the prebuild mirrors the chapter MP3s from `tts-out/`
into the ignored `apps/web/public/audio/` path.

For deployment, upload media to Cloudflare R2 and point the app at it. Uploads
use R2's S3 API, so no interactive Cloudflare login is needed — set
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` in
the root `.env` (see `.env.example`), then set `NEXT_PUBLIC_STATIC_BASE` in
`apps/web/.env` to the bucket's public origin:

The `*.r2.cloudflarestorage.com/<bucket>` URL is the authenticated S3 API
endpoint, not a browser-facing public origin. Enable an R2 public `r2.dev`
subdomain or attach a custom domain, then use that public URL for
`NEXT_PUBLIC_STATIC_BASE`.

```bash
node --env-file=.env scripts/r2-sync.mjs --images
node --env-file=.env scripts/r2-sync.mjs --audio
```

The chapter TTS command can render the track and upload it in one pass:

```bash
node --env-file=.env scripts/tvoiceai-chapter-tts.mjs <slug> <en|vi> --mp3 --upload
```

If a chapter was already synthesized as per-section WAVs, assemble the single
track from those renders instead of paying for TTS again:

```bash
node scripts/assemble-chapter-audio.mjs <slug> <en|vi> --mp3
```

The audio manifest is rebuilt during the web app prebuild. To rebuild it manually, run `pnpm --filter web run build:audio-manifest`. Keep the generated manifest committed when production builds do not have the local, gitignored `tts-out/` directory.

## Project Structure

```
the-pandora-code/
├── apps/web/              # Next.js web application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities & design tokens
│   ├── messages/          # Runtime i18n message catalogs
│   └── public/            # Static assets & illustrations
├── content/
│   ├── chapters/          # Slug-keyed MDX chapter content (en + vi)
│   ├── glossary/          # Scientific term definitions
│   ├── authors/           # Author profiles
│   └── art-direction/     # Visual style bible & prompts
├── i18n/
│   └── chapters/          # Chapter translation workspaces
├── scripts/               # Image generation & content tools
└── research/              # Chapter research notes and prompts
```

## Contributing

The forest grows when more hands tend it. If you'd like to contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/your-feature`)
3. **Commit** your changes (`git commit -m 'feat: add something wonderful'`)
4. **Push** to the branch (`git push origin feat/your-feature`)
5. **Open** a Pull Request

Whether it's fixing a typo in a glossary term, suggesting a new chapter topic, improving accessibility, or translating content — every contribution makes the world a little more luminous.

## Credits

**The Pandora Code** is created and maintained by:

- **[qninhdt](https://github.com/qninhdt)** — Creator, developer, and keeper of the code
- **Bardabez** — The in-universe narrator, Pandora's storyteller

### Acknowledgments

- The world of **Pandora** is the creation of **James Cameron** and **Lightstorm Entertainment**. This project is a fan-made educational work and is not affiliated with or endorsed by the franchise.
- Scientific content is sourced from peer-reviewed literature, textbooks, and publicly available research — every claim is cited.
- Illustrations are original AI-assisted painterly compositions following a strict [style bible](content/art-direction/style-bible.md).

## Disclaimer

**Images are AI-assisted. The stories belong to Pandora, but the science belongs to Earth.**

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

The content, illustrations, and written chapters are original creative works. The world of Pandora, its characters, and lore belong to their respective copyright holders.

---

<p align="center">
  <img src="apps/web/public/logo.png" alt="The Pandora Code logo" width="80" />
  <br/><br/>
  <em>"Every chapter opens on something strange about the world<br/>and closes on a principle you can carry back to Earth."</em>
  <br/><br/>
  <strong>Oel ngati kameie.</strong> 🌿
  <br/>
  <sub>I See You.</sub>
</p>
