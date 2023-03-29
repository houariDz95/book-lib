import axios from 'axios';
import jsdom from 'jsdom';
import {getNumberOfBooks} from '../utils/getNumberOfBooks.js';

export  const getBooks = async (req, res) => {
  const { JSDOM } = jsdom;
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

}