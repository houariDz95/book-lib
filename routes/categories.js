import express from "express";
import {getBooksCat} from '../controllers/getBooksCat.js'

const router = express.Router();

router.get("/:title", getBooksCat);


export default router;