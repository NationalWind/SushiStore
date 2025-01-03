import express from "express";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import moment from "moment";
import authRoutes from "./routes/auth_routes.js";
import branchManagerRoutes from "./routes/branch_manager_routes.js";
import departmentManagerRoutes from "./routes/department_manager_routes.js";
import staffRoutes from "./routes/staff_routes.js";
import adminRoutes from "./routes/admin_routes.js";
import menuRoutes from "./routes/menu_routes.js";
import cartRoutes from "./routes/cart_routes.js"
import orderRoutes from "./routes/order_routes.js"
import paymentRoutes from "./routes/payment_routes.js"
import bookingRoutes from "./routes/booking_routes.js"
import infoRoutes from "./routes/info_routes.js"

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Handlebars
app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.resolve("src/frontend/views/"),
    partialsDir: path.resolve("src/frontend/views/partials"),
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        cobaiDoxe: function (value) {
            return value ? "Yes" : "No";
        },
        formatTime: function (time) {
            return moment(time).format("hh:mm A");  // Formats time to "hh:mm AM/PM"
        },
    }
}));
app.set("view engine", "hbs");
app.set("views", path.resolve("src/frontend/views"));

// Middleware
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", authRoutes);
app.use("/", infoRoutes)
app.use("/branch-manager", branchManagerRoutes);
app.use("/department-manager", departmentManagerRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use("/menu", menuRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/booking", bookingRoutes);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});