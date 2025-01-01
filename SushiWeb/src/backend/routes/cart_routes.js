import express from "express";
import {
    getCartItems,
    selectCartItem,
    deleteCartItem
} from "../controller/cart_controller.js";

const router = express.Router();

// Route to get all items in the cart
router.get("/", getCartItems);

// Route to select a specific item in the cart
router.post("/select", selectCartItem);

// Route to delete a specific item in the cart
router.post("/delete", deleteCartItem);

export default router;