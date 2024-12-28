import express from "express";
import { connectToDatabase } from "./config/db.js"; // Adjust the path as needed
import { engine } from "express-handlebars";
import path from "path";
import * as authController from "./controller/auth_controller.js";

const app = express();

// Configure Handlebars
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

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    const userName = "John Doe"; // Replace with actual user info from your session or database
    res.render("home", { title: "Home", name: userName });
});

// Render the login page
app.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

// Render the signup page
app.get("/signup", (req, res) => {
    res.render("signup", { title: "Sign Up" });
});

// Render the home page after login/signup
app.get("/home", (req, res) => {
    const userName = "John Doe"; // Replace with actual user info from your session or database
    res.render("home", { title: "Home", name: userName });
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

app.post('/signup', authController.signup);
app.post('/login', authController.login);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
