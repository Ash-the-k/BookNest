import express from "express";
import expressLayouts from "express-ejs-layouts"; // <--- NEW: Import the layout library
import pool from "./db/index.js";
import booksRoutes from "./routes/books.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";

const app = express();
const PORT = 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // This serves your CSS file

// view engine setup
app.use(expressLayouts);        // <--- NEW: Tell Express to use layouts
app.set("layout", "layout");    // <--- NEW: Look for 'views/layout.ejs' by default
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.redirect("/books");
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.use("/books", booksRoutes);
app.use("/", reviewsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});