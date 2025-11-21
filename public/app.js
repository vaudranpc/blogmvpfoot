// public/app.js

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  loadPosts();
});

function setupForm() {
  const form = document.getElementById('post-form');
  const message = document.getElementById('form-message');

  // Date par défaut : aujourd'hui
  const dateInput = document.getElementById('date');
  dateInput.value = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = document.getElementById('date').value;
    const imageFile = document.getElementById('image').files[0];

    try {
      let imageData = null;
      let imageType = null;

      if (imageFile) {
        const result = await fileToBase64(imageFile);
        imageData = result.base64;
        imageType = result.type;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          date,
          imageData,
          imageType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la publication');
      }

      message.style.color = '#22c55e';
      message.textContent = 'Article publié ✅';

      form.reset();
      document.getElementById('date').value = new Date().toISOString().split('T')[0];

      loadPosts();
    } catch (err) {
      console.error(err);
      message.style.color = '#ef4444';
      message.textContent = err.message;
    }
  });
}

// Convertir un fichier image en base64 (sans le préfixe)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result; // "data:image/jpeg;base64,XXX..."
      const [prefix, base64] = result.split(',');
      resolve({
        base64,
        type: file.type
      });
    };

    reader.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}

async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Erreur chargement posts');
    const posts = await res.json();

    renderPosts(posts);
  } catch (err) {
    console.error(err);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = `<p style="font-size:0.9rem;color:#9ca3af;">Aucun article pour le moment. Publie ton premier post foot 😉</p>`;
    return;
  }

  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'post-card';

    let imgHtml = '';
    if (post.imageData && post.imageType) {
      const src = `data:${post.imageType};base64,${post.imageData}`;
      imgHtml = `<img class="post-image" src="${src}" alt="Image article" />`;
    } else {
      imgHtml = `<div class="post-image"></div>`;
    }

    const dateObj = new Date(post.date);
    const dateStr = dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    card.innerHTML = `
      ${imgHtml}
      <div class="post-content">
        <div class="post-title">${post.title}</div>
        <div class="post-date">${dateStr}</div>
        <div class="post-text">${escapeHtml(post.content)}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
