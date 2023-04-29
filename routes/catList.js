import express from "express";
import {catList} from '../controllers/catList.js'

const router = express.Router();

router.get("/", catList);


export default router;