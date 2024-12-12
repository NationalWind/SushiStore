import express from "express";
import expressLayouts from "express-ejs-layouts";
import path from "path";

// Initialize Express app
const app = express();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.resolve("src/frontend/views")); // Point to the views folder
app.use(expressLayouts);
app.set("layout", "layout");

// Set static files
app.use(express.static(path.resolve("src/frontend/public")));

// Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
