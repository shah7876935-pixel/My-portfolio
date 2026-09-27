# AGENTS.md — Ahmad Shah Portfolio Website

**Permanent development guide for this repository.**
Every coding agent (human or AI) working on this project must read this file **before** making any change.

> **Golden rule:** *Preserve functionality first. Improve visual design second.*

---

## 1. Project Overview

| Item | Value |
| --- | --- |
| Project name | Ahmad Shah — Personal Portfolio (`ahmad-portfolio`) |
| Owner | Ahmad Shah — Web Developer & AI Enthusiast |
| Project root | `C:\Users\lapstore\Desktop\Ahmad portfolio` |
| Git remote | `https://github.com/shah7876935-pixel/My-portfolio.git` |
| Branch | `main` |
| Live site | `https://dazzling-kitsune-b242ff.netlify.app/` (see `portfolio link.txt`) |
| Node.js | v24.21.0 (CommonJS — `"type": "commonjs"`) |
| Frontend | Vanilla HTML / CSS / JavaScript (no framework, no build step) |
| Backend | Node.js + Express 5 + OpenAI SDK 7 + dotenv |

**Target feel:** a premium, modern, futuristic, professional, elegant, clean, smooth,
interactive, fast, responsive developer + AI portfolio — not a beginner template.

**Architectural rule:** this project is intentionally **dependency-light and build-less**.
The static frontend is served directly by the same Express process that proxies the AI
chatbot. Do not introduce a bundler, framework, or CSS preprocessor unless the user
explicitly asks for it and you have explained the cost.

---

## 2. Current Project Structure

```
Ahmad portfolio/
├── index.html              # Single-page site: nav, hero, about, skills, projects, contact, chatbot, footer
├── style.css               # All styling (~1850 lines, plain CSS, no preprocessor)
├── script.js               # All client JS: nav, scroll reveal, chat, keyboard, contact status
├── server.js               # Express server: static hosting + POST /api/chat proxy to OpenAI
├── package.json            # deps: express, openai, dotenv
├── package-lock.json
├── .env                    # OPENAI_API_KEY — NEVER read aloud, never commit, never print
├── .gitignore              # .env, node_modules/
├── portfolio link.txt      # Netlify live URL
├── Music - Shortcut.lnk    # stray user file — leave alone, never commit
├── AGENTS.md               # this file
└── node_modules/           # installed deps
```

There is **no** `src/`, no `public/`, no build output, no test suite, no CI.
Frontend and backend share one flat root directory. Keep it that way unless told otherwise.

### 2.1 Known deployment gap (read before touching the chatbot)

The live site is **static Netlify hosting**, but the chatbot needs a running Node
process. These two facts do not currently line up:

- **Locally** `node server.js` serves the site and `/api/chat` works.
- **On Netlify** there is no Express process, so `POST /api/chat` returns 404 and the
  chatbot is broken on the live site.
- Netlify also publishes the whole repo root, so `server.js`, `package.json` and
  `AGENTS.md` are reachable as static files. The `PUBLIC_FILES` allowlist in
  `server.js` protects localhost only — it has no effect on Netlify.

Resolving this needs either a Netlify Function, a real Node host, or an explicit
decision to keep the chatbot local-only. **Do not silently assume the deployed
chatbot works.** See §21.

---

## 3. Architecture & Data Flow

### 3.1 Frontend → Backend

```
User types in #userInput
        │
        ▼
script.js  sendMessage()
        │  adds .user-message bubble
        │  adds "Thinking... 🤖" .bot-message bubble
        ▼
fetch("POST /api/chat", { message })
        │  JSON: { "message": "..." }
        ▼
server.js  app.post("/api/chat")
        │  validates non-empty message
        │  client.responses.create({ model, instructions, input, max_output_tokens: 1500 })
        ▼
OpenAI API  →  response.output_text
        │
        ▼
res.json({ reply })        // or { error } with status 400 / 500
        │
        ▼
script.js replaces the thinking bubble text with data.reply
```

**The API contract is `/api/chat` (POST) in, `{ reply }` / `{ error }` out.**
This contract is shared between `index.html`, `script.js`, and `server.js`.
If you change it, you must change **all three** and verify end-to-end.

