import express from "express";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import { engine } from "express-handlebars";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import branchManagerRoutes from "./routes/branch_manager_routes.js";
import departmentManagerRoutes from "./routes/department_manager_routes.js";
import staffRoutes from "./routes/staff_routes.js";
import adminRoutes from "./routes/admin_routes.js";
import menuRoutes from "./routes/menu_routes.js";

dotenv.config();

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

// Middleware
app.use(express.static(path.resolve("src/frontend/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", authRoutes);
app.use("/branch-manager", branchManagerRoutes);
app.use("/department-manager", departmentManagerRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use("/menu", menuRoutes);

app.get("/", (req, res) => {
    res.render("home", { title: "Home", name: req.username });
});

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
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
