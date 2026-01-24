import pool from "../db/index.js";
import { validateDates } from "../utils/dateValidator.js";
import { searchBooks } from "../services/openLibrary.service.js";
import {
  getCoverUrls,
  getWorkRating,
  getArchiveAvailability,
  getWorkDescription
} from "../services/openLibrary.service.js";

export const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );

    const booksWithExtras = await Promise.all(
      result.rows.map(async (book) => {
        const ol_rating = await getWorkRating(book.work_olid);

        return {
          ...book,
          cover_urls: book.edition_olid
            ? getCoverUrls(book.edition_olid)
            : null,
          ol_rating
        };
      })
    );

    res.render("pages/library", {
      books: booksWithExtras
    });
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
      [id]
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
      [id]
    );

    const book = bookResult.rows[0];

    let olExtras = {
      cover_urls: null,
      ol_rating: null,
      ia_preview: null,
      description: null
    };

    if (book.edition_olid) {
      olExtras.cover_urls = getCoverUrls(book.edition_olid);
      olExtras.ia_preview = await getArchiveAvailability(book.edition_olid);
    }

    if (book.work_olid) {
      olExtras.ol_rating = await getWorkRating(book.work_olid);
      olExtras.description = await getWorkDescription(book.work_olid);
    }


    res.render("pages/bookDetail", {
      book,
      reviews: reviewsResult.rows,
      isInLibrary: true,
      olExtras
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

export const searchBooksPage = async (req, res) => {
  const query = req.query.q?.trim() || "";
  const page = Number(req.query.page) || 1;
  const limit = 8;

  if (!query) {
    return res.render("pages/search", {
      query,
      results: [],
      page,
    });
  }

  try {
    const results = await searchBooks(query, page, limit);

    res.render("pages/search", {
      query,
      results,
      page,
    });
  } catch (err) {
    console.error(err);
    res.render("pages/search", {
      query,
      results: [],
      page,
    });
  }
};

export const getBookPreview = async (req, res) => {
  const { work_olid } = req.params;

  try {
    // 1️⃣ Fetch work data
    const workRes = await fetch(`https://openlibrary.org/works/${work_olid}.json`);
    if (!workRes.ok) throw new Error("Work not found");

    const work = await workRes.json();

    // 2️⃣ Extract description
    const description = await getWorkDescription(work_olid);

    // 3️⃣ Find an edition (best effort)
    const searchRes = await fetch(
      `https://openlibrary.org/search.json?q=key:/works/${work_olid}&limit=1`
    );
    const searchData = await searchRes.json();
    const doc = searchData.docs?.[0];

    const edition_olid =
      doc?.edition_key?.[0] ??
      doc?.cover_edition_key ??
      null;
      

    // 4️⃣ Author name
    const author = doc?.author_name?.[0] ?? "Unknown author";

    // 5️⃣ OL rating
    const ol_rating = await getWorkRating(work_olid);

    // 6️⃣ IA availability
    let ia_preview = null;
    if (edition_olid) {
      ia_preview = await getArchiveAvailability(edition_olid);
    }

    // 7️⃣ Cover URLs
    const cover_urls = edition_olid ? getCoverUrls(edition_olid) : null;

    res.render("pages/bookDetail", {
      book: {
        title: work.title,
        author,
        work_olid,
        edition_olid
      },
      olExtras: {
        description,
        ol_rating,
        ia_preview,
        cover_urls
      },
      isInLibrary: false,
      reviews: []
    });

  } catch (err) {
    console.error(err);
    res.status(404).render("error");
  }
};

