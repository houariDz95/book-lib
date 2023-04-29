import axios from 'axios';
import { JSDOM } from 'jsdom'



export const getAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://www.hindawi.org/contributors/${id}`)
    const dom = new JSDOM(response.data);
    const $ = (select) => dom.window.document.querySelector(select);

    const section = $('.singleAuthor')
    const name = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('alt');
    const img = section.querySelector('div > main > article > div.cover > figure > img').getAttribute('src');
    const description = section.querySelector("div > main > article > div.details > div ").textContent.replace(/\s*/, " ").trim()
    const li = section.querySelectorAll("div > main > div > ul > li")


    const books = []
    li.forEach((book, i) => {
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
      description,
      books,
    })
  } catch (error) {
    res.json(error)
  }
}
