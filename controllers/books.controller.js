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
            olid,
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

export const updateBookStatus = async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  try {
    const result = await pool.query("SELECT status FROM books WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const currentStatus = result.rows[0].status;

    // Allowed transitions
    const allowedTransitions = {
      wishlist: ["reading"],
      reading: ["completed", "dropped"],
      completed: ["dropped"],
      dropped: ["reading"],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).render("error");
    }

    await pool.query(
      "UPDATE books SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, id],
    );

    res.redirect(`/books/${id}`);
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
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).render("error");
    }

    const book = result.rows[0];

    validateDates({
      existingStartedDate: book.started_date,
      existingCompletedDate: book.completed_date,
      newStartedDate: started_date || null
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
      [started_date || null, id]
    );

    res.redirect(`/books/${id}`);
  } catch (err) {
    res.status(400).render("error");
  }
};

export const dropConfirm = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT id, title FROM books WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  res.render("pages/dropConfirm", {
    book: result.rows[0]
  });
};


export const dropBook = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `
    UPDATE books
    SET status = 'dropped', updated_at = NOW()
    WHERE id = $1
    `,
    [id]
  );

  res.redirect(`/books/${id}`);
};

export const wishlistConfirm = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT id, title FROM books WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).render("error");
  }

  res.render("pages/wishlistConfirm", {
    book: result.rows[0]
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
    [id]
  );

  res.redirect(`/books/${id}`);
};

