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
                    CHITIETMONAN.DONGIATONG,
                    (CASE 
                        WHEN MENU.MAMON IS NULL THEN COMBOMONAN.TENCOMBO
                        ELSE MONAN.TENMON
                    END) AS ITEM_NAME
                FROM TEMP_CART
                JOIN CHITIETMONAN ON TEMP_CART.MACTMON = CHITIETMONAN.MACTMON
                LEFT JOIN MENU ON CHITIETMONAN.MAMENU = MENU.MAMENU
                LEFT JOIN MONAN ON MENU.MAMON = MONAN.MAMON
                LEFT JOIN COMBOMONAN ON MENU.MACOMBO = COMBOMONAN.MACOMBO
                WHERE TEMP_CART.MAKH = @MAKH;
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
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing." });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.status(401).json({ message: "Customer ID not found in token." });
        }

        let { selectedItems } = req.body;

        // Ensure selectedItems is parsed as an array
        if (typeof selectedItems === "string") {
            selectedItems = JSON.parse(selectedItems);
        }

        if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
            return res.status(400).json({ message: "No items selected to create an order." });
        }

        const pool = await connectToDatabase();

        // Generate new order ID
        const resultMaDon = await pool.request()
            .query("SELECT TOP 1 MADON FROM DONDATMON ORDER BY MADON DESC");

        let newMADON = "DON0000001";
        if (resultMaDon.recordset.length > 0) {
            const lastMADON = resultMaDon.recordset[0].MADON;
            const lastNumber = parseInt(lastMADON.substring(3));
            const newNumber = lastNumber + 1;
            newMADON = `DON${String(newNumber).padStart(7, "0")}`;
        }

        // Insert the new order
        await pool.request()
            .input("MADON", sql.Char, newMADON)
            .input("KHACHHANGDAT", sql.Char, MAKH)
            .query(`
                INSERT INTO DONDATMON (MADON, KHACHHANGDAT, LOAIDONDATMON, NGAYDAT, GIODAT, TRANGTHAI)
                VALUES (@MADON, @KHACHHANGDAT, N'Online order', GETDATE(), CONVERT(TIME(0),GETDATE()), N'Processing')
            `);

        // Update items in the order
        for (const item of selectedItems) {
            await pool.request()
                .input("MADON", sql.Char, newMADON)
                .input("MACTMON", sql.Char, item)
                .query(`
                    UPDATE CHITIETMONAN
                    SET MADONDATMON = @MADON
                    WHERE MACTMON = @MACTMON
                `);

            await pool.request()
                .input("MACTMON", sql.Char, item)
                .query(`
                    DELETE FROM TEMP_CART
                    WHERE MACTMON = @MACTMON
                `);
        }

        // Execute the stored procedure to calculate order cost
        const costResult = await pool.request()
            .input("MADON", sql.Char, newMADON)
            .execute("sp_TINHTHANHTIEN_DONDATMON");

        // Log the cost result for debugging (optional)
        console.log("Order cost result:", costResult.recordset);

        // Redirect to the orders page
        res.redirect(`/order`);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
