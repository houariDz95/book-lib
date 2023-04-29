import {JSDOM} from 'jsdom'
import axios from 'axios';


const CACHE_TIME = 60 * 60 * 1000; // Cache for 1 hour

let cachedBooks = null;
let cacheTime = null;

const getNewBooks = async () => {
  const response = await axios.get(`https://www.hindawi.org/`);
  const dom = new JSDOM(response.data);
  const $ = (select) => dom.window.document.querySelector(select);
  const ul = $('main .slide-section .container .swiper .swiper-wrapper');
  const allBooks = ul.querySelectorAll('li');
  const bookPromises = Array.from(allBooks).map(async (book) => {
    const id = book.querySelector('a').getAttribute('href');
    const img = book.querySelector('a img').getAttribute('src');
    const title = book.querySelector('a img').getAttribute('alt');
    return { id, img, title };
  });
  const books = await Promise.all(bookPromises);
  return books;
};

export const newBooks = async (req, res) => {
  // Check if cached response is available and return it
  if (cachedBooks && cacheTime && cacheTime + CACHE_TIME > Date.now()) {
    return res.json(cachedBooks);
  }

  try {
    const books = await getNewBooks();
    // Cache the response
    cachedBooks = books;
    cacheTime = Date.now();
    res.json(books);
  } catch (error) {
    res.json(error);
  }
};
