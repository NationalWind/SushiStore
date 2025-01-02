import express from "express";
import {
    getBookings,
    createBooking,
    getBookingForm,
    getBranches,
} from "../controller/booking_controller.js";

const router = express.Router();

// Route to get all orders
// router.get("/", getBookings);


// Route to render the booking form
router.get("/", getBookingForm);

// Route to fetch branches as JSON
router.get("/branches", getBranches);

// Route to create a new booking
router.post("/", createBooking);

export default router