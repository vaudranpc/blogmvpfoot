// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    date: { type: Date, required: true, expires: 60 * 60 * 24 * 10 },

    imageData: { type: String }, // base64 sans le préfixe
    imageType: { type: String }, // ex: "image/jpeg"
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
