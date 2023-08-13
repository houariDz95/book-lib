import express from 'express';
import Books from './routes/books.js';
import Author from './routes/author.js';
import Categories from './routes/categories.js';
import Search from './routes/search.js'
import New from './routes/new.js'
import CatList from './routes/catList.js'
import { getBook } from './controllers/getBook.js';
const app = express();
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => { res.send("welcome to oumat-iqra library api") })


app.use('/books', Books)
app.use('/contributors', Author)
app.use('/categories', Categories);
app.use('/search', Search);
app.use('/new', New);
//app.use('/catList', CatList)



app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))