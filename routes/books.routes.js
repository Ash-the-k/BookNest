import express from "express";

import {
  getAllBooks,
  getBookById,
  getBookPreview,
  editStartedDateForm,
  updateStartedDate,
  editCompletedDateForm,
  updateCompletedDate,
  markCompletedForm,
  markCompleted,
  startReadingForm,
  startReading,
  dropConfirm,
  dropBook,
  wishlistConfirm,
  moveToWishlist,
  searchBooksPage,
  resolvePreviewAction
} from "../controllers/books.controller.js";


const router = express.Router();

router.get("/search", searchBooksPage);
router.get("/preview/:work_olid", getBookPreview);
router.post("/action/:action", resolvePreviewAction);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.get("/:id/edit-started-date", editStartedDateForm);
router.post("/:id/edit-started-date", updateStartedDate);
router.get("/:id/edit-completed-date", editCompletedDateForm);
router.post("/:id/edit-completed-date", updateCompletedDate);
router.get("/:id/mark-completed", markCompletedForm);
router.post("/:id/mark-completed", markCompleted);
router.get("/:id/start-reading", startReadingForm);
router.post("/:id/start-reading", startReading);
router.get("/:id/drop", dropConfirm);
router.post("/:id/drop", dropBook);

router.get("/:id/move-to-wishlist", wishlistConfirm);
router.post("/:id/move-to-wishlist", moveToWishlist);

export default router;
