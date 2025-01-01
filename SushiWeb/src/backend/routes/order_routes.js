import express from "express";
import {
    getOrders
} from "../controller/order_controller.js";

const router = express.Router();

// Route to get all orders
router.get("/", getOrders);

export default router;