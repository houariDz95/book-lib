// Book.js
import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  authorId: String,
  name: String,
  img: String,
  description: String,
  books: [
    {
      id: String,
      img: String,
      title: String,
    },
  ],
});

const Author = mongoose.model('Contributor', authorSchema);

export default Author;