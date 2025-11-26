// public/ideas.js

document.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  loadIdeas();
});

/* ----------------------------- Variables ----------------------------- */

const API_BASE = '/api/ideas';

let ideas = [];


const titleEl = document.getElementById('title');
const descEl = document.getElementById('desc');
const tagsEl = document.getElementById('tags');
const dateEl = document.getElementById('date');

const addBtn = document.getElementById('addBtn');
const clearAll = document.getElementById('clearAll');

const ideasEl = document.getElementById('ideas');
const filterEl = document.getElementById('filter');
const searchEl = document.getElementById('search');

/* ----------------------------- Init Events ----------------------------- */

function setupEvents() {

  // Ajouter une idée
  addBtn.addEventListener('click', async () => {
   const newIdea = {
  title: titleEl.value.trim(),
  desc: descEl.value.trim() || "",
  tags: tagsEl.value
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)||['mvp foot'],
  due: dateEl.value ? dateEl.value : null,
  done: false,
  createdAt: { type: Date, default: Date.now }
}

    if (!newIdea.title) return alert("Titre obligatoire.");
 
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea) 
      }).then(response => response.text())
  .then(text => {
    console.log(text); // <-- Tu verras si c’est du HTML
  });;

      

      const saved = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la publication');
      }
      ideas.push(saved);

    
      
    } catch (err) {
      console.log('Erreur sauvegarde : ' + err.message);
    }

    renderIdeas();
      clearForm();
      loadIdeas();
  });

  // Recherche + filtre
  searchEl.addEventListener('input', renderIdeas);

 if (searchEl) {
    // debounce pour limiter les appels pendant la frappe
    const debounce = (fn, wait = 200) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    };

    searchEl.addEventListener('input', debounce(() => {
      renderIdeas();
    }));}


 filterEl.addEventListener('change', () => renderIdeas());

  // Supprimer toutes les idées
  clearAll.addEventListener('click', deleteAllIdeas);
}

/* ----------------------------- Load Ideas ----------------------------- */

async function loadIdeas() {
  ideasEl.innerHTML =
    '<p style="font-size:0.9rem;color:#9ca3af;">Chargement...</p>';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Erreur API');
    ideas = await res.json();
    renderIdeas();
  } catch (err) {
    console.error(err);
    ideasEl.innerHTML =
      '<p style="font-size:0.9rem;color:#f87171;">Impossible de charger les idées.</p>';
  }
}

/* ----------------------------- Delete All ----------------------------- */

async function deleteAllIdeas() {
  if (!confirm('Supprimer toutes les idées ?')) return;

  try {
    const list = await (await fetch(API_BASE)).json();
    await Promise.all(
      list.map(i =>
        fetch(`${API_BASE}/${i._id}`, { method: 'DELETE' })
      )
    );
    ideas = [];
    renderIdeas();
  } catch (err) {
    alert('Erreur suppression : ' + err.message);
  }
}

/* ----------------------------- Rendering ----------------------------- */

function renderIdeas() {
  ideasEl.innerHTML = '';

  // Filtrage texte
  const q = searchEl.value.trim().toLowerCase();
  const filter = filterEl.value;

  let list = ideas.slice();

  if (filter === 'done') list = list.filter(i => i.done);
  if (filter === 'pending') list = list.filter(i => !i.done);

  if (q) {
    list = list.filter(i =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.desc || '').toLowerCase().includes(q) ||
      (i.tags || []).join(' ').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    ideasEl.innerHTML =
      '<p class="small">Aucune idée trouvée.</p>';
    return;
  }

  list.forEach(idea => renderIdeaCard(idea));
}

/* ----------------------------- Render Card ----------------------------- */

