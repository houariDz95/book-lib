import express from "express";
import {getBooks} from '../controllers/getBooks.js'
import {search} from '../controllers/search.js'

const router = express.Router();

router.get("/:keyword", search);


export default router;