// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Post = require('./models/Post');
const Idea = require('./models/Ideas');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' })); // important pour le base64
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
const MONGO_URI = 'mongodb+srv://vaudranxgroup_db_user:jyOqziCKZJJ6oxpY@mvpfoot.87dxzzn.mongodb.net/?appName=mvpfoot';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err.message));

// ===== API BLOG FOOT =====

//ideas
app.get('/api/ideas', async (req, res) => {
try{
const ideas = await Idea.find().sort({ createdAt: -1 });
res.json(ideas);
}catch(err){ res.status(500).json({error: err.message}); }
});


app.post('/api/ideas', async (req, res) => {
  try {
   const { title, desc, tags, due } = req.body;
const idea = new Idea({ title, desc, tags: tags||[], due: due||null });
    await idea.save();
    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put('/api/ideas/:id', async (req, res) => {
try{
const upd = req.body;
const idea = await Idea.findByIdAndUpdate(req.params.id, upd, { new: true });
if(!idea) return res.status(404).json({error:'Not found'});
res.json(idea);
}catch(err){ res.status(400).json({error: err.message}); }
});


app.delete('/api/ideas/:id', async (req, res) => {
try{
await Idea.findByIdAndDelete(req.params.id);
res.json({ok:true});
}catch(err){ res.status(400).json({error: err.message}); }
});


// Import endpoint (accepts array of ideas)
app.post('/api/ideas/import', async (req, res) => {
try{
const arr = Array.isArray(req.body) ? req.body : (req.body.items || []);
const docs = arr.map(it => ({
title: it.title || 'Sans titre',
desc: it.desc || '',
tags: it.tags || [],
due: it.due || null,
done: !!it.done,
createdAt: it.createdAt ? new Date(it.createdAt) : undefined
}));
const inserted = await Idea.insertMany(docs);
res.json({ insertedCount: inserted.length, inserted });
}catch(err){ res.status(400).json({ error: err.message }); }
});







// Récupérer tous les posts (les plus récents d’abord)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, date, imageData, imageType } = req.body;

    if (!title || !content || !date) {
      return res.status(400).json({ error: 'Titre, contenu et date sont obligatoires' });
    }

    const post = new Post({
      title,
      content,
      date: new Date(date),
      imageData: imageData || null,
      imageType: imageType || null
    });

    const saved = await post.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// (optionnel) supprimer un post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
