import express from "express";
import {
	getCreate,
	createDish,
	updateDishStatus,
	getStaffMenu,
	getTopRevenueCustomersResults,
	getTopRevenueCustomersForm,
	getTopSellingDishesForm,
	getTopSellingDishesResults,
	getBranchRevenue,
	postBranchRevenue,
	getFoodQualityAndCustomerFeedbackResults,
	getFoodQualityAndCustomerFeedbackForm
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
// Route for showing the form
router.get("/food-qualityandcustomerfeedback", auth.authenticateToken, auth.authorizeRole("Staff"), getFoodQualityAndCustomerFeedbackForm);

// Route for fetching and displaying the results
router.post('/food-qualityandcustomerfeedback', auth.authenticateToken, auth.authorizeRole("Staff"), getFoodQualityAndCustomerFeedbackResults);


// Truy vấn H
router.get("/branch-revenue", auth.authenticateToken, auth.authorizeRole("Staff"), getBranchRevenue);
router.post("/branch-revenue", auth.authenticateToken, auth.authorizeRole("Staff"), postBranchRevenue);


// Truy vấn I
// Route for showing the form for top-selling dishes
router.get("/top-selling-dishes", auth.authenticateToken, auth.authorizeRole("Staff"), getTopSellingDishesForm);

// Route for fetching and displaying the results
router.post('/top-selling-dishes', auth.authenticateToken, auth.authorizeRole("Staff"), getTopSellingDishesResults);


// Truy vấn J
// Route for showing the form
router.get("/top-revenue-customers", auth.authenticateToken, auth.authorizeRole("Staff"), getTopRevenueCustomersForm);

// Route for fetching and displaying the results
router.post('/top-revenue-customers', auth.authenticateToken, auth.authorizeRole("Staff"), getTopRevenueCustomersResults);


export default router;