/* ==========================================================================
   data.js
   Everything that touches localStorage lives here so every page (home,
   dashboard, editor, auth) reads and writes data the same way.

   Storage keys:
     quill_users    -> array of { id, name, email, password, createdAt }
     quill_session  -> { userId, name, email } | null
     quill_posts    -> array of { id, title, category, excerpt, content,
                                   image, authorId, authorName, date }

   NOTE: passwords are stored in plain form purely for this front-end demo.
   A real app must never store or compare passwords client-side like this —
   authentication belongs on a server.
   ========================================================================== */

const STORAGE_KEYS = {
  users: 'quill_users',
  session: 'quill_session',
  posts: 'quill_posts',
};

const DEFAULT_THUMB = 'assets/placeholder-thumb.svg';
const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
];

/* ---------- low-level helpers ---------- */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Could not read "${key}" from storage`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function excerptOf(content, length = 140) {
  const clean = content.replace(/\s+/g, ' ').trim();
  return clean.length > length ? clean.slice(0, length).trim() + '…' : clean;
}

/* ---------- seed content (first run only) ---------- */

const SEED_POSTS = [
  {
    title: 'Designing interfaces people actually enjoy using',
    category: 'Design',
    content:
      'Good interface design is mostly invisible. People notice friction, not flourishes — the button that was hard to find, the form that rejected a valid answer, the page that loaded before they had time to read anything.\n\nStart by writing down the one thing a screen must let someone do, then remove everything that competes with it. Consistent spacing, a restrained color palette, and predictable navigation do more for "delight" than any animation ever will.\n\nWhen in doubt, ship the plain version first. You can always add polish once the structure earns it.',
  },
  {
    title: 'A practical guide to writing your first REST API',
    category: 'Development',
    content:
      'Every API starts the same way: a resource, a verb, and a response. Before reaching for a framework, sketch the endpoints on paper — what does a client send, and what should come back?\n\nKeep routes named after nouns (/posts, /users) and let HTTP methods carry the verbs (GET, POST, PUT, DELETE). Return meaningful status codes and consistent error shapes, because the developer using your API will thank you for it at 2am.\n\nOnce the shape feels right, the implementation is the easy part.',
  },
  {
    title: 'Why small habits outperform big resolutions',
    category: 'Lifestyle',
    content:
      'Ambitious goals fail quietly. They ask for a version of you that only shows up on your best days, and best days are rare.\n\nA habit that survives a bad day — five minutes, one page, one short walk — compounds in a way that a perfect plan never does. The trick isn\'t motivation, it\'s making the next action so small there\'s no reason not to do it.\n\nTrack the streak, not the outcome. The outcome follows on its own.',
  },
  {
    title: 'Understanding async/await without the jargon',
    category: 'Development',
    content:
      'Asynchronous code has a bad reputation because it\'s usually explained with the words used to implement it, not the problem it solves.\n\nHere\'s the plain version: some things take time — reading a file, waiting on a network reply — and your program shouldn\'t freeze while it waits. `async` marks a function as one that might pause. `await` marks the exact point where it pauses, and hands control back until the result is ready.\n\nOnce you read it as "pause here, resume when ready," the syntax stops feeling like magic.',
  },
  {
    title: 'The case for writing things down',
    category: 'Lifestyle',
    content:
      'Memory is unreliable in a specific way: it keeps the feeling of an idea and drops the details. Writing forces the details back in.\n\nA short daily note — what happened, what you decided, what you\'d change — becomes a record you can actually trust later, unlike your recollection of "that one week in March."\n\nIt doesn\'t need to be good writing. It needs to exist.',
  },
  {
    title: 'Color theory basics every developer should know',
    category: 'Design',
    content:
      'You don\'t need a design degree to avoid the most common color mistakes. Start with contrast: text should be readable at a glance, which usually means dark text on light backgrounds or vice versa, not a clever mid-tone.\n\nPick one accent color and let it do all the pointing — links, primary buttons, active states. Everything else can live in a small range of grays.\n\nWhen a palette feels flat, the fix is almost never a new color. It\'s more contrast between the ones you already have.',
  },
];

function seedPostsIfEmpty() {
  const existing = readJSON(STORAGE_KEYS.posts, null);
  if (existing && existing.length) return;

  const now = Date.now();
  const posts = SEED_POSTS.map((p, i) => ({
    id: uid('post'),
    title: p.title,
    category: p.category,
    excerpt: excerptOf(p.content),
    content: p.content,
    image: CARD_IMAGES[i] || '',
    authorId: 'seed',
    authorName: 'Quill Team',
    date: new Date(now - i * 36e5 * 26).toISOString(),
  }));
  writeJSON(STORAGE_KEYS.posts, posts);
}

function ensureCardImages() {
  const posts = readJSON(STORAGE_KEYS.posts, []);
  let changed = false;

  posts.forEach((post, index) => {
    const candidate = CARD_IMAGES[index % CARD_IMAGES.length] || DEFAULT_THUMB;
    const shouldReplace = !post.image ||
      post.image === DEFAULT_THUMB ||
      post.image.includes('encrypted-tbn0.gstatic.com') ||
      post.image.includes('futurelearn.com') ||
      post.image.includes('google.com/imgres');

    if (shouldReplace && post.image !== candidate) {
      post.image = candidate;
      changed = true;
    }
  });

  if (changed) {
    writeJSON(STORAGE_KEYS.posts, posts);
  }
}

seedPostsIfEmpty();
ensureCardImages();

/* ---------- users ---------- */

function getUsers() {
  return readJSON(STORAGE_KEYS.users, []);
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function createUser({ name, email, password }) {
  const users = getUsers();
  const user = { id: uid('user'), name, email, password, createdAt: new Date().toISOString() };
  users.push(user);
  writeJSON(STORAGE_KEYS.users, users);
  return user;
}

/* ---------- session ---------- */

function getSession() {
  return readJSON(STORAGE_KEYS.session, null);
}

function setSession(user) {
  writeJSON(STORAGE_KEYS.session, { userId: user.id, name: user.name, email: user.email });
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
  return session;
}

/* ---------- posts ---------- */

function getAllPosts() {
  return readJSON(STORAGE_KEYS.posts, []).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getPostById(id) {
  return getAllPosts().find((p) => p.id === id) || null;
}

function getPostsByAuthor(authorId) {
  return getAllPosts().filter((p) => p.authorId === authorId);
}

function saveNewPost({ title, category, content, image, author }) {
  const posts = readJSON(STORAGE_KEYS.posts, []);
  const post = {
    id: uid('post'),
    title,
    category,
    content,
    excerpt: excerptOf(content),
    image: image || '',
    authorId: author.userId,
    authorName: author.name,
    date: new Date().toISOString(),
  };
  posts.push(post);
  writeJSON(STORAGE_KEYS.posts, posts);
  return post;
}

function updatePost(id, { title, category, content, image }) {
  const posts = readJSON(STORAGE_KEYS.posts, []);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = {
    ...posts[idx],
    title,
    category,
    content,
    excerpt: excerptOf(content),
    image: image || '',
  };
  writeJSON(STORAGE_KEYS.posts, posts);
  return posts[idx];
}

function deletePost(id) {
  const posts = readJSON(STORAGE_KEYS.posts, []).filter((p) => p.id !== id);
  writeJSON(STORAGE_KEYS.posts, posts);
}

function getCategories() {
  const cats = new Set(getAllPosts().map((p) => p.category));
  return ['All', ...Array.from(cats)];
}

/* ---------- shared form helpers ---------- */

function setFieldError(fieldEl, message) {
  fieldEl.classList.toggle('has-error', Boolean(message));
  const msg = fieldEl.querySelector('.error-msg');
  if (msg) msg.textContent = message || '';
}

/* ---------- shared toast ---------- */

let toastTimer = null;

function showToast(message, type = 'success') {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast is-visible toast-${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
