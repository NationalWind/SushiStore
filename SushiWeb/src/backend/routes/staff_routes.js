import express from "express";
import { createDish } from "../controller/staff_controller.js";
import { authenticateToken, authenticateUser } from "../middleware/auth_middleware.js";

const router = express.Router();

// staff dashboard page (the main staff page showing all available functions)
router.get('/', (req, res) => {
  res.render('staff');  // This will render the staff.hbs page with the available links
});

// GET route to display the form for creating a new dish
router.get('/create-dish', (req, res) => {
  res.render('create-dish');
});

// POST route for creating a new dish
router.post("/create-dish", createDish); // Ensure the request is authenticated

export default router;