### 3.2 Key element IDs (referenced from both HTML and JS — do not rename casually)

| Selector | File | Role |
| --- | --- | --- |
| `#chatButton` | `index.html`, `style.css` | Floating launcher button |
| `#chatWindow` | `index.html`, `style.css`, `script.js` | Chat panel (hidden by default) |
| `#chatMessages` | `index.html`, `style.css`, `script.js` | Scrollable message list |
| `#userInput` | `index.html`, `style.css`, `script.js` | Text input |
| `.chatbot`, `.chat-header`, `.chat-input` | `index.html`, `style.css` | Chat layout |
| `.bot-message`, `.user-message` | `script.js`, `style.css` | Message bubbles |
| `.btn`, `.btn.second` | `index.html`, `style.css` | Hero CTAs |
| `.section-title` | `index.html`, `style.css` | Section headings |
| `.hero`, `.hero-text`, `.small-title` | `index.html`, `style.css` | Hero section |
| `.about-box`, `.skills-container` / `.skill`, `.projects-container` / `.project`, `.contact-box` | `index.html`, `style.css` | Content sections |
| `#home`, `#about`, `#skills`, `#projects`, `#contact` | `index.html`, `style.css` | Nav anchors / section IDs |

### 3.3 Global JS functions (called from inline `onclick` in `index.html`)

`showMessage()`, `openChat()`, `closeChat()`, `sendMessage()`.

They are wired via **inline `onclick` attributes**, not `addEventListener`.
If you move to event listeners, you must remove every inline handler at the same time —
leaving both will cause double-firing.

---

## 4. Non-Negotiable Preservation Rules

1. **Inspect the project first.** Read `index.html`, `style.css`, `script.js`, `server.js`, `package.json` before editing anything.
2. **Preserve all working functionality.** The site, nav anchors, and chatbot must keep working after every change.
3. **Never delete existing sections** (`#home`, `#about`, `#skills`, `#projects`, `#contact`, chatbot, footer) unless explicitly requested.
4. **Never break the AI chatbot.** Any change to `server.js`, `/api/chat`, or the fetch call must be tested with a real message.
5. **Never expose API keys.** Not in HTML, CSS, browser JS, comments, logs, screenshots, or this document. See §15.
6. **Never remove real content** to "clean up". Placeholders stay until the user supplies real data.
7. **Improve existing files; do not create duplicates.** No `index2.html`, no `style2.css`, no `main.js` alongside `script.js`.
8. **Do not invent facts.** No fake jobs, clients, degrees, certifications, testimonials, GitHub stats, or project links. See §7.
9. **There are uncommitted user changes in `index.html`** (chatbot launcher emoji and the chat header label). They are intentional user work — never revert or "clean them up". Check `git status` before and after your work.
10. **Verify after every change.** Reload the page and confirm nothing else broke.

---

## 5. How to Run & Verify

```bash
# Install (only if node_modules is missing)
npm install

# Start the server  ->  http://localhost:3000
node server.js
# or, after adding a start script:
npm start
```

**Windows note:** PowerShell blocks `npm.ps1` on this machine
(*"running scripts is disabled on this system"*). Use `npm.cmd install` /
`npm.cmd start` / `npx.cmd ...` if plain `npm` fails with a `PSSecurityException`.

### Verification checklist (run through this after every change)

- [ ] `git status` — no unexpected files modified or deleted
- [ ] Server starts with no errors and prints the startup banner
- [ ] Home page renders at `http://localhost:3000` with hero, about, skills, projects, contact
- [ ] All 5 nav links jump to their sections
- [ ] Chat launcher opens and closes the chat window
- [ ] Typing a message and pressing **Enter** sends it
- [ ] Clicking **Send** sends it
- [ ] A real AI reply appears (this requires a working `.env` + valid model id)
- [ ] Contact button still responds
- [ ] No error in the browser console or server terminal
- [ ] No horizontal scrollbar at 1440px, 1024px, 768px, 375px widths
- [ ] Chatbot works on a narrow mobile viewport
- [ ] No secret appears in the browser network tab, page source, or console

---

## 6. Design Direction (Future Upgrades)

