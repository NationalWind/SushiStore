import express from "express";
import {
	getCreate,
	createDish,
	updateDishStatus,
	getStaffMenu
} from "../controller/staff_controller.js";
import * as auth from "../middleware/auth_middleware.js";

const router = express.Router();

// staff dashboard page (the main staff page showing all available functions)
router.get('/', auth.authenticateToken, auth.authorizeRole("Staff"), (req, res) => {
	if (req.role !== "Staff") {
		return res.status(403).send("Access Denied");
	}
	res.render("staff", { title: "Staff Dashboard", name: req.username, role: req.role });  // This will render the staff.hbs page with the available links
});

// GET route to display the form for creating a new dish
router.get('/create-dish', auth.authenticateToken, auth.authorizeRole("Staff"), getCreate);

// POST route for creating a new dish
router.post("/create-dish", createDish); // Ensure the request is authenticated

router.get('/update-dish-status', auth.authenticateToken, auth.authorizeRole("Staff"), (req, res) => {
	res.render('update-dish-status', { name: req.username, role: req.role }); // This will render the update-dish-status.hbs page
})

// POST route for updating the status of a dish
router.post("/update-dish-status", updateDishStatus);  // Call the updateDishStatus function

// route to get staff menu
router.get("/menu", auth.authenticateToken, auth.authorizeRole("Staff"), getStaffMenu);

// Statistics Route
router.get("/statistics", (req, res) => {
	res.render("statistics", { title: "Statistics" });
});

// Truy vấn A - Tạo khách hàng - Staff Dashboard
router.get("/membership", (req, res) => {
	res.render("truyvana", { title: "Create Membership" });
});

// Truy vấn B - Cập nhật phân hạng - Staff Dashboard
router.get("/updatemembership", (req, res) => {
	res.render("truyvanb", { title: "Update Membership" });
});

// Truy vấn C
router.get("/ordersandinvoices", (req, res) => {
	res.render("truyvanc", { title: "Orders and Invoices" });
});

// Truy vấn D
router.get("/customerordertrendsofthisbranch", (req, res) => {
	res.render("truyvand", { title: "Customer Order Trends of this Branch" });
});

// Truy vấn E
router.get("/staffandcorrespondingreviews", (req, res) => {
	res.render("truyvane", { title: "Staff and Corresponding Reviews" });
});

// Truy vấn F
router.get("/foodqualityandcustomerfeedback", (req, res) => {
	res.render("truyvanf", { title: "Food Quality and Customer Feedback" });
});

// Truy vấn H
router.get("/branchrevenue", (req, res) => {
	res.render("truyvanh", { title: "Branch Revenue" });
});

// Truy vấn I
router.get("/topsellingdishes", (req, res) => {
	res.render("truyvani", { title: "Top-Selling Dishes" });
});

// Truy vấn J
router.get("/highestrevenuegeneratingcustomers", (req, res) => {
	res.render("truyvanj", { title: "Highest Revenue Generating Customers" });
});

export default router;