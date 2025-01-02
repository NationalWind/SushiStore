import express from "express";
import {
	getCreate,
	createDish,
	updateDishStatus,
	getStaffMenu,
	createOrder,
	formOrder,
	showDish,
	addDish,
	getTopRevenueCustomersResults,
	getTopRevenueCustomersForm,
	getTopSellingDishesForm,
	getTopSellingDishesResults,
	getBranchRevenue,
	postBranchRevenue,
	getFoodQualityAndCustomerFeedbackResults,
	getFoodQualityAndCustomerFeedbackForm,
	getStaffReviewsForm,
	getStaffReviewsResults,
	getCustomerOrderTrendsForm,
	getCustomerOrderTrendsResults,
	getOrderAndInvoiceDetails,
	updateMembershipStatus,
	showPayment,
	addPayment,
	displayAllPayment,
	createMembershipCard
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

// Order route
router.get("/order", auth.authenticateToken, auth.authorizeRole("Staff"), formOrder);
router.post("/order", auth.authenticateToken, auth.authorizeRole("Staff"), createOrder);

// Order add dish
router.get("/order/add-dish", auth.authenticateToken, auth.authorizeRole("Staff"), showDish);
router.post("/order/add-dish", auth.authenticateToken, auth.authorizeRole("Staff"), addDish);

// Add payment
router.get("/order/add-payment", auth.authenticateToken, auth.authorizeRole("Staff"), showPayment);
router.post("/order/add-payment", auth.authenticateToken, auth.authorizeRole("Staff"), addPayment);
router.get("/payment", auth.authenticateToken, auth.authorizeRole("Staff"), displayAllPayment);

// Truy vấn A - Tạo khách hàng - Staff Dashboard
// Membership Card creation route
router.get("/create-membership", auth.authenticateToken, auth.authorizeRole("Staff"), (req, res) => {
	res.render("create-membership", { title: "Create Membership" });
});

// POST route for creating/updating a membership card
router.post("/create-membership", auth.authenticateToken, auth.authorizeRole("Staff"), createMembershipCard);


// Truy vấn B - Cập nhật phân hạng - Staff Dashboard
// Route for triggering the membership status update
router.get("/update-membership-status", auth.authenticateToken, auth.authorizeRole("Staff"), (req, res) => {
	res.render('update-membership-status', { name: req.username, role: req.role });
});

// Trigger stored procedure for membership status update
router.post("/update-membership-status", auth.authenticateToken, auth.authorizeRole("Staff"), updateMembershipStatus);


// Truy vấn C
// Route for showing the form and handling results
router.get('/order-invoice', auth.authenticateToken, auth.authorizeRole("Staff"), (req, res) => {
	res.render("order-invoice", { title: "Orders and Invoices" });
});

// Route for fetching and displaying the results based on the date
router.post('/order-invoice', auth.authenticateToken, auth.authorizeRole("Staff"), getOrderAndInvoiceDetails);


// Truy vấn D
// Route for showing the form to input data
router.get("/customer-order-trends", auth.authenticateToken, auth.authorizeRole("Staff"), getCustomerOrderTrendsForm);

// Route for fetching and displaying the results
router.post('/customer-order-trends', auth.authenticateToken, auth.authorizeRole("Staff"), getCustomerOrderTrendsResults);


// Truy vấn E
// Route for rendering the staff reviews form and showing the data
router.get('/staff-reviews-form', auth.authenticateToken, auth.authorizeRole("Staff"), getStaffReviewsForm);

// Route for fetching and displaying the results of the reviews
router.post('/staff-reviews-form', auth.authenticateToken, auth.authorizeRole("Staff"), getStaffReviewsResults);

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