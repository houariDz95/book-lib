import express from "express";
import {newBooks} from '../controllers/newBooks.js'

const router = express.Router();

router.get("/", newBooks);


export default router;