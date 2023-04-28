import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { getNumberOfBooks } from './utils/getNumberOfBooks.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 });
const app = express();
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => { res.send("welcome to hundawi scraper api") })


app.get('/books', async (req, res) => {
  const cacheKey = 'booksCacheKey';
  let books = cache.get(cacheKey);

  const itemsPerPage = 50;
  //const numberOfPages = Math.ceil(books.length / itemsPerPage);
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
});


app.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://www.hindawi.org/books/${id}`)
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);

    const section = $(".singleBook")
    const title = section.querySelector('.container .pageContent article .details h2').textContent;
    const author = section.querySelector('.container .pageContent article .details .author').textContent.trim()
    const authorId = section.querySelector('.container .pageContent article .details .author a').getAttribute('href');
    const img = section.querySelector('.container .pageContent article .cover img').getAttribute('src')
    const typeText = section.querySelector('.container .pageContent article .details .tags li a').textContent.trim();
    const typeUrl = section.querySelector('.container .pageContent article .details .tags li a').getAttribute('href');
    const words = section.querySelector('.container .pageContent article .details .tags li span').textContent.trim();
    const text = section.querySelector('.container .pageContent article .details .content div').textContent.trim();
    const date = section.querySelector('.container .pageContent .releaseDates > ul > li:nth-child(1) > spn').textContent.trim();
    const downloads = section.querySelectorAll('.container .pageContent .downloadBook ul li');
    const downloadLinks = []
    downloads.forEach(download => {
      downloadLinks.push(
        {
          downloadTitle: download.textContent.trim(),
          downloadImg: "https://www.hindawi.org" + download.querySelector('a img').getAttribute('src'),
          downloadLink: download.querySelector('a').getAttribute('href')
        }
      )
    })


    const content = section.querySelectorAll('div > main > div.bookIndex > ul > li > a');
    const contents = []
    content.forEach(el => {
      contents.push(
        {
          title: el.textContent.trim(),
          id: el.getAttribute('href').replace(/\/books/, "")
        }
      )
    })
    const aboutAuthor = section.querySelector('div > main > div.aboutAuthor').textContent.replace(/\s*/, " ").replace(/\عن المؤلف/, " ").trim()

    const type = {
      genre: typeText,
      url: typeUrl.replace("/books/categories/", "").replace("/", "")
    }

    res.json(
      {
        title,
        author,
        authorId,
        img,
        type,
        words,
        text,
        downloadLinks,
        date,
        aboutAuthor,
        contents,
      }
    )
  } catch (error) {
    res.json(error)
  }
})


app.get('/contributors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://www.hindawi.org/contributors/${id}`)
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);

    const section = $('.singleAuthor')
    const name = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('alt');
    const img = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('src');
    const descreption = section.querySelector("div > main > article > div.details > div ").textContent.replace(/\s*/, " ").trim()
    const li = section.querySelectorAll("div > main > div > ul > li")
    const books = []
    li.forEach(book => {
      const id = book.querySelector('a').getAttribute('href')
      const img = book.querySelector('a img').getAttribute("src")
      const title = book.querySelector('a img').getAttribute("alt")
      books.push({
        id,
        img,
        title
      })
    })
    res.json({
      name,
      img,
      descreption,
      books
    })
  } catch (error) {
    res.json(error)
  }
})


app.get('/categories/:title', async (req, res) => {
  const cacheKey = `booksCacheKey_${req.params.title}`;
  let books = cache.get(cacheKey);

  if (!books) {
    const { title } = req.params
    const { numberOfPages } = await getNumberOfBooks(`https://www.hindawi.org/books/categories/${title}/`);
    books = [];
    try {
      for (let i = 1; i <= numberOfPages; i++) {
        const response = await axios.get(`https://www.hindawi.org/books/categories/${title}/${i}/`);
        const dom = new JSDOM(response.data);
        const $ = (select) => dom.window.document.querySelector(select);
        const ul = $('body > div > section.allBooks > div > main > div.books_covers > ul');
        const allBooks = ul.querySelectorAll('li');
        allBooks.forEach(book => {
          const id = book.querySelector('a').getAttribute('href');
          const img = book.querySelector('a img').getAttribute('src');
          const title = book.querySelector('a img').getAttribute('alt');

          books.push({
            id,
            title,
            img
          })
        })
      }
      cache.set(cacheKey, books, 60 * 60); // cache for 1 hour
    } catch (error) {
      res.json(error)
    }
  }

  res.json(books);
});

app.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  try {
    const response = await axios.get(`https://www.hindawi.org/search/keyword/${keyword}/`);
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);
    const ul = $("section.search > .container > .pageContent > form > div.searchResults > ul");

    const allResults = ul.querySelectorAll('li');
    const searchResults = []
    allResults.forEach(result => {
      const bookInfo = result.querySelector("a:nth-child(1)")
      const authorInfo = result.querySelector("a:nth-child(2)")
      searchResults.push({
        bookId: bookInfo.getAttribute('href'),
        authorId: authorInfo.getAttribute('href'),
        bookTitle: bookInfo.textContent,
        authorTitle: authorInfo.textContent,
      })
    })
    res.json(searchResults)
  } catch (error) {
    res.json(error)
  }
})

app.get('/catList', async(req, res) => {
  try {
    const response = await axios.get(`https://www.hindawi.org/books/`);
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);
    const ul = $("section.allBooks > div > aside > ul > li:nth-child(1) > ul")
    const categories = ul.querySelectorAll('li');
    const list = []
    categories.forEach(cat => {
      const title = cat.querySelector('a').getAttribute('href').replace(/\/books\/categories?/gi, "")
      list.push(title)
    })
    res.json(list.slice(1, list.length))
  } catch (error) {
    res.json(error)
  }
})

app.get('/new', async (req, res) => {
  const books = []
  console.log(req.query.page)
  try {
      const response = await axios.get(`https://www.hindawi.org/`);
      const dom = new JSDOM(response.data);
      const $ = (select) => dom.window.document.querySelector(select);
      const ul = $('main .slide-section .container .swiper .swiper-wrapper');
      const allBooks = ul.querySelectorAll('li');
      allBooks.forEach(book => {
        const id = book.querySelector('a').getAttribute('href');
        const img = book.querySelector('a img').getAttribute('src');
        const title = book.querySelector('a img').getAttribute('alt');

        books.push({
          id,
          title,
          img
        })
      })
    res.json(books)
  } catch (error) {
    res.json(error)
  }
})


app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))