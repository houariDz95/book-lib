import express from 'express';
import books from './routes/books.js'
import axios from 'axios';
import {JSDOM} from 'jsdom'
const app = express();
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {res.send("welcome to hundawi scraper api")})
app.use('/api/books', books)

app.get('/autor', async(req, res) => {
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


app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))