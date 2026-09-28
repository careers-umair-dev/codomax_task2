/* ==========================================================================
   create-blog.js
   Handles both "create" and "edit" (via ?edit=<id>) for the blog editor,
   including image upload preview and the live preview card.
   ========================================================================== */

let currentImageData = '';
let editingPostId = null;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateLivePreview() {
  const title = document.getElementById('blogTitle').value.trim() || 'Your post title will appear here';
  const category = document.getElementById('blogCategory').value || 'Category';
  const content = document.getElementById('blogContent').value.trim();

  document.getElementById('previewTitle').textContent = title;
  document.getElementById('previewCategory').textContent = category;
  document.getElementById('previewExcerpt').textContent = content ? excerptOf(content) : 'A short excerpt from your content will show up here as you write.';

  const previewThumb = document.getElementById('previewThumb');
  previewThumb.src = currentImageData || DEFAULT_THUMB;
}

function initImageUpload() {
  const dropZone = document.getElementById('fileDrop');
  const fileInput = document.getElementById('blogImage');
  const preview = document.getElementById('filePreview');
  const previewImg = document.getElementById('filePreviewImg');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  ['dragover', 'dragleave', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.toggle('is-dragover', evt === 'dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  });

  async function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }
    const dataURL = await readFileAsDataURL(file);
    currentImageData = dataURL;
    previewImg.src = dataURL;
    preview.classList.add('is-visible');
    updateLivePreview();
  }
}

function prefillForEdit(post) {
  editingPostId = post.id;
  document.getElementById('editorTitle').textContent = 'Edit post';
  document.getElementById('editorSubtitle').textContent = 'Update your post and save your changes.';
  document.getElementById('blogTitle').value = post.title;
  document.getElementById('blogCategory').value = post.category;
  document.getElementById('blogContent').value = post.content;
  document.getElementById('submitBtn').textContent = 'Save changes';

  if (post.image) {
    currentImageData = post.image;
    document.getElementById('filePreviewImg').src = post.image;
    document.getElementById('filePreview').classList.add('is-visible');
  }
  updateLivePreview();
}

function initEditorForm() {
  const form = document.getElementById('blogForm');
  if (!form) return;

  requireAuth();
  initImageUpload();

  ['blogTitle', 'blogCategory', 'blogContent'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateLivePreview);
  });
  document.getElementById('blogCategory').addEventListener('change', updateLivePreview);

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  if (editId) {
    const post = getPostById(editId);
    if (post) prefillForEdit(post);
  }
  updateLivePreview();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleField = document.getElementById('blogTitleField');
    const categoryField = document.getElementById('blogCategoryField');
    const contentField = document.getElementById('blogContentField');

    const title = document.getElementById('blogTitle').value.trim();
    const category = document.getElementById('blogCategory').value;
    const content = document.getElementById('blogContent').value.trim();

    let valid = true;
    if (!title) {
      setFieldError(titleField, 'Give your post a title.');
      valid = false;
    } else {
      setFieldError(titleField, '');
    }

    if (!category) {
      setFieldError(categoryField, 'Choose a category.');
      valid = false;
    } else {
      setFieldError(categoryField, '');
    }

    if (!content || content.length < 20) {
      setFieldError(contentField, 'Write at least a couple of sentences (20+ characters).');
      valid = false;
    } else {
      setFieldError(contentField, '');
    }

    if (!valid) return;

    const session = getSession();

    if (editingPostId) {
      updatePost(editingPostId, { title, category, content, image: currentImageData });
      showToast('Post updated.', 'success');
    } else {
      saveNewPost({
        title,
        category,
        content,
        image: currentImageData,
        author: { userId: session.userId, name: session.name },
      });
      showToast('Post published.', 'success');
    }

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
  });
}

document.addEventListener('DOMContentLoaded', initEditorForm);
