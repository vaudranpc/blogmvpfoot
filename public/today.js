// public/today.js

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('date-select');

  // Date par défaut : aujourd’hui
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  dateInput.value = todayStr;

  // Charger les posts pour aujourd’hui au démarrage
  loadPostsForDate(todayStr);

  // Quand l’utilisateur change la date → recharger
  dateInput.addEventListener('change', () => {
    if (dateInput.value) {
      loadPostsForDate(dateInput.value);
    }
  });

  setupZoomClose();
});

async function loadPostsForDate(dateStr) {
  const container = document.getElementById('today-posts');
  container.innerHTML = '<p style="font-size:0.9rem;color:#9ca3af;">Chargement...</p>';

  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Erreur chargement posts');
    const posts = await res.json();

    // On garde uniquement les posts dont la date == dateStr (YYYY-MM-DD)
    const filtered = posts.filter(post => {
      const d = new Date(post.date);
      const pDate = d.toISOString().slice(0, 10);
      return pDate === dateStr;
    });

    renderPostsForDate(filtered, dateStr);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="font-size:0.9rem;color:#f87171;">Erreur lors du chargement des articles.</p>';
  }
}

function renderPostsForDate(posts, dateStr) {
  const container = document.getElementById('today-posts');
  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = `<p style="font-size:0.9rem;color:#9ca3af;">Aucun article publié à cette date (${dateStr}).</p>`;
    return;
  }

  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'post-card post-card-clickable';

    let imgHtml = '';
    if (post.imageData && post.imageType) {
      const src = `data:${post.imageType};base64,${post.imageData}`;
      imgHtml = `<img class="post-image" src="${src}" alt="Image article" />`;
    } else {
      imgHtml = `<div class="post-image"></div>`;
    }

    const dateObj = new Date(post.date);
    const dateDisplay = dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    card.innerHTML = `
      ${imgHtml}
      <div class="post-content">
        <div class="post-title">${post.title}</div>
        <div class="post-date">${dateDisplay}</div>
        <div class="post-text">${escapeHtml(post.content)}</div>
      </div>
    `;

    // Clic = zoom
    card.addEventListener('click', () => openZoom(post));

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

/* ---------- Gestion du zoom ---------- */

function openZoom(post) {
  const overlay = document.getElementById('zoom-overlay');
  const content = document.getElementById('zoom-content');

  let imgHtml = '';
  if (post.imageData && post.imageType) {
    const src = `data:${post.imageType};base64,${post.imageData}`;
    imgHtml = `<img class="zoom-image" src="${src}" alt="Image article" />`;
  }

  const dateObj = new Date(post.date);
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });

  content.innerHTML = `
    <article class="zoom-card">
      <div class="zoom-image-wrapper">
        ${imgHtml}
      </div>
      <div class="zoom-body">
        <h2>${post.title}</h2>
        <p class="zoom-date">${dateStr}</p>
        <br>
        <p class="zoom-text">${escapeHtml(post.content).replace(/\n/g, '<br>')}</p>
        <button id="zoom-close-btn" class="zoom-close-btn">Fermer</button>
      </div>
    </article>
  `;

  overlay.classList.add('active');

  document.getElementById('zoom-close-btn').addEventListener('click', closeZoom);
}


function closeZoom() {
  const overlay = document.getElementById('zoom-overlay');
  overlay.classList.remove('active');
}

function setupZoomClose() {
  const overlay = document.getElementById('zoom-overlay');

  // clic sur le fond
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'zoom-overlay') {
      closeZoom();
    }
  });

  // touche ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeZoom();
    }
  });
}