The end state is a **premium modern developer portfolio**: modern AI-developer
portfolio + futuristic technology + premium UI + clean professional design + smooth interactions.

**Deliberately avoid:** beginner/basic templates, cheap-looking effects, excessive neon,
excessive animation, clutter, random colors, poor spacing, unprofessional typography,
childish or overly colorful styling.

### 6.1 Visual system to build and keep consistent

| Area | Requirement |
| --- | --- |
| **Typography** | A real type scale (display → heading → body → small). Line-height 1.6–1.8 for body. Remove `Arial, sans-serif` as the only font. |
| **Spacing** | A consistent rhythm (e.g. 8px base scale). Sections currently use `padding: 100px 8%` — unify it into tokens. |
| **Layout** | Consistent container width; `8%` gutters are currently used ad hoc. |
| **Cards** | One card treatment for skills, projects, about, and contact — same radius, border, shadow, hover. |
| **Buttons** | One primary, one secondary (outline/ghost), consistent radius + padding + transitions. |
| **Navigation** | Fixed/sticky, clean logo, smooth hover, visible **active section** highlight, blur/translucent background, real mobile nav. **Must never overlap content.** |
| **Sections** | Consistent vertical rhythm and a clear heading + subheading pattern. |
| **Depth** | Controlled shadows and layering; consistent `z-index` scale. |

### 6.2 Background system

Build a sophisticated layered background:

- Dark premium base (the current `#0b0f19` is a reasonable starting point)
- Subtle linear + radial gradients
- Very low-opacity animated gradient / aurora glow
- Subtle grid or dot pattern overlay
- Glass-like (glassmorphism) surfaces with `backdrop-filter`
- Soft light sources, carefully controlled shadows and vignette
- Fixed background attachment so depth is stable while scrolling

**Constraints:** it must stay readable and must not make the site hard to use.
Never stack heavy filters on scrolling content. Never let animation run continuously at
high cost — see §10 (Animations) and §13 (Performance).

### 6.3 Color system

Accent stays in the **cyan/blue family** (current `#00e5ff` is the seed), but the palette
must be systematized as tokens (custom properties), for example:

```css
:root{
  --bg:            /* page base          */
  --bg-elevated:   /* cards, chatbot     */
  --bg-input:      /* input fields       */
  --text:          /* primary text       */
  --text-muted:    /* secondary text     */
  --border:        /* hairline borders   */
  --accent:        /* cyan               */
  --accent-strong: /* hover / emphasis   */
  --on-accent:     /* text on accent     */
}
```

Then **every** rule — buttons, links, headings, highlights, borders, cards, hover states,
the chatbot, and focus rings — must reference these tokens. Contrast must stay readable
(aim for WCAG AA: 4.5:1 body text, 3:1 large text/UI).
Do **not** introduce unrelated hues. Do not start rewriting the palette mid-task without
converting the whole file consistently.

---

## 7. Honesty & Content Rules

The site describes a **learner / early-career developer** who is learning web development
and AI and enjoys building modern websites and useful digital projects.

- **Never fabricate** qualifications, degrees, employers, clients, awards, years of
  experience, testimonials, certifications, or "expert" claims.
- **Never fabricate** skill percentages. Progress bars are allowed **only** when the number
  is meaningful and honest (see §8.4).
- **Never invent** project URLs, repo links, or live demos. The project buttons currently
  have no `href` — keep them as clearly-labelled non-links (or ask the user for real URLs).
- **Never invent** contact details. The email is currently the placeholder `your@email.com`.
  Keep placeholders in place and mark them clearly (`TODO`) until the user provides real values.
- Real content that exists in the project must be preserved verbatim in meaning.

---

## 8. Section-by-Section Upgrade Brief

### 8.1 Navigation (`header` + `nav`)
Fixed/sticky, blurred translucent background, clean logo, hover transitions, clear
**active-section** indicator driven by scroll position, and a proper **responsive mobile
navigation** (hamburger/collapsible menu with correct `aria-expanded` state).
The current mobile rule simply stacks the header into a column, which makes a fixed
header grow tall enough to collide with content — fix this rather than stacking again.
Navigation elements must never overlap.

### 8.2 Hero (`#home`) — the strongest section
Must immediately communicate:

