import axios from 'axios';
import jsdom from 'jsdom';
export async function getNumberOfBooks (url){
  const { JSDOM } = jsdom;
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);

  const booksLen = dom.window.document.querySelector("body > div > section.allBooks > div > main > div:nth-child(1) > div.stats > p").textContent.split(" ")[8]
  const p2e = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  const numberOfBooks = p2e(booksLen)
  const numberOfPages = Math.ceil(numberOfBooks / 20)
  return { numberOfPages}
}

