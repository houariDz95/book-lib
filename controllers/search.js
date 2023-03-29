import axios from 'axios';
import {JSDOM} from 'jsdom';

export const searchData = async (req, res) => {
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
}


