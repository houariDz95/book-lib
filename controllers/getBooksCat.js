import { JSDOM } from 'jsdom';
import NodeCache from 'node-cache';
import axios from 'axios';
import { getNumberOfBooks } from '../utils/getNumberOfBooks.js';

const cache = new NodeCache({ stdTTL: 60 * 60 });

export const getBooksCat = async (req, res) => {
  const cacheKey = `booksCacheKey_${req.params.title}`;
  let books = cache.get(cacheKey);
  const itemsPerPage = 30;
  if (!books) {
    const { title } = req.params;
    const { numberOfPages } = await getNumberOfBooks(`https://www.hindawi.org/books/categories/${title}/`);
    const promises = [];

    for (let i = 1; i <= numberOfPages; i++) {
      promises.push(
        axios.get(`https://www.hindawi.org/books/categories/${title}/${i}/`)
          .then(response => {
            const dom = new JSDOM(response.data);
            const ul = dom.window.document.querySelector('body > div > section.allBooks > div > main > div.books_covers > ul');
            const allBooks = ul.querySelectorAll('li');
            const booksData = [];

            allBooks.forEach(book => {
              const id = book.querySelector('a').getAttribute('href');
              const img = book.querySelector('a img').getAttribute('src');
              const title = book.querySelector('a img').getAttribute('alt');

              booksData.push({
                id,
                title,
                img
              });
            });

            return booksData;
          })
          .catch(error => {
            console.error(error);
            return [];
          })
      );
    }

    books = await Promise.all(promises).then(data => data.flat());
    cache.set(cacheKey, books, 60 * 60); // cache for 1 hour
  }

  const page = parseInt(req.query.page || 1);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const slicedBooks = books.slice(startIndex, endIndex);

  res.json({
    books: slicedBooks,
    currentPage: page,
    totalPages: Math.ceil(books.length / itemsPerPage),
    totalBooks: books.length
  });

}
