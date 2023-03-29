import express from 'express';
import books from './routes/books.js'

const app = express();
const PORT = 5000 || process.env.PORT

app.get('/', (req, res) => {res.send("welcome to hundawi scraper api")})
app.use('/api/books', books)

app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))