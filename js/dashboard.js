/* ==========================================================================
   dashboard.js
   Shows the signed-in user's own posts with view / edit / delete actions.
   ========================================================================== */

function blogRowHTML(post) {
  const thumb = post.image || DEFAULT_THUMB;
  return `
    <div class="blog-row" data-id="${post.id}">
      <div class="thumb"><img src="${thumb}" alt=""></div>
      <div>
        <div class="title">${escapeHTMLDash(post.title)}</div>
        <div class="meta">${escapeHTMLDash(post.category)} \u00b7 ${formatDate(post.date)}</div>
      </div>
      <span class="tag">${escapeHTMLDash(post.category)}</span>
      <div class="row-actions">
        <a href="post.html?id=${post.id}" class="btn btn-ghost btn-sm">View</a>
        <a href="create-blog.html?edit=${post.id}" class="btn btn-outline btn-sm">Edit</a>
      </div>
      <div class="row-actions">
        <button type="button" class="btn btn-danger btn-sm" data-delete="${post.id}">Delete</button>
      </div>
    </div>
  `;
}

function escapeHTMLDash(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderDashboard() {
  const session = getSession();
  const list = document.getElementById('myBlogsList');
  const emptyState = document.getElementById('dashEmptyState');
  const myPosts = getPostsByAuthor(session.userId);

  document.getElementById('statTotal').textContent = myPosts.length;
  const categories = new Set(myPosts.map((p) => p.category));
  document.getElementById('statCategories').textContent = categories.size;
  const latest = myPosts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  document.getElementById('statLatest').textContent = latest ? formatDate(latest.date) : '\u2014';

  if (!myPosts.length) {
    list.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  list.innerHTML = myPosts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(blogRowHTML)
    .join('');

  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.delete));
  });
}

let pendingDeleteId = null;

function confirmDelete(id) {
  pendingDeleteId = id;
  document.getElementById('deleteModal').classList.add('is-open');
}

function initDeleteModal() {
  const modal = document.getElementById('deleteModal');
  if (!modal) return;

  document.getElementById('cancelDelete').addEventListener('click', () => {
    pendingDeleteId = null;
    modal.classList.remove('is-open');
  });

  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (pendingDeleteId) {
      deletePost(pendingDeleteId);
      showToast('Post deleted.', 'success');
    }
    pendingDeleteId = null;
    modal.classList.remove('is-open');
    renderDashboard();
  });
}

function initDashboardPage() {
  const list = document.getElementById('myBlogsList');
  if (!list) return;

  requireAuth();
  const session = getSession();
  document.getElementById('welcomeName').textContent = session.name.split(' ')[0];

  renderDashboard();
  initDeleteModal();
}

document.addEventListener('DOMContentLoaded', initDashboardPage);