function renderIdeaCard(idea) {
  const card = document.createElement('article');
  card.className = 'idea-card';
  if (idea.done) card.classList.add('done');

  const dateStr = idea.due
    ? new Date(idea.due).toLocaleDateString()
    : '—';

  card.innerHTML = `
    <div class="idea-header">
      <strong>${idea.title}</strong>
      <div class="idea-meta">
        <span class="chip">${dateStr}</span>
        <span class="chip">${(idea.tags || []).slice(0, 3).join(', ') || 'pas de tag'}</span>
      </div>
    </div>

    <p class="idea-desc">${idea.desc || ''}</p>

    <div class="small">Créée : ${new Date(idea.createdAt).toLocaleString()}</div>

    <div class="idea-controls">
      <button class="btn-ghost" data-action="toggle">${idea.done ? 'Annuler' : 'Terminer'}</button>
      <button class="btn-ghost" data-action="edit">Modifier</button>
      <button class="btn-ghost" data-action="delete">Supprimer</button>
    </div>
  `;

  card.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleIdea(idea));
  card.querySelector('[data-action="edit"]').addEventListener('click', () => editIdea(idea));
  card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteIdea(idea));

  ideasEl.appendChild(card);
}

/* ----------------------------- Actions ----------------------------- */

async function toggleIdea(idea) {
  try {
    const res = await fetch(`${API_BASE}/${idea._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !idea.done })
    });

    const updated = await res.json();
    const idx = ideas.findIndex(i => i._id === updated._id);
    ideas[idx] = updated;
    renderIdeas();
  } catch (err) {
    alert('Erreur : ' + err.message);
  }
}

async function editIdea(idea) {
  const newTitle = prompt('Titre', idea.title);
  if (newTitle === null) return;

  const newDesc = prompt('Description', idea.desc || '');
  if (newDesc === null) return;

  const newTags = prompt('Tags (séparés par virgules)', (idea.tags || []).join(', '));
  if (newTags === null) return;

  const newDue = prompt('Date due (YYYY-MM-DD)', idea.due || '');

  try {
    const res = await fetch(`${API_BASE}/${idea._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        desc: newDesc.trim(),
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        due: newDue || null
      })
    });

    const updated = await res.json();
    const idx = ideas.findIndex(i => i._id === updated._id);
    ideas[idx] = updated;
    renderIdeas();
  } catch (err) {
    alert('Erreur mise à jour : ' + err.message);
  }
}

async function deleteIdea(idea) {
  if (!confirm('Supprimer cette idée ?')) return;

  try {
    await fetch(`${API_BASE}/${idea._id}`, { method: 'DELETE' });
    ideas = ideas.filter(i => i._id !== idea._id);
    renderIdeas();
  } catch (err) {
    alert('Erreur suppression : ' + err.message);
  }
}

/* ----------------------------- Utils ----------------------------- */

function clearForm() {
  titleEl.value = '';
  descEl.value = '';
  tagsEl.value = '';
  dateEl.value = '';
}


function renderIdeas() {
  ideasEl.innerHTML = "";

  if (!ideas.length) {
    ideasEl.innerHTML = `
      <p style="color:#9ca3af;font-size:0.9rem;">Aucune idée pour l’instant.</p>`;
    return;
  }

  ideas.forEach(idea => {
    const card = document.createElement("div");
    card.className = "idea-card";
    if (idea.done) card.classList.add("done");

    const created = idea.createdAt
      ? new Date(idea.createdAt).toLocaleString()
      : "";

    card.innerHTML = `
      <div class="idea-title">${idea.title}</div>

      <div class="idea-desc">${idea.desc || ""}</div>

      <div class="idea-tags">
        ${(idea.tags || [])
          .map(t => `<span class="idea-tag">${t}</span>`)
          .join("")}
      </div>

      <div class="idea-footer">
        <span>📅 ${idea.due || "Aucune date"}</span>
        <span>${idea.done ? "✔️ Terminé" : "⏳ À faire"}</span>
      </div>

      <div class="idea-controls">
        <button class="btn-ghost" data-action="toggle">
          ${idea.done ? "Annuler" : "Terminer"}
        </button>

        <button class="btn-ghost" data-action="edit">Modifier</button>
        <button class="btn-ghost btn-danger" data-action="delete">Supprimer</button>
      </div>
    `;

    // Bouton: Terminer / Annuler
    card.querySelector('[data-action="toggle"]').addEventListener('click', () => {
      toggleIdea(idea);
    });

    // Bouton: Modifier
    card.querySelector('[data-action="edit"]').addEventListener('click', () => {
      editIdea(idea);
    });

    // Bouton: Supprimer
    card.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteIdea(idea);
    });

    ideasEl.appendChild(card);
  });
}
