import express from 'express';
import {getBook} from '../controllers/getBook.js';
import {getBooks} from '../controllers/getBooks.js';
import {getSpesificBooks} from '../controllers/getSpesificBooks.js';
import {getAuthorInfo} from '../controllers/getAuthorInfo.js'
import {searchData} from '../controllers/search.js'
const router = express.Router();

router.get('/book/:id', getBook);
router.get('/', getBooks);
router.get('/category/:title', getSpesificBooks);
router.get('/author/:id', getAuthorInfo);
router.get('/search/:keyword', searchData);

export default router