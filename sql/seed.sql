-- Reset tables
DELETE FROM reviews;
DELETE FROM books;

-- Seed Books
INSERT INTO books (
  work_olid,
  edition_olid,
  isbn,
  title,
  author,
  status,
  started_date,
  completed_date,
  rating_tag
)
VALUES
(
  'OL17930368W',
  'OL36647151M',
  NULL,
  'Atomic Habits',
  'James Clear',
  'completed',
  '2024-01-01',
  '2024-01-20',
  'go_for_it'
),
(
  'OL17713267W',
  'OL26314691M',
  NULL,
  'Deep Work',
  'Cal Newport',
  'reading',
  '2024-02-10',
  NULL,
  NULL
),
(
  'OL27366295W',
  'OL37301440M',
  NULL,
  'The Psychology of Money',
  'Michael Argyle',
  'wishlist',
  NULL,
  NULL,
  NULL
),
(
  'OL28521353W',
  'OL40348052M',
  NULL,
  'Meditations',
  'Marcus Aurelius',
  'dropped',
  '2024-03-01',
  NULL,
  NULL
),
(
  'OL20068530W',
  'OL27248516M',
  NULL,
  'Verity',
  'Colleen Hoover',
  'wishlist',
  NULL,
  NULL,
  NULL
),
(
  'OL17112428W',
  'OL25682908M',
  NULL,
  'The Girl on the Train',
  'Paula Hawkins',
  'reading',
  '2024-04-05',
  NULL,
  NULL
),
(
  'OL33690385W',
  NULL,
  NULL,
  'The Merchant of Venice',
  'William Shakespeare',
  'wishlist',
  NULL,
  NULL,
  NULL
);

-- Seed Reviews
-- Note: IDs correspond to insert order above
INSERT INTO reviews (book_id, content, status_at_time)
VALUES
(1, 'Very practical and easy to apply.', 'completed'),
(2, 'Strong concepts, still reading through it.', 'reading'),
(4, 'Could not connect with the writing style.', 'dropped');
