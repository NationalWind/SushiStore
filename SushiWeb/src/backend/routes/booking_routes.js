import express from "express";
import {
    getBookings
} from "../controller/booking_controller.js";

const router = express.Router();

// Route to get all orders
router.get("/", getBookings);