import pool from "../db/index.js";

export const ensureBookExists = async ({
  work_olid,
  edition_olid,
  title,
  author
}) => {
  // 1. Check if book already exists
  const existing = await pool.query(
    "SELECT id FROM books WHERE work_olid = $1",
    [work_olid]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // 2. Insert minimal book
  const insert = await pool.query(
    `
    INSERT INTO books (work_olid, edition_olid, title, author, status)
    VALUES ($1, $2, $3, $4, 'wishlist')
    RETURNING id
    `,
    [work_olid, edition_olid, title, author]
  );

  return insert.rows[0].id;
};
