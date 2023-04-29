import express from "express";
import {getAuthor} from '../controllers/getAuthor.js'
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60 * 60 });
const router = express.Router();

const cacheMiddleware = (duration) => (req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = cache.get(key);
  if (cachedBody) {
    res.json(cachedBody);
  } else {
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};

router.get("/:id", cacheMiddleware(60 * 60), getAuthor);


export default router;