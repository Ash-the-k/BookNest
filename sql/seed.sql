-- Clear existing data (safe because reviews cascade)
DELETE FROM reviews;
DELETE FROM books;

-- BOOKS
INSERT INTO books (
  olid,
  isbn,
  title,
  author,
  status,
  started_date,
  completed_date,
  rating_tag
) VALUES
-- Wishlist book
(
  'OL123W',
  NULL,
  'Deep Work',
  'Cal Newport',
  'wishlist',
  NULL,
  NULL,
  NULL
),

-- Currently reading book
(
  'OL456R',
  '9780140449136',
  'Atomic Habits',
  'James Clear',
  'reading',
  '2025-01-10',
  NULL,
  NULL
),

-- Completed book
(
  'OL789C',
  '9780062316097',
  'The Alchemist',
  'Paulo Coelho',
  'completed',
  '2024-12-01',
  '2024-12-20',
  'go_for_it'
);

-- REVIEWS (linked to completed book)
INSERT INTO reviews (
  book_id,
  content,
  status_at_time
) VALUES
(
  3,
  'A simple but meaningful read. Felt calm reading this.',
  'reading'
),
(
  3,
  'Finished it today. The message really sticks with you.',
  'completed'
);
