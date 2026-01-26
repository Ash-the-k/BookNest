# BookNest — Developer Notes (Backend Locked)

> **Status:** Backend stable & feature-complete for v1
> **Scope:** Node.js + Express + PostgreSQL + Open Library integration
> **UI:** EJS (temporary), frontend revamp planned

---

## 1. Project Overview

**BookNest** is a **single-user personal reading tracker**.

It allows users to:

* Discover books via **Open Library**
* Preview books **without persisting**
* Add books to their library only via **explicit actions**
* Track:

  * Reading status
  * Dates
  * Ratings
  * Reviews

The backend is **state-driven**, with **strict business rules enforced server-side**.

External data is **never stored** — only fetched when needed.

---

## 2. Folder Structure (Current)

```
controllers/
  books.controller.js
  reviews.controller.js

routes/
  books.routes.js
  reviews.routes.js

services/
  openLibrary.service.js
  bookResolver.service.js

utils/
  dateValidator.js

db/
  index.js

views/pages/
  library.ejs
  search.ejs
  bookDetail.ejs
  editStartedDate.ejs
  editCompletedDate.ejs
  markCompleted.ejs
  startReading.ejs
  dropConfirm.ejs
  wishlistConfirm.ejs

sql/
  schema.sql
  seed.sql

index.js
```

---

## 3. Database Schema (PostgreSQL)

### ENUMS

```sql
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
```

### BOOKS TABLE

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,

  work_olid VARCHAR NOT NULL UNIQUE,
  edition_olid VARCHAR,

  isbn VARCHAR,
  title VARCHAR NOT NULL,
  author VARCHAR NOT NULL,

  status book_status NOT NULL,

  started_date DATE,
  completed_date DATE,

  rating_tag rating_tag,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### REVIEWS TABLE

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  book_id INT REFERENCES books(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  status_at_time book_status NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. PostgreSQL — How to Run

### Start psql

```bash
psql -U postgres
```

### Create Database

```sql
CREATE DATABASE booknest;
```

### Run Schema

```bash
psql -U postgres -d booknest -f sql/schema.sql
```

### Seed Database

```bash
psql -U postgres -d booknest -f sql/seed.sql
```

---

## 5. Core Domain Model

### Book Identity Rule

* **`work_olid` is canonical**
* One DB row per work
* Editions are secondary and optional

### Stored (Owned) Data

* title
* author
* work_olid
* edition_olid
* status
* dates
* rating_tag
* reviews

### External (Fetched) Data

* cover images
* Open Library rating
* description
* Internet Archive preview

---

## 6. Book Lifecycle & Business Rules (CRITICAL)

### Status Transitions (Allowed)

From **any state**:

* wishlist → reading / completed / dropped
* reading → wishlist / completed / dropped
* completed → wishlist / reading (re-read)
* dropped → wishlist / reading / completed (re-read)

### Completion Rules

* `rating_tag` **mandatory**
* `completed_date >= started_date`

### Drop Restrictions

* ❌ Cannot drop a book **if it has ever been rated**

### Enforcement

* All date rules enforced via `validateDates()`
* Status rules enforced in controllers

---

## 7. Routes — COMPLETE MAP

---

### 7.1 Library & Navigation

| Method | Route        | Controller  | Purpose             |
| ------ | ------------ | ----------- | ------------------- |
| GET    | `/`          | index.js    | Redirect → `/books` |
| GET    | `/books`     | getAllBooks | Library page        |
| GET    | `/books/:id` | getBookById | Book detail         |

---

### 7.2 Open Library Search

| Method | Route           | Controller      | Purpose                |
| ------ | --------------- | --------------- | ---------------------- |
| GET    | `/books/search` | searchBooksPage | OL search + pagination |

---

### 7.3 Preview (NOT persisted)

| Method | Route                       | Controller     | Purpose      |
| ------ | --------------------------- | -------------- | ------------ |
| GET    | `/books/preview/:work_olid` | getBookPreview | Preview book |

Preview:

* Does NOT write to DB
* Shows OL metadata
* Actions available

---

### 7.4 Action-Based Book Creation

Used **only when previewed book is not in DB**.

| Method | Route                            |
| ------ | -------------------------------- |
| POST   | `/books/action/start-reading`    |
| POST   | `/books/action/mark-completed`   |
| POST   | `/books/action/move-to-wishlist` |
| POST   | `/books/action/drop`             |

Flow:

1. `ensureBookExists(work_olid)`
2. Insert book if missing
3. Perform action

---

### 7.5 Status & Date Actions (Library Books)

| Method | Route                            | Purpose            |
| ------ | -------------------------------- | ------------------ |
| GET    | `/books/:id/start-reading`       | Start reading form |
| POST   | `/books/:id/start-reading`       | Save reading       |
| GET    | `/books/:id/mark-completed`      | Completion form    |
| POST   | `/books/:id/mark-completed`      | Complete book      |
| GET    | `/books/:id/edit-started-date`   | Edit start date    |
| POST   | `/books/:id/edit-started-date`   | Save start date    |
| GET    | `/books/:id/edit-completed-date` | Edit completion    |
| POST   | `/books/:id/edit-completed-date` | Save completion    |

---

### 7.6 Drop & Wishlist (with confirmation)

| Method | Route                         |
| ------ | ----------------------------- |
| GET    | `/books/:id/drop`             |
| POST   | `/books/:id/drop`             |
| GET    | `/books/:id/move-to-wishlist` |
| POST   | `/books/:id/move-to-wishlist` |

---

### 7.7 Reviews

| Method | Route                |
| ------ | -------------------- |
| POST   | `/books/:id/reviews` |

Rules:

* ❌ Not allowed in wishlist
* Stores `status_at_time`

---

## 8. Open Library Integration

### Used APIs

* `/search.json`
* `/works/:olid.json`
* `/works/:olid/ratings.json`
* `/api/books`
* Covers API

### Stored in DB?

❌ No — fetched dynamically

---

## 9. EJS Contract (VERY IMPORTANT)

### bookDetail.ejs expects:

```js
{
  book: {
    id?,
    title,
    author,
    work_olid,
    edition_olid,
    status?,
    started_date?,
    completed_date?,
    rating_tag?
  },
  olExtras: {
    description?,
    ol_rating?,
    cover_urls?,
    ia_preview?
  },
  isInLibrary: boolean,
  reviews: []
}
```

UI logic **branches heavily** on `isInLibrary`.

---

## 10. index.js Behavior

* `/` → redirects to `/books`
* `/books` → library
* `/books/search` → OL search
* `/books/preview/:work_olid` → preview

---

## 11. Locked Decisions (DO NOT CHANGE)

* `work_olid` is canonical
* Preview never mutates DB
* Actions create books
* Rating once set is permanent
* Date validation centralized
* External data not persisted

---

## 12. Current Status

✅ Backend stable
✅ Preview → Persist flow solid
✅ Business rules enforced
✅ OL integration complete
❌ UI temporary

---

## 13. Next Phase (Frontend)

* Frontend plan document
* Replace EJS with components
* Modals instead of pages
* Tabs & filters
* Inline errors

---
