import { connectToDatabase } from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const getCartItems = async (req, res) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.authToken;

        if (!token) {
            return res.render('cart', { cartItems: [], errorMessage: "No token provided." });
        }

        // Decode the token to get the user's MAKH (customer ID)
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.render('cart', { cartItems: [], errorMessage: "Customer ID not found in token." });
        }

        // Connect to the database
        const pool = await connectToDatabase();

        // Query to join TEMP_CART with CHITIETMONAN for the specific MAKH
        const result = await pool.request()
            .input("MAKH", sql.Char, MAKH)
            .query(`
                SELECT 
                    TEMP_CART.MACTMON,
                    TEMP_CART.SELECTED, 
                    CHITIETMONAN.SOLUONG, 
                    CHITIETMONAN.DONGIATONG
                FROM TEMP_CART
                JOIN CHITIETMONAN ON TEMP_CART.MACTMON = CHITIETMONAN.MACTMON
                WHERE TEMP_CART.MAKH = @MAKH
            `);

        // If no items found
        if (result.recordset.length === 0) {
            return res.render('cart', { cartItems: [], errorMessage: "Cart is empty." });
        }

        // Render the cart.hbs view with the cart items
        res.render('cart', { cartItems: result.recordset });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.render("cart", { cartItems: [], errorMessage: "Internal server error." });
    }
};

export const selectCartItem = async (req, res) => {
    try {
        const { MACTMON, SELECTED } = req.body;

        if (!MACTMON || SELECTED === undefined) {
            return res.status(400).json({ message: "MACTMON and SELECTED are required." });
        }

        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided." });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.status(400).json({ message: "Customer ID not found in token." });
        }

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("MACTMON", sql.Char, MACTMON)
            .input("MAKH", sql.Char, MAKH)
            .input("SELECTED", sql.Int, SELECTED)
            .query(`
                UPDATE TEMP_CART
                SET SELECTED = @SELECTED
                WHERE MACTMON = @MACTMON AND MAKH = @MAKH
            `);

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: "Item not found in the cart." });
        }

        res.status(200).json({ message: "Item selection updated successfully." });
    } catch (error) {
        console.error("Error selecting cart item:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const deleteCartItem = async (req, res) => {
    try {
        const { MACTMON } = req.body;

        if (!MACTMON) {
            return res.status(400).json({ message: "MACTMON is required." });
        }

        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: "No token provided." });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.status(400).json({ message: "Customer ID not found in token." });
        }

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("MACTMON", sql.Char, MACTMON)
            .input("MAKH", sql.Char, MAKH)
            .query(`
                DELETE FROM TEMP_CART
                WHERE MACTMON = @MACTMON AND MAKH = @MAKH
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Item not found in the cart." });
        }

        res.status(200).json({ message: "Item deleted successfully." });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};