- **Ahmad Shah** (strong headline)
- **Web Developer & AI Enthusiast** (professional subtitle)
- Short introduction
- Clear calls to action — existing buttons: **View Projects** (`#projects`) and
  **Contact Me** (`#contact`). "Explore My Work" is an acceptable third; don't add more.
- Modern visual treatment, premium background, smooth entrance animation, generous
  spacing, full responsiveness.

The `😍` launcher emoji and the **AI AHMAD** header are the user's current choices — keep them
unless the user asks otherwise.

### 8.3 About (`#about`)
Visually interesting but professional: short introduction, developer/AI interests, learning
and project focus. Use modern cards, spacing and subtle effects. No invented credentials.

### 8.4 Skills (`#skills`)
Existing skills to preserve: **HTML, CSS, JavaScript, AI (AI & Chatbot Projects)**.
Reasonable additions the user has sanctioned: **Web Development**, **Chatbot Development**,
**Node.js** (Node.js is genuinely used by this project's backend).

Modern skill cards with: inline SVG or icon, hover effect, optional progress-style visual
**only when meaningful**, glassmorphism / glow used consistently.
Do not claim professional expertise or certifications.

### 8.5 Projects (`#projects`)
Preserve all three existing projects: **Portfolio Website**, **AI Chatbot**,
**Web Project**. Each card needs title, description, tech info where truthfully available,
a project action, modern card treatment, hover animation, and clear hierarchy.
The "AI Chatbot" card's button currently reads **Coming Soon** — that is honest; keep it
unless the chatbot is publicly deployed.

### 8.6 Contact (`#contact`)
Clean and professional: email, a contact button, social links **if the user provides them**,
modern contact card, strong call-to-action.
The current handler is `onclick="showMessage()"` → `alert(...)`. Upgrading this to an
in-page success state (or a real `mailto:`) is welcome, but it is a behaviour change —
mention it in your report.

### 8.7 Footer
Minimal and professional. Year is currently hard-coded as 2026; consider deriving it from
`new Date().getFullYear()`.

---

## 9. AI Chatbot Rules (Critical)

The chatbot is a **core feature** and a **general-purpose AI assistant** — it is
deliberately *not* limited to portfolio questions.

It must handle: general knowledge, programming, web development, HTML/CSS/JavaScript,
mathematics, science, education, writing, translation, technology, and everyday questions.
The existing server-side `instructions` block already encodes this and is well written —
**preserve its intent** when touching `server.js`.

### 9.1 UI redesign targets
Rebuild the chat UI to match the new premium site, improving all of:
chat window, header, message bubbles, user vs AI bubbles, input area, send button,
close button, loading/"thinking" state, error state, scroll behavior, mobile layout,
and open/close animations.

### 9.2 UX requirements (all of these)
- Smooth open and close animation
- Clear, consistent AI identity
- Clean bubbles with good spacing and readable text
- Proper typing area with a **visible** send button
- **Enter sends**, Shift+Enter for a newline
- Visible loading / "Thinking…" indicator
- Friendly error message on failure (never a raw exception)
- Auto-scroll to the newest message
- Fully functional on mobile and desktop
- Input cleared after send, and re-enabled after a reply (it currently stays usable
  during a request, which allows duplicate sends — fix this if you touch the flow)

### 9.3 Hard constraints
- **Never** hard-code an API key in `index.html`, `style.css`, or any browser-side JS.
- The key lives **only** in `.env` as `OPENAI_API_KEY` and is read **only** in `server.js`
  via `require("dotenv").config()` and `process.env.OPENAI_API_KEY`.
- The browser must only ever call the relative path `/api/chat`. Never call OpenAI
  directly from the frontend.
- **Preserve the backend architecture** (single Express process serving static files +
  `/api/chat`) unless there is a clear, explained reason to change it.
- Never echo the key, the full env file, or raw upstream error bodies into logs or responses.

### 9.4 Known chatbot issues (verify before "fixing" — they may already be resolved)

1. **Model id `gpt-5.6-luna` (`server.js`).** Status as of the last test: **unverified,
   not proven bad.** A live request returned HTTP 500, but the server log showed
   `429 insufficient_quota` / `code: credit_balance_exhausted` — *"You have no credits
   remaining."* The request was rejected at the billing layer, so it never reached model
   validation and this id was neither confirmed nor cleared. Do not change it on a hunch.
   Add credits, send a real message, and only then judge the id from the actual error.
2. **OpenAI account credits.** A depleted balance is the one confirmed cause of a 500
   so far. It is a billing problem, not a code problem, and cannot be fixed in this repo.
   Fix at https://platform.openai.com/settings/organization/billing/
3. **`#chatWindow` open/close uses inline `display`.** **Already resolved** — `openChat()`
   and `closeChat()` now toggle an `.is-open` class, so CSS transitions fire.
4. **Error strings were mixed-language** in `script.js`. **Already resolved** — all
   chatbot messages are now consistent English.
5. **Input stayed usable during a request**, allowing duplicate sends. **Already
   resolved** — `setChatBusy()` disables the input and send button until the reply lands.
6. **No rate limiting or message cap** on `/api/chat`. Still open. Consider it if the site
   is deployed publicly, but never at the cost of breaking the feature. Note that a
   public, unmetered chatbot proxy is a spend risk for the site owner.

---

## 10. Animations

Modern, subtle, purposeful: fade-in, slide-up, hover lift, glow, button transitions,
card hover, scroll-triggered section reveal, smooth nav.

- **Section reveal** should use `IntersectionObserver` and add a class — not a scroll listener.
- Animate `transform` and `opacity`; avoid animating layout properties.
- **Always** ship a reduced-motion escape hatch:

```css
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

  The current global `* { scroll-behavior: smooth }` must remain overridable by this rule.
- **Never** animate so much that the site becomes hard to read or use.

---

## 11. Responsive Design

Must work on desktop, laptop, tablet, and mobile. Test at minimum:
**1440px, 1280px, 1024px, 768px, 480px, 375px.**

Priority areas: navigation, hero, cards, buttons, chatbot, text sizes, spacing.

Hard requirements:

- **No horizontal scrolling at any width.** Add a guard while testing:
  `document.documentElement.scrollWidth` must never exceed
  `document.documentElement.clientWidth`. Common culprits: fixed-width elements, long
  unbroken strings/URLs, `100vw` (which includes the scrollbar), and chat bubbles.
- Use fluid type (`clamp()`) for headings rather than fixed `px` that only gets patched
  in media queries.
- Chatbot: on mobile it should be near-full-width with a visible input and send button,
  and must not be covered by the on-screen keyboard or run off-screen.
- Prefer one well-built breakpoint set over many one-off patches.

---

## 12. Code Quality

Keep the code clean, organized, readable, maintainable, reusable, and efficient.

- Match the existing style: 4-space indent, double-quoted JS strings, one blank line
  between logical blocks, and the existing `/* ===== SECTION ===== */` banner comments in CSS.
- Meaningful names. Comments only where they add value — not narration of obvious code.
- **Avoid:** duplicated code, unnecessary libraries, unnecessary files, broken selectors,
  conflicting CSS, unused JavaScript, dead code, and hard-coded secrets.
- **CSS hazard to be aware of:** `style.css` currently styles the bare element selector
  `button` globally (`padding`, `background`, `color`, `font-weight`, plus
  `transform` on hover). That leaks into the chatbot header close button, the Send button,
  and every project button. When restyling buttons, narrow the selector (e.g. `.btn`) and
  verify the chatbot and project buttons still look right.
- Add a dependency **only** if you can state plainly why the vanilla solution will not do.

---

## 13. Performance

- No build step means every dependency shipped to the browser is permanent — keep the
  frontend dependency-free (or justify it).
- No heavy images: prefer inline SVG, CSS gradients, and modern formats (`WebP`/`AVIF`)
  with explicit `width`/`height` to avoid layout shift.
- Lazy-load below-the-fold media; use `font-display: swap` for web fonts.
- Prefer CSS-only animation over JS animation loops; `IntersectionObserver` over scroll handlers.
- Keep the animated background cheap: limit blur/filter layers and simultaneous animations.
- Target a fast first paint; do not regress it while making things prettier.

---

## 14. Accessibility

Improve where practical, and **never trade accessibility for visual effects**.

- Semantic HTML: add a `<main>` wrapper, keep one `<h1>`, and use a logical heading order.
  The page currently has **no `<main>` landmark**.
- Color contrast: WCAG AA minimum (4.5:1 body text, 3:1 large text and UI boundaries).
- **Visible focus states** — e.g. `:focus-visible` with an accent ring. None exist today.
- Keyboard accessibility: everything must be reachable and operable by keyboard; the
  mobile nav toggle needs correct `aria-expanded`; the chat window should be focusable
  and `Esc`-closable.
- **Meaningful labels:** the launcher button is currently emoji-only and the close button
  is a bare `×` — add `aria-label`s. The chat input needs a `<label>` (visually hidden is fine).
- Useful `alt` text on any image added later.
- Proper `<form>`/labels if a contact form is ever added.
- Never remove focus outlines without replacing them with something visible.

---

## 15. Security

**Never expose:** API keys, secret tokens, passwords, private credentials.

- The API key lives **only** in `.env` (`OPENAI_API_KEY`), which is **already** in `.gitignore`.
  Keep it that way; `.gitignore` must always contain at least:
  ```
  .env
  node_modules/
  ```
- Never add a key to HTML, CSS, browser JS, `package.json`, comments, or documentation.
- Never log `process.env` or the key while debugging. Log a boolean check instead:
  `console.log("Key loaded:", Boolean(process.env.OPENAI_API_KEY))`.
- Never return raw upstream error details (which can contain key fragments) to the client —
  return a friendly message and log server-side only, as the current code does.
- The site is deployed publicly (Netlify). Anything added to the frontend is public.

**Before finishing any task that touched secrets, verify:** the key does not appear in
`index.html`, `style.css`, `script.js`, `package.json`, `AGENTS.md`, git-tracked files,
or the browser network tab.

---

## 16. Git Safety

Before any significant change:

```bash
git status          # understand what is already modified
git diff            # read the actual changes
git log --oneline   # understand history
```

Current state to be aware of: branch `main`, **two commits** —
`df2404f first commit` and `3c5b6e4 Redesign: premium UI, accessibility and responsive layout`
(both pushed to `origin/main`). The redesign is therefore the live source of truth;
there is no longer a pile of uncommitted work. The only untracked file is
`Music - Shortcut.lnk`, which is a stray user file and must stay that way.

- **Do not delete user work.** Uncommitted changes are precious — commit or leave them,
  never discard.
- **Do not overwrite important files** unnecessarily. Prefer targeted edits over rewrites.
- **No destructive Git commands** (`reset --hard`, `clean -fd`, `checkout --`, force push,
  history rewrite, or deleting branches) unless the user explicitly asks.
- Make small, reviewable commits with clear messages when committing is requested.
- Never commit `.env` or `node_modules/`.

---

## 17. Debugging Procedure

1. **Reproduce** the problem — describe the exact steps and observed vs expected behavior.
2. **Inspect** the relevant files. Check the browser console, the network tab, and the
   server terminal together.
3. **Identify the actual root cause.** Do not guess-patch.
4. **Fix the root cause**, minimally and in the file that owns the problem.
5. **Do not** randomly rewrite unrelated files. Do not "fix" things you have not verified
   are broken.
6. **Test the fix** and re-run the §5 verification checklist.
7. **Confirm the rest of the site still works** — especially the chatbot and nav anchors.

### Chatbot-specific triage order

1. Frontend — is the request firing? (`fetch("/api/chat")` present, correct body `{ message }`)
2. Backend — is the route reached? (log inside `app.post("/api/chat")`)
3. Environment — is `OPENAI_API_KEY` present in `.env` and loaded? (check `Boolean(...)`, never print it)
4. Upstream — is the **model id** valid for this account? Any auth/quota/rate-limit error?
5. Response shape — does the client receive `{ reply }` as `script.js` expects?
6. Error handling — is the user shown a friendly message rather than a raw error?
7. Network/CORS — same-origin relative URL, so CORS should not be involved; if it is, the
   frontend is calling a different host than the server.

**While debugging, never print or screenshot the API key.**

---

## 18. Workflow for Future Upgrade Requests

When the user asks to upgrade, redesign, debug, or extend the site:

**FIRST — understand**
1. Inspect the project (read the actual files; don't rely on memory).
2. Read this `AGENTS.md`.
3. Understand the existing architecture and the §3 data flow.
4. Check `git status` / `git diff` for existing user work.
5. Identify what can be improved, and what must not be touched.

**THEN — act**
6. Make the requested changes only, in the existing files.
7. Preserve working functionality (§4).
8. Never expose secrets (§15).
9. Test using §5.

**THEN — report**
10. State clearly what changed, which files were touched, and what you verified.
11. Call out anything you deliberately did **not** change, and any placeholders you left
    (e.g. `your@email.com`, project buttons without links).
12. Ask before inventing content or adding dependencies.

**Never** blindly replace the entire project. Never start a redesign without stating the plan first.

---

## 19. Scope of a Single Task

- Prefer **one focused, complete change** over many half-finished ones.
- Touch the fewest files that can fully solve the problem.
- If a request is ambiguous (e.g. "make it look better"), propose a concrete plan and get
  confirmation before a large visual rewrite.
- If you discover unrelated bugs, report them — don't silently fix them mid-task.

---

## 20. Design Philosophy (Summary)

**Modern AI developer portfolio**  **+**  **futuristic technology**  **+**  **premium UI**
**+**  **clean professional design**  **+**  **smooth interactions**

Restrained color, generous whitespace, one coherent type scale, consistent card and button
treatments, layered depth, subtle motion, real responsiveness, real accessibility, and zero
secrets in the browser.

**Not this:** neon overload, rainbow gradients, bouncing elements, cluttered cards,
default browser buttons, uneven spacing, fake metrics, or a chatbot that only answers
questions about the portfolio.

---

## 21. Deployment & the Live Site

The public URL is `https://dazzling-kitsune-b242ff.netlify.app/` (see `portfolio link.txt`).
Two facts about it are easy to get wrong, so state them plainly in any report:

1. **The deployed site is static Netlify hosting.** `server.js` runs only on localhost.
   Therefore the AI chatbot **does not work on the live site** — `POST /api/chat` has
   no handler there. Never report "the chatbot is live" without saying which host was tested.
2. **The live site is currently password-protected** (HTTP 401, `Server: Netlify`).
   Visitors cannot see the portfolio until that protection is turned off in the Netlify
   UI. This cannot be fixed from the repository.

**Pushing to `main` is what updates the live site**, but only if the Netlify site is
linked to this GitHub repo. Confirm the deploy actually happened before claiming the
redes is live; a successful `git push` alone does not prove a deploy.

**Repo files are published as static assets.** `.env` is safe (it is gitignored, so it is
never in the repo), but `server.js`, `package.json` and `AGENTS.md` are all reachable on
the live site. None of them contain the API key, so this is tidiness rather than a
leak, but it is fixed properly with a `netlify.toml` that allowlists the public files —
mirroring the `PUBLIC_FILES` logic in `server.js`. Adding one is a change to deployment
architecture: **propose it, do not just add it.**

### 21.1 If the deployed chatbot must work

Options, cheapest first. Ask the user before implementing any of them:

| Option | Cost | Trade-off |
| --- | --- | --- |
| Netlify Function (`netlify/functions/chat.js`) | Free tier available | Key must move to Netlify env vars; frontend call path changes from `/api/chat` to the function URL. Dev server and deployed server then need two code paths. |
| Deploy `server.js` to Render / Railway / Fly | Free tier available | Real Node host, same code; needs a second always-on service and a way for the browser to reach it. |
| Keep the chatbot local-only | Zero | Say so honestly on the page; do not show a chatbot that cannot respond. |

Whichever is chosen, §9.3 still applies: the key stays server-side only, and the browser
only ever calls a same-origin or explicitly configured endpoint.

---

## 22. Final Rule

This file is the **permanent development guide** for this project. Future coding agents
must follow it whenever they modify, upgrade, debug, redesign, or extend the website.

**For every major upgrade: preserve functionality first, improve the visual design second.**

The goal is to continuously evolve this project into a polished, modern, premium and
professional portfolio website for **Ahmad Shah**.
