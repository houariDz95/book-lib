import express from 'express';
import books from './routes/books.js'

const app = express();
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {res.send("welcome to hundawi scraper api")})
app.use('/api/books', books)

app.listen(PORT, () => console.log(`surver runnin on port ${PORT}`))