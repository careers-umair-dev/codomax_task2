/* ==========================================================================
   post.js
   Reads ?id= from the URL and renders that post's full content.
   ========================================================================== */

function initPostPage() {
  const container = document.getElementById('postContent');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const post = getPostById(params.get('id'));

  if (!post) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Post not found</h3>
        <p>This post may have been deleted. <a href="index.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Back to all posts</a></p>
      </div>
    `;
    document.title = 'Post not found — Quill';
    return;
  }

  document.title = `${post.title} — Quill`;

  const thumbHTML = post.image
    ? `<div class="thumb"><img src="${post.image}" alt=""></div>`
    : '';

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHTMLBasic(para)}</p>`)
    .join('');

  container.innerHTML = `
    <span class="tag">${escapeHTMLBasic(post.category)}</span>
    <h1>${escapeHTMLBasic(post.title)}</h1>
    <div class="post-meta">
      <span>${escapeHTMLBasic(post.authorName)}</span>
      <span class="dot"></span>
      <span>${formatDate(post.date)}</span>
    </div>
    ${thumbHTML}
    <div class="post-body">${paragraphs}</div>
  `;
}

function escapeHTMLBasic(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initPostPage);
