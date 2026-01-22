import pool from "../db/index.js";

export const addReview = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    // 1. Fetch book status
    const bookResult = await pool.query(
      "SELECT status FROM books WHERE id = $1",
      [id]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).render("error");
    }

    const bookStatus = bookResult.rows[0].status;

    // 2. Enforce rule: no reviews for wishlist
    if (bookStatus === "wishlist") {
      return res.status(403).render("error");
    }

    // 3. Insert review
    await pool.query(
      `
      INSERT INTO reviews (book_id, content, status_at_time)
      VALUES ($1, $2, $3)
      `,
      [id, content, bookStatus]
    );

    // 4. Redirect back to book page
    res.redirect(`/books/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};
