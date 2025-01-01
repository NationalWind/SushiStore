import express from "express";
import { getPayments } from "../controller/payment_controller.js";

const router = express.Router();

// Route to get all payments
router.get("/", getPayments);

export default router;
