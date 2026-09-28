/* ==========================================================================
   home.js
   Renders the featured post + blog grid, and wires up search/category
   filtering. Pure read-only view of quill_posts.
   ========================================================================== */

let activeCategory = 'All';
let searchTerm = '';

function postCardHTML(post) {
  const thumb = post.image || DEFAULT_THUMB;
  return `
    <article class="post-card card">
      <a href="post.html?id=${post.id}" class="thumb" tabindex="-1">
        <img src="${thumb}" alt="" loading="lazy">
      </a>
      <div class="body">
        <span class="tag">${post.category}</span>
        <h3><a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a></h3>
        <p class="excerpt">${escapeHTML(post.excerpt)}</p>
        <div class="post-meta">
          <span>${escapeHTML(post.authorName)}</span>
          <span class="dot"></span>
          <span>${formatDate(post.date)}</span>
        </div>
      </div>
    </article>
  `;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderCategoryFilters(categories) {
  const wrap = document.getElementById('categoryFilters');
  wrap.innerHTML = categories
    .map((cat) => `<button type="button" data-category="${cat}" class="${cat === activeCategory ? 'is-active' : ''}">${cat}</button>`)
    .join('');

  wrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategoryFilters(categories);
      renderPosts();
    });
  });
}

function renderFeatured(post) {
  const el = document.getElementById('featuredPost');
  if (!post) { el.style.display = 'none'; return; }
  el.style.display = '';
  const thumb = post.image || DEFAULT_THUMB;
  el.innerHTML = `
    <div class="thumb"><img src="${thumb}" alt=""></div>
    <div>
      <span class="eyebrow">Latest ${escapeHTML(post.category)} post</span>
      <h2><a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a></h2>
      <p class="excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="post-meta">
        <span>${escapeHTML(post.authorName)}</span>
        <span class="dot"></span>
        <span>${formatDate(post.date)}</span>
      </div>
    </div>
  `;
}

function renderPosts() {
  const posts = getAllPosts();
  const grid = document.getElementById('blogGrid');
  const emptyState = document.getElementById('gridEmptyState');

  const filtered = posts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const haystack = `${p.title} ${p.excerpt} ${p.authorName}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isBrowsingAll = activeCategory === 'All' && !searchTerm;

  // The featured spotlight only makes sense when browsing everything —
  // once someone searches or filters, show just their matching results.
  if (isBrowsingAll) {
    renderFeatured(posts[0]);
  } else {
    document.getElementById('featuredPost').style.display = 'none';
  }

  const toShow = isBrowsingAll ? filtered.filter((p) => p.id !== posts[0]?.id) : filtered;

  if (!toShow.length) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    grid.innerHTML = toShow.map(postCardHTML).join('');
  }
}

function initHomePage() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  renderCategoryFilters(getCategories());
  renderPosts();

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderPosts();
  });
}

document.addEventListener('DOMContentLoaded', initHomePage);
