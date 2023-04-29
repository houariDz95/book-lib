import { JSDOM } from 'jsdom';
import axios from 'axios';

export const catList = async(req, res) => {
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
}