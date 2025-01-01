import jwt from "jsonwebtoken";
import sql from "mssql";
import { connectToDatabase } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


export const getPayments = async (req, res) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.render("payment", { payments: [], errorMessage: "Authentication token is missing." });
        }

        // Decode the token to get the user's MAKH
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.render("payment", { payments: [], errorMessage: "Customer ID not found in token." });
        }

        const pool = await connectToDatabase();

        // Query to get payment details for the customer
        const result = await pool.request()
            .input("MAKH", sql.Char, MAKH)
            .query(`
                SELECT 
                    HOADON.MAHOADON,
                    HOADON.GIOLAP,
                    HOADON.NGAYLAP,
                    HOADON.VAT,
                    HOADON.TIENKHACHDUA,
                    HOADON.TRANGTHAI,
                    HOADON.PHUONGTHUC,
                    HOADON.TONGTIENTRUOCKM,
                    HOADON.TONGTIENSAUKM
                FROM 
                    HOADON
                WHERE 
                    MAKHACHHANG = @MAKH
                ORDER BY 
                    HOADON.NGAYLAP DESC, HOADON.GIOLAP DESC
            `);

        // If no payments found
        if (result.recordset.length === 0) {
            return res.render("payment", { payments: [], errorMessage: "No payment records found." });
        }

        // Render the payments to the view
        res.render("payment", { payments: result.recordset });
    } catch (error) {
        console.error("Error fetching payment records:", error);
        res.render("payment", { payments: [], errorMessage: "Internal server error." });
    }
};
