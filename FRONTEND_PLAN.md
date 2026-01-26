# BookNest — FRONTEND_PLAN.md
> **Status:** Frontend implementation plan (EJS + CSS + JS)
> **Stack Locked:** EJS, Vanilla JS, CSS, Bootstrap 5  
> **Design Theme:** Old manuscript / vintage book / paper texture  
> **Backend:** Already stable — do NOT change backend logic

---

## 1. Core Frontend Principles (LOCKED)

- **No frameworks** (React/Vue/etc.)
- **EJS-first rendering**
- **Bootstrap grid system**
- **Bootstrap modals** instead of page navigations where applicable
- **Preserve all existing backend rules**
- **No UI logic duplication of backend rules**
- **All existing EJS conditionals must remain logically intact**
- **Animations + skeleton loaders required**
- **Responsive from day one**

---

## 2. Global Layout Structure

### Pages
- `/books` → Library
- `/books/search` → Search Results
- `/books/preview/:work_olid` → Book Preview
- `/books/:id` → Book Detail
- `/about` → About Page

### Common Layout
- Top **Navbar**
- Main content
- Footer

---

## 3. Navbar (Global)

### Required Elements
- **Brand:** BookNest
- **Search Icon**
  - Expands into search input on click
  - Submits via:
    ```
    method="GET"
    action="/books/search"
    ```
  - No library search (yet)

- **Links**
  - Library
  - About

### Behavior
- Search bar expands/collapses with animation
- Works on mobile (full-width overlay search)

---

## 4. Library Page (`library.ejs`)

### Layout
- **Grid / Card layout**
- Entire card clickable → `/books/:id`
- No “View Details” button

### Book Card Elements
- Cover Image
- Title
- Author
- **Status Ribbon**
  - Appears on cover corner
  - Color coded:
    - wishlist → neutral parchment
    - reading → blue
    - completed → green
    - dropped → red
- **Ratings**
  - OL Rating → star badge (transparent, outlined)
  - User Rating → solid badge (unique per rating)
- Hover animation (lift + shadow)

### Empty State
- Illustration
- “No books yet” message
- CTA → Search Books

---

## 5. Search Results Page (`search.ejs`)

### Layout
- Same card/grid system as Library
- Entire card clickable → `/books/preview/:work_olid`

### Card Contents
- Cover
- Title
- Author
- OL Rating (stars badge only)

### Skeleton Loaders
- Placeholder cards while OL API loads

---

## 6. Book Preview Page (`bookDetail.ejs`, `isInLibrary=false`)

### Purpose
- Show **full book context**
- Allow actions **without DB mutation until action**

### Elements
- Cover image
- Title
- Author
- OL Rating (stars)
- Internet Archive link (if available)
- Short Description
  - Max height
  - “Read more” expands text
- **Actions Section**
  - Mark Completed
  - Start Reading
  - Move to Wishlist
  - Drop
- Actions submit via:
```
POST /books/action/:action
```

### Notes
- No reviews
- No dates
- No edit buttons

---

## 7. Book Detail Page (`bookDetail.ejs`, `isInLibrary=true`)

### Layout
- Cover (with status ribbon)
- Title
- Author
- **Your Rating** (badge)
- **Open Library Rating** (stars)
- Internet Archive link
- Description (collapsible)

### Actions (Preserve Rules)
- Visibility rules unchanged
- **All actions open in Bootstrap modals**
- mark completed
- start reading
- move to wishlist
- drop

### Dates
- Started Date
- Completed Date
- Edit buttons open **modals**, not pages

### Reviews
- List existing reviews
- Add Review (modal)
- Disabled when status = wishlist

---

## 8. Modals (IMPORTANT)

### Pages Converted to Modals
- markCompleted.ejs
- startReading.ejs
- dropConfirm.ejs
- wishlistConfirm.ejs
- editStartedDate.ejs
- editCompletedDate.ejs
- addReview

### Rules
- Same form actions
- Same validations
- Same backend routes
- No logic duplication

---

## 9. About Page (`about.ejs`)

### Style
- Old parchment / manuscript
- Glass-card components
- Icons (FontAwesome / Remix / custom SVG)

### Sections
- Hero section
- Project Vision
- Core Technologies
- About the Developer
- GitHub links

### Tone
- Personal
- Creative
- Matches previous projects aesthetic

---

## 10. Visual Theme

### Colors
- Sepia / parchment backgrounds
- Ink-like text
- Muted accent colors

### Fonts
- Serif primary
- Handwritten accent (titles only)

### Effects
- Page grain texture
- Subtle shadows
- Hover lift animations
- Page fade-in

---

## 11. Animations

- Card hover lift
- Modal fade + slide
- Skeleton loaders
- Search bar expand animation

---

## 12. Accessibility & UX

- Clickable cards have focus state
- Keyboard navigation for modals
- Buttons have hover + active feedback

---

## 13. What NOT To Do

- ❌ No React/Vue
- ❌ No backend changes
- ❌ No inline JS for complex logic
- ❌ No removal of existing EJS conditions
- ❌ No DB mutations on preview

---

## 14. Implementation Order

1. Navbar
2. Library Grid
3. Search Grid
4. Preview Page
5. Book Detail Page
6. Modals
7. About Page
8. Animations & polish

---

## 15. Final Note

This document is **authoritative**.
Frontend must adapt to backend — not the other way around.
