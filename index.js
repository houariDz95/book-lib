import express from 'express';
import axios from 'axios';
import {JSDOM} from 'jsdom';
import {getNumberOfBooks} from './utils/getNumberOfBooks.js';
const app = express();
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {res.send("welcome to hundawi scraper api")})

app.get('/books', async(req, res) =>{
  const books = []
  const {numberOfPages} = await getNumberOfBooks(`https://www.hindawi.org/books/`);

  try{
    for(let i = 1; i <= numberOfPages; i++){
      const response = await axios.get(`https://www.hindawi.org/books/${i}/`);
      const dom = new JSDOM(response.data);
      const $ = (select) => dom.window.document.querySelector(select);
      const ul = $('body > div > section.allBooks > div > main > div.books_covers > ul');
      const allBooks = ul.querySelectorAll('li');
      allBooks.forEach(book => {
        const id = book.querySelector('a').getAttribute('href').replace("/books/", "").replace("/", "");
        const img = book.querySelector('a img').getAttribute('src');
        const title = book.querySelector('a img').getAttribute('alt');
  
        books.push({
          id,
          title,
          img
        })
      })
    }
    
    res.json(books)
  }catch(error){
    res.json(error)
  }
})

app.get('/book/:id', async(req, res) =>{
  try{
    const {id} = req.params;
    const response = await axios.get(`https://www.hindawi.org/books/${id}`)
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);
  
    const section = $(".singleBook")
    const title = section.querySelector('.container .pageContent article .details h2').textContent;
    const author =  section.querySelector('.container .pageContent article .details .author').textContent.trim()
    const authorId =  section.querySelector('.container .pageContent article .details .author a').getAttribute('href').replace(/\/contributors/, "");
    const img =  section.querySelector('.container .pageContent article .cover img').getAttribute('src')
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
    const aboutAuthor = section.querySelector('div > main > div.aboutAuthor').textContent.replace(/\s*/, " ")
  
    const type = {
      genre: typeText,
      url:  typeUrl.replace("/books/categories/", "").replace("/", "")
    }
  
    res.json(
      {
        title,
        author,
        authorId:  authorId.replaceAll("/", ""),
        img,
        type,
        words, 
        text,
        downloadLinks,
        date,
        aboutAuthor: aboutAuthor.replace(/\عن المؤلف/, " ").trim(),
        contents,
      }
    )  
  }catch(error){
    res.json(error)
  }

})

app.get('/author/:id', async(req, res) => {
  const {id} = req.params;
  try{
    const response = await axios.get(`https://www.hindawi.org/contributors/${id}`)
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);

    const section = $('.singleAuthor')
    const name = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('alt');
    const img = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('src');
    const descreption = section.querySelector("div > main > article > div.details > div > p").textContent;
    const li = section.querySelectorAll("div > main > div > ul > li")
    const books = []
    li.forEach(book => {
      const id = book.querySelector('a').getAttribute('href').replace("/books/", "").replace("/", "");
      const img =  book.querySelector('a img').getAttribute("src")
      const title =  book.querySelector('a img').getAttribute("alt")
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
  }catch(error){
    res.json(error)
  }
})

app.get('/categories/:title', async(req, res) => {
  const books = []
  const {title} = req.params
  const {numberOfPages} = await getNumberOfBooks(`https://www.hindawi.org/books/categories/${title}/`);
  try{
    for(let i = 1; i <= numberOfPages; i++){
      const response = await axios.get(`https://www.hindawi.org/books/categories/${title}/${i}/`);
      const dom = new JSDOM(response.data);
      const $ = (select) => dom.window.document.querySelector(select);
      const ul = $('body > div > section.allBooks > div > main > div.books_covers > ul');
      const allBooks = ul.querySelectorAll('li');
      allBooks.forEach(book => {
        const id = book.querySelector('a').getAttribute('href').replace(/\/books/, "");
        const img = book.querySelector('a img').getAttribute('src');
        const title = book.querySelector('a img').getAttribute('alt');
  
        books.push({
          id: id.replaceAll("/", ""),
          title,
          img
        })
      })
    }
    res.json(books)  
  }catch(error){
    res.json(error)
  }
})

app.get('/search/:keyword', async(req, res) => {
  const {keyword} = req.params;
  try{
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
        bookId: bookInfo.getAttribute('href').replace(/\/books/, "").replaceAll('/', ""),
        authorId: authorInfo.getAttribute('href').replace(/\/contributors/, "").replaceAll('/', ""),
        bookTitle: bookInfo.textContent,
        authorTitle: authorInfo.textContent,
      })
    })
    res.json(searchResults)
  }catch(error){
    res.json(error)
  }
})

app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))