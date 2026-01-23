DELETE FROM reviews;
DELETE FROM books;

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
  'OL45804W',
  'OL1397864M',
  '9781590304481',
  'Zen Speaks',
  'Zhizhong Cai',
  'completed',
  '2024-01-01',
  '2024-01-10',
  'go_for_it'
),
(
  'OL82563W',
  'OL7353617M',
  NULL,
  'Atomic Habits',
  'James Clear',
  'reading',
  '2024-02-01',
  NULL,
  NULL
),
(
  'OL262758W',
  'OL26401862M',
  NULL,
  'Deep Work',
  'Cal Newport',
  'wishlist',
  NULL,
  NULL,
  NULL
);
