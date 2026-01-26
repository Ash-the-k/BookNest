# BookNest

Personal reading tracker with Open Library integration.

BookNest allows users to search, preview, and track books with
reading status, dates, ratings, and reviews.

---

## Tech Stack

- Node.js
- Express
- PostgreSQL
- EJS (temporary UI)
- Open Library API

---

## Setup

### 1. Database
```bash
createdb booknest
psql -U postgres -d booknest -f sql/schema.sql
psql -U postgres -d booknest -f sql/seed.sql
````

### 2. Install & Run

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

---

## Documentation

* **DEV_NOTES.md** — complete backend behavior & rules

---

## Status

Backend complete and stable.
Frontend under development.
