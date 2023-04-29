import express from "express";
import {getBooks} from '../controllers/getBooks.js'
import {getBook} from '../controllers/getBook.js'

const router = express.Router();

router.get("/:id", getBook);
router.get("/", getBooks);


export default router;