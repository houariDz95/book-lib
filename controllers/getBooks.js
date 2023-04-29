import { JSDOM } from 'jsdom';
import axios from 'axios';

import { getNumberOfBooks } from '../utils/getNumberOfBooks.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 });


export const getBooks = async (req, res) => {
  const cacheKey = 'booksCacheKey';
  let books = cache.get(cacheKey);

  const itemsPerPage = 50;
  const promises = [];

  if (!books) {
    const { numberOfPages } = await getNumberOfBooks(`https://www.hindawi.org/books/`);
    for (let i = 1; i <= numberOfPages; i++) {
      promises.push(
        axios.get(`https://www.hindawi.org/books/${i}/`)
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

  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;

  res.json(books.slice(startIndex, endIndex));
}