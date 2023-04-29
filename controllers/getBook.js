import { JSDOM } from 'jsdom';
import NodeCache from 'node-cache';
import axios from 'axios';

const cache = new NodeCache({ stdTTL: 60 * 60 });


export const getBook = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `book_${id}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    console.log(`Cache hit for ${cacheKey}`);
    res.json(cachedResult);
  } else {
    console.log(`Cache miss for ${cacheKey}`);

    try {
      const response = await axios.get(`https://www.hindawi.org/books/${id}`);
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

      const result = {
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
      };

      cache.set(cacheKey, result);
      res.json(result);
    } catch (error) {
      res.json(error);
    }
  }
}


