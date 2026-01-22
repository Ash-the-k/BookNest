import express from "express";
import { addReview } from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/books/:id/reviews", addReview);

export default router;
