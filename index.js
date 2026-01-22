import express from "express";
import pool from "./db/index.js";
import booksRoutes from "./routes/books.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";


const app = express();
const PORT = 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// test route
app.get("/", (req, res) => {
  res.send("BookNest is running ✅");
});

// TEMP: DB health check (remove before production)
app.get("/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("DB connection OK ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB connection FAILED ❌");
  }
});

app.use("/books", booksRoutes);

app.use("/", reviewsRoutes);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
