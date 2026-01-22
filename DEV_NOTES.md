# BookNest — Internal Developer Notes (v1)

> **Purpose**  
> This document is the single source of truth for BookNest’s internal architecture, business rules, and development decisions.  
> It is meant for developers — **not users**.

---

## 1. Core Philosophy (NON-NEGOTIABLE)

- Single-user application
- Backend-first correctness
- Business rules live in controllers or shared utilities
- UI may evolve, but must never lie about state
- No silent or implicit state mutation

---

## 2. Data Ownership & Authority

### Database is the source of truth for:
- Book status
- Dates (started / completed)
- Rating
- Reviews

### Controllers are the ONLY place where:
- Business rules are enforced
- Validation happens
- State transitions are allowed or blocked

### Views (EJS):
- Never enforce business logic
- Only display data and collect user intent

---

## 3. Status System (FINAL)

### Status values
```

wishlist
reading
completed
dropped

```

### Transition philosophy
> **Any status can transition to any other status.**

There are **no restricted transitions**.  
What changes is **what data is required** when entering a status.

---

## 4. Status Intent vs Status Mutation (CRITICAL)

### ❌ Never allowed
- Direct status change from dropdowns or links
- Mutating DB state on a plain GET request

### ✅ Required pattern
```

User intent → Confirmation / Data collection → Controller validation → DB update

```

### Route convention
| Purpose | Route |
|------|------|
| Show intent | `GET /books/:id/action` |
| Perform mutation | `POST /books/:id/action` |

Confirmation pages exist today and will later become modals **without changing controllers**.

---

## 5. Date Fields & Rules

### Fields
- `started_date`
- `completed_date`

### Rules
- Dates can exist in **any status**
- Dates are **never auto-deleted**
- Dates are editable independently
- Validation happens **only if both dates exist**

### Validation rule
```

completed_date ≥ started_date

```

### Centralized validation
All date validation must go through:

```

utils/dateValidator.js

````

Controllers must never implement their own date comparisons.

---

## 6. Date Handling (IMPORTANT)

PostgreSQL `DATE` fields must NOT be treated as JavaScript `Date` objects.

### Required practice
- Normalize dates in SQL using:
```sql
to_char(date_column, 'YYYY-MM-DD')
````

### ❌ Never

* Pass raw DATE objects to EJS
* Use `new Date()` directly for DATE comparison
* Use `toISOString()` for UI rendering

This prevents timezone-related bugs.

---

## 7. Rating Rules (FINAL)

* Rating belongs to the **book entity**
* Rating persists across rereads
* Rating is mandatory **only when marking a book as completed**
* Rating is displayed whenever `rating_tag` exists, regardless of current status

Correct UI rule:

```ejs
<% if (book.rating_tag) { %>
```

---

## 8. Reviews Rules

* Reviews can be added only if:

```
book.status !== 'wishlist'
```

* Review content is editable
* `status_at_time` is immutable
* Reviews are ordered newest → oldest
* Reviews do NOT own ratings

---

## 9. Error Handling Strategy

### Current (Intentional)

* Fail hard
* Redirect to `error.ejs`
* No silent failures

### Planned (Future)

* Inline validation messages
* Modal-based error feedback
* Controllers remain unchanged

---

## 10. Pages → Modals Strategy

The following pages are intentionally implemented as full pages and will later be converted to modals:

```
editStartedDate.ejs
editCompletedDate.ejs
markCompleted.ejs
startReading.ejs
dropConfirm.ejs
wishlistConfirm.ejs
```

This is **not technical debt** — it is staged UI development.

---

## 11. Routing Overview

This section reflects **all routes that currently exist** in the codebase.

---

### Library & Detail

| Method | Route        | Purpose             |
| ------ | ------------ | ------------------- |
| GET    | `/books`     | Library (all books) |
| GET    | `/books/:id` | Book detail page    |

---

### Status Transitions (Intent-Based)

| Method | Route                         | Purpose                                |
| ------ | ----------------------------- | -------------------------------------- |
| GET    | `/books/:id/mark-completed`   | Collect data to mark book as completed |
| POST   | `/books/:id/mark-completed`   | Mark book as completed                 |
| GET    | `/books/:id/start-reading`    | Collect started date (optional)        |
| POST   | `/books/:id/start-reading`    | Move book to reading                   |
| GET    | `/books/:id/drop`             | Drop confirmation                      |
| POST   | `/books/:id/drop`             | Mark book as dropped                   |
| GET    | `/books/:id/move-to-wishlist` | Wishlist confirmation                  |
| POST   | `/books/:id/move-to-wishlist` | Move book to wishlist                  |

---

### Date Editing

| Method | Route                            | Purpose               |
| ------ | -------------------------------- | --------------------- |
| GET    | `/books/:id/edit-started-date`   | Edit started date     |
| POST   | `/books/:id/edit-started-date`   | Update started date   |
| GET    | `/books/:id/edit-completed-date` | Edit completed date   |
| POST   | `/books/:id/edit-completed-date` | Update completed date |

---

### Reviews

| Method | Route                | Purpose      |
| ------ | -------------------- | ------------ |
| POST   | `/books/:id/reviews` | Add a review |

---

## 12. What Must NEVER Be Broken (GUARDRAILS)

1. **Status must never be changed directly from UI**

   * Always go through intent → controller → validation

2. **DATE columns must never be handled as JavaScript Date objects**

   * Normalize at SQL level
   * Validate only via `dateValidator`

3. **Business rules must never live in views**

   * EJS = display + input only
   * Controllers decide truth

If any change violates these rules, stop and redesign.

---

## 13. Database Seeding (Development Only)

Seeding is used only for development and testing.

### Command

```bash
psql -U postgres -d booknest -f sql/seed.sql
```

* PostgreSQL must be running
* Database name: `booknest`
* Safe to re-run during development

---

## 14. Canonical Folder Structure

```
.
├── controllers
│   ├── books.controller.js
│   └── reviews.controller.js
├── db
│   └── index.js
├── index.js
├── package.json
├── package-lock.json
├── public
│   ├── css
│   └── js
├── routes
│   ├── books.routes.js
│   └── reviews.routes.js
├── services
├── sql
│   ├── schema.sql
│   └── seed.sql
├── utils
│   └── dateValidator.js
└── views
    ├── error.ejs
    ├── pages
    │   ├── bookDetail.ejs
    │   ├── dropConfirm.ejs
    │   ├── editCompletedDate.ejs
    │   ├── editStartedDate.ejs
    │   ├── library.ejs
    │   ├── markCompleted.ejs
    │   ├── startReading.ejs
    │   └── wishlistConfirm.ejs
    └── partials
```

---

## 15. Intentional Omissions (v1)

* Authentication
* User accounts
* Audit history
* Analytics
* Recommendation engine

These are consciously deferred.

---
