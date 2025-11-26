// models/Post.js
const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
title: { type: String, required: true },
desc: String,
tags: [String],
due: String, // store as YYYY-MM-DD or null
done: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Idea', ideaSchema);