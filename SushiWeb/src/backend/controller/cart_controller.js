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

        console.log(MACTMON, SELECTED);

        if (!MACTMON || SELECTED === undefined) {
            return res.status(400).json({ message: "MACTMON and SELECTED are required." });
        }

        // Handle the empty cart case
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
        console.log(req.body);
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

export const createOrder = async (req, res) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing." });
        }

        // Decode the token to get the user's MAKH (customer ID)
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.status(401).json({ message: "Customer ID not found in token." });
        }

        // Extract selected cart items from the request body
        const { selectedItems } = req.body;

        if (!selectedItems || selectedItems.length === 0) {
            return res.status(400).json({ message: "No items selected to create an order." });
        }

        // Connect to the database
        const pool = await connectToDatabase();

        // Generate a new order ID (MADON)
        const resultMaDon = await pool.request()
            .query("SELECT TOP 1 MADON FROM DONDATMON ORDER BY MADON DESC");

        let newMADON = 'DONDAT0001'; // Default if no records exist
        if (resultMaDon.recordset.length > 0) {
            const lastMADON = resultMaDon.recordset[0].MADON;
            const lastNumber = parseInt(lastMADON.substring(6)); // Get the numeric part
            const newNumber = lastNumber + 1; // Increment it
            newMADON = `DONDAT${String(newNumber).padStart(4, '0')}`; // Format to "DONDAT0001"
        }

        // Insert a new order into the DONDATMON table
        await pool.request()
            .input("MADON", sql.Char, newMADON)
            .input("KHACHHANGDAT", sql.Char, MAKH)
            .query(`
                INSERT INTO DONDATMON (MADON, KHACHHANGDAT, LOAIDONDATMON, NGAYDAT, GIODAT, TRANGTHAI)
                VALUES (@MADON, @KHACHHANGDAT, N'Online order', GETDATE(), CONVERT(TIME(0),GETDATE()), N'Processing')
            `);

        // Update selected items into the CTMONAN table
        for (const item of selectedItems) {
            const updateResult = await pool.request()
                .input("MADON", sql.Char, newMADON)
                .input("MACTMON", sql.Char, item.MACTMON)
                .query(`
                    UPDATE CHITIETMONAN
                    SET MADONDATMON = @MADON
                    WHERE MACTMON = @MACTMON
                `);

            await pool.request()
                .input("MACTMON", sql.Char, item.MACTMON)
                .query(`
                    DELETE FROM TEMP_CART
                    WHERE MACTMON = @MACTMON
                `);


            if (updateResult.rowsAffected[0] === 0) {
                console.warn(`No rows updated for MACTMON: ${item.MACTMON}`);
            }
        }

        // Redirect to /order after successful creation
        res.redirect(`/order`);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
