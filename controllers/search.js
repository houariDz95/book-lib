import { JSDOM } from 'jsdom';
import axios from 'axios';
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60 * 60 });

export const search = async(req, res)=> {
  const { keyword } = req.params;
  const cacheKey = `searchCacheKey_${keyword}`;
  let searchResults = cache.get(cacheKey);

  if (!searchResults) {
    try {
      const response = await axios.get(`https://www.hindawi.org/search/keyword/${keyword}/`);
      const dom = new JSDOM(response.data);
      const $ = (select) => dom.window.document.querySelector(select);
      const ul = $("section.search > .container > .pageContent > form > div.searchResults > ul");

      const allResults = ul.querySelectorAll('li');
      searchResults = []
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
      cache.set(cacheKey, searchResults, 60 * 60); // cache for 1 hour
    } catch (error) {
      res.json(error)
    }
  }

  res.json(searchResults)
}