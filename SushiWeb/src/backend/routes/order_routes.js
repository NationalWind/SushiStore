import express from "express";
import {
    getOrders,
    selectOrder
} from "../controller/order_controller.js";

const router = express.Router();

// Route to get all orders
router.get("/", getOrders);

router.post("/select-order", selectOrder);

export default router;