import axios from 'axios';
import { JSDOM } from 'jsdom'
import Author from '../models/contributor.js';

const insertAuthorToDb = async (data, id) => {
  try {
      // Try to find a book with the same id in the database
      const existingBook = await Author.findOne({ bookId: id }); 

      if (!existingBook) {
        // If the book with the same id doesn't exist, insert it
        await Author.create(data);
        console.log(`Inserted book with id: ${id}`);
      } else {
        // If the book with the same id already exists, you can choose to skip or update it
        // For example, you can update the existing book's data with the new data
        await Author.updateOne({ id }, { $set: bookData });
        console.log(`Updated book with id: ${id}`);
      }
  } catch (error) {
    console.error(error);
  }
};



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
    const authorData = { name, img, description, books}
    insertAuthorToDb(authorData, id)
    res.json({
      authorId: id,
      name,
      img,
      description,
      books,
    })

  } catch (error) {
    res.json(error)
  }
}
