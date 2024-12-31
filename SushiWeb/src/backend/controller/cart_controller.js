import { connectToDatabase } from "../config/db.js";
import sql from "mssql";

export const getCartItems = async (req, res) => {
    try {
        // Connect to the database
        const pool = await connectToDatabase();

        // Query to join TEMP_CART with CHITIETMONAN
        const result = await pool.request().query(`
            SELECT 
                TEMP_CART.MACTMON, 
                CHITIETMONAN.SOLUONG, 
                CHITIETMONAN.DONGIATONG
            FROM TEMP_CART
            JOIN CHITIETMONAN ON TEMP_CART.MACTMON = CHITIETMONAN.MACTMON
        `);

        // If no items found
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Cart is empty." });
        }

        // Return the items in the cart
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
