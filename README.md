# Quill — Blog Application Frontend

A complete, responsive blog application front end built with plain HTML, CSS,
and JavaScript — no frameworks, no build step.

## Folder structure

```
blog-app/
├── index.html          Home page (post feed, search, category filters)
├── login.html           Login page
├── register.html         Register page
├── dashboard.html        Signed-in user's blog management dashboard
├── create-blog.html      Create / edit post form
├── post.html             Single post view
├── css/
│   ├── style.css        Design tokens, reset, navbar, footer, buttons, forms — shared everywhere
│   ├── home.css         Home page only
│   ├── auth.css         Login / register pages only
│   ├── dashboard.css    Dashboard page only
│   ├── create-blog.css  Create / edit page only
│   └── post.css         Single post page only
├── js/
│   ├── data.js          localStorage schema, seed posts, all read/write helpers
│   ├── nav.js           Mobile menu + auth-aware navbar, runs on every page
│   ├── auth.js          Login/register validation and submit logic
│   ├── home.js          Home page rendering, search, category filtering
│   ├── dashboard.js     Dashboard rendering + delete confirmation
│   ├── create-blog.js   Create/edit form, image upload, live preview
│   └── post.js          Single post rendering
└── assets/
    ├── favicon.svg
    └── placeholder-thumb.svg   Used when a post has no cover image
```

## Running it locally

No installation, no npm, no build tools — this is static HTML/CSS/JS.

**Option A — just open it**
Double-click `index.html` (or right-click → Open with → your browser).

**Option B — a local server (recommended)**
Some browsers restrict `localStorage` for pages opened directly from disk.
If you notice data not saving, serve the folder instead:

```bash
# Python 3 (already installed on most systems)
cd blog-app
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

Or, if you use VS Code, install the "Live Server" extension and click
"Go Live" from `index.html`.

## How it works

- **No backend.** All data — accounts, sessions, and posts — is stored in
  the browser's `localStorage`, under the keys `quill_users`,
  `quill_session`, and `quill_posts`. Clearing your browser storage resets
  the app back to its seeded demo posts.
- **Getting started:** open the app, go to **Sign up**, and create an
  account. You'll be logged in automatically and can head to **Write a
  post** or your **Dashboard**.
- **Passwords** are stored in plain text in `localStorage` purely for this
  front-end demo. That is only acceptable because there is no real backend
  or real user data involved — never do this in a production app.

## Browser support

Built and tested against current versions of Chrome, Firefox, Edge, and
Safari. Uses only standard, well-supported web APIs (`localStorage`,
`FileReader`, CSS Grid/Flexbox).
