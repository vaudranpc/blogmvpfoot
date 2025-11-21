// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Post = require('./models/Post');

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
