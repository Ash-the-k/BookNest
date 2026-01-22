-- ENUMS
CREATE TYPE book_status AS ENUM (
 'wishlist',
 'reading',
 'completed',
 'dropped'
);


CREATE TYPE rating_tag AS ENUM (
 'perfection',
 'go_for_it',
 'time_pass',
 'skip'
);


-- TABLES
CREATE TABLE books (
 id SERIAL PRIMARY KEY,


 olid VARCHAR NOT NULL UNIQUE,
 isbn VARCHAR,


 title VARCHAR NOT NULL,
 author VARCHAR NOT NULL,


 status book_status NOT NULL,


 started_date DATE,
 completed_date DATE,


 rating_tag rating_tag,


 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE reviews (
 id SERIAL PRIMARY KEY,


 book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,


 content TEXT NOT NULL,


 status_at_time book_status NOT NULL,


 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- INDEXES
CREATE INDEX idx_books_status ON books(status);