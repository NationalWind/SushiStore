import express from "express";
import { getCartItems } from "../controller/cart_controller.js";

const router = express.Router();

// Route to get all items in the cart
router.get("/", getCartItems);

export default router;