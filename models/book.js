// Book.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: String,
  title: String,
  author: String,
  authorId: String,
  img: String,
  type: {
    genre: String,
    url: String,
  }, 
  words: String,
  text: String,
  downloadLinks: [
    {
    downloadTitle: String,
    downloadImg: String,
    downloadLink: String
  }
],
  date: String,
  aboutAuthor: String, 
  contents: [
    {
      title: String,
      id: String,
    },
  ],
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
