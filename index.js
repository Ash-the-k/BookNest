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


app.get("/", (req, res) => {
  res.redirect("/books");
});

app.use("/books", booksRoutes);

app.use("/", reviewsRoutes);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
