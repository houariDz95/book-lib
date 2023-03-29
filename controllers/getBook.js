import axios from 'axios';
import jsdom from  'jsdom';


export const getBook = async(req, res) => {
  const { JSDOM } = jsdom;
  const {id} = req.params;

  try{
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
}