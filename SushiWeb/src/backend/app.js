import express from "express";
import { connectToDatabase } from "./config/db.js"; // Adjust the path as needed
import { engine } from "express-handlebars";
import path from "path";

const app = express();

// Set Handlebars as the template engine
app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.resolve("src/frontend/views/layouts"),
    partialsDir: path.resolve("src/frontend/views/partials"),
}));
app.set("view engine", "hbs");
app.set("views", path.resolve("src/frontend/views"));

// Static files
app.use(express.static(path.resolve("src/frontend/public")));

app.get("/", (req, res) => {
    res.render("home", { title: "Home", year: new Date().getFullYear() });
});

// Route to fetch data
app.get("/data", async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query("SELECT * FROM CHINHANH");
        res.render("data", {
            title: "Branch Data",
            branches: result.recordset // Pass the result set to the template
        });
        console.log(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
