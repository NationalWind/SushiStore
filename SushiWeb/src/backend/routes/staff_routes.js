import express from "express";
import {
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
router.get('/create-dish', (req, res) => {
	res.render('create-dish');
});

// POST route for creating a new dish
router.post("/create-dish", createDish); // Ensure the request is authenticated

router.get('/update-dish-status', (req, res) => {
	res.render('update-dish-status'); // This will render the update-dish-status.hbs page
})

// POST route for updating the status of a dish
router.post("/update-dish-status", updateDishStatus);  // Call the updateDishStatus function

// route to get staff menu
router.get("/menu", getStaffMenu);

export default router;
