import pool from "../db/index.js";
import { validateDates } from "../utils/dateValidator.js";

export const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books ORDER BY created_at DESC",
    );
    res.render("pages/library", { books: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const bookResult = await pool.query(
      `SELECT
        id,
        work_olid,
        edition_olid,
        isbn,
        title,
        author,
        status,
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date,
        rating_tag
        FROM books
        WHERE id = $1`,
      [id],
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).render("error");
    }

    const reviewsResult = await pool.query(
      `
      SELECT *
      FROM reviews
      WHERE book_id = $1
      ORDER BY created_at DESC
      `,
      [id],
    );

    res.render("pages/bookDetail", {
      book: bookResult.rows[0],
      reviews: reviewsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const editStartedDateForm = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
            id,
            title,
            to_char(started_date, 'YYYY-MM-DD') AS started_date,
            to_char(completed_date, 'YYYY-MM-DD') AS completed_date
        FROM books
        WHERE id = $1
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    res.render("pages/editStartedDate", {
      book: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const updateStartedDate = async (req, res) => {
  const { id } = req.params;
  const { started_date } = req.body;

  try {
    const result = await pool.query(
      "SELECT started_date, completed_date FROM books WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const book = result.rows[0];

    validateDates({
      existingStartedDate: book.started_date,
      existingCompletedDate: book.completed_date,
      newStartedDate: started_date || null,
    });

    await pool.query(
      "UPDATE books SET started_date = $1, updated_at = NOW() WHERE id = $2",
      [started_date || null, id],
    );

    res.redirect(`/books/${id}`);
  } catch (err) {
    console.error(err.message);
    res.status(400).render("error");
  }
};

export const editCompletedDateForm = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date
      FROM books
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    res.render("pages/editCompletedDate", {
      book: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const updateCompletedDate = async (req, res) => {
  const { id } = req.params;
  const { completed_date } = req.body;

  try {
    const result = await pool.query(
      `
      SELECT
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date
      FROM books
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const book = result.rows[0];

    validateDates({
      existingStartedDate: book.started_date,
      existingCompletedDate: book.completed_date,
      newCompletedDate: completed_date || null,
    });

    await pool.query(
      "UPDATE books SET completed_date = $1, updated_at = NOW() WHERE id = $2",
      [completed_date || null, id],
    );

    res.redirect(`/books/${id}`);
  } catch (err) {
    console.error(err.message);
    res.status(400).render("error");
  }
};

export const markCompletedForm = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
        id,
        title,
        rating_tag,
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date
        FROM books
        WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    res.render("pages/markCompleted", {
      book: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const markCompleted = async (req, res) => {
  const { id } = req.params;
  const { rating_tag, completed_date } = req.body;

  try {
    if (!rating_tag) {
      throw new Error("Rating is required");
    }

    const result = await pool.query(
      `
      SELECT
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date
      FROM books
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const book = result.rows[0];

    validateDates({
      existingStartedDate: book.started_date,
      existingCompletedDate: book.completed_date,
      newCompletedDate: completed_date || null,
    });

    await pool.query(
      `
      UPDATE books
      SET
        status = 'completed',
        rating_tag = $1,
        completed_date = $2,
        updated_at = NOW()
      WHERE id = $3
      `,
      [rating_tag, completed_date || null, id],
    );

    res.redirect(`/books/${id}`);
  } catch (err) {
    console.error(err.message);
    res.status(400).render("error");
  }
};

export const startReadingForm = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    SELECT
      id,
      title,
      to_char(started_date, 'YYYY-MM-DD') AS started_date,
      to_char(completed_date, 'YYYY-MM-DD') AS completed_date
    FROM books
    WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  res.render("pages/startReading", {
    book: result.rows[0],
  });
};

export const startReading = async (req, res) => {
  const { id } = req.params;
  const { started_date } = req.body;

  try {
    const result = await pool.query(
      `
      SELECT
        to_char(started_date, 'YYYY-MM-DD') AS started_date,
        to_char(completed_date, 'YYYY-MM-DD') AS completed_date
      FROM books
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const book = result.rows[0];

    validateDates({
      existingStartedDate: book.started_date,
      existingCompletedDate: book.completed_date,
      newStartedDate: started_date || null,
    });

    await pool.query(
      `
      UPDATE books
      SET
        status = 'reading',
        started_date = COALESCE($1, started_date),
        updated_at = NOW()
      WHERE id = $2
      `,
      [started_date || null, id],
    );

    res.redirect(`/books/${id}`);
  } catch (err) {
    res.status(400).render("error");
  }
};

export const dropConfirm = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT id, title, rating_tag FROM books WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  const book = result.rows[0];

  // 🚫 Guard: cannot drop if ever completed
  if (book.rating_tag) {
    return res.status(400).render("error");
  }

  res.render("pages/dropConfirm", { book });
};

export const dropBook = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT rating_tag FROM books WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  if (result.rows[0].rating_tag) {
    return res.status(400).render("error");
  }

  await pool.query(
    `
    UPDATE books
    SET status = 'dropped', updated_at = NOW()
    WHERE id = $1
    `,
    [id],
  );

  res.redirect(`/books/${id}`);
};

export const wishlistConfirm = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query("SELECT id, title FROM books WHERE id = $1", [
    id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  res.render("pages/wishlistConfirm", {
    book: result.rows[0],
  });
};

export const moveToWishlist = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `
    UPDATE books
    SET status = 'wishlist', updated_at = NOW()
    WHERE id = $1
    `,
    [id],
  );

  res.redirect(`/books/${id}`);
};

// For API

export const previewBookByWorkOlid = async (req, res) => {
  const { work_olid } = req.params;

  try {
    // 1. Check if book already exists in DB
    const result = await pool.query(
      "SELECT id FROM books WHERE work_olid = $1",
      [work_olid]
    );

    // 2. If exists, redirect to real book page
    if (result.rows.length > 0) {
      return res.redirect(`/books/${result.rows[0].id}`);
    }

    // 3. Not in library yet → render preview mode
    // (No OL calls yet, placeholders for now)
    res.render("pages/bookDetail", {
      book: {
        title: "Loading…",
        author: "Loading…",
        work_olid,
        edition_olid: null,
        status: null,
        started_date: null,
        completed_date: null,
        rating_tag: null
      },
      olExtras: {},
      isInLibrary: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error");
  }
};

export const searchBooksPage = async (req, res) => {
  const query = req.query.q?.trim() || "";
  const page = Number(req.query.page) || 1;
  const limit = 8;

  if (!query) {
    return res.render("pages/search", {
      query,
      results: [],
      page
    });
  }

  try {
    const results = await searchBooks(query, page, limit);

    res.render("pages/search", {
      query,
      results,
      page
    });
  } catch (err) {
    console.error(err);
    res.render("pages/search", {
      query,
      results: [],
      page
    });
  }
};
