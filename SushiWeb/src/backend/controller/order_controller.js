import { connectToDatabase } from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


export const getOrders = async (req, res) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.authToken;

        if (!token) {
            return res.render('order', { orderItems: [], errorMessage: "No token provided." });
        }

        // Decode the token to get the user's MAKH (customer ID)
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.render('order', { orderItems: [], errorMessage: "Customer ID not found in token." });
        }

        // Connect to the database
        const pool = await connectToDatabase();

        // SQL query to join DONDATMON, DATHANGTRUCTUYEN, and DATHANGTAICHO
        const result = await pool.request()
            .input("MAKH", sql.Char, MAKH)
            .query(`
                SELECT 
                    DONDATMON.MADON,
                    DONDATMON.GIODAT,
                    DONDATMON.NGAYDAT,
                    DONDATMON.TRANGTHAI AS DONDATMON_TRANGTHAI,
                    DATHANGTRUCTUYEN.THOIGIANGIAO,
                    DATHANGTRUCTUYEN.DIACHIGIAO,
                    DATHANGTRUCTUYEN.TRANGTHAIGIAO AS DATHANGTRUCTUYEN_TRANGTHAIGIAO,
                    DATHANGTAICHO.MACHINHANH,
                    DATHANGTAICHO.SOBAN,
                    DONDATMON.THANHTIEN
                FROM 
                    DONDATMON
                LEFT JOIN 
                    DATHANGTRUCTUYEN ON DONDATMON.MADON = DATHANGTRUCTUYEN.MADHTRUCTUYEN
                LEFT JOIN 
                    DATHANGTAICHO ON DONDATMON.MADON = DATHANGTAICHO.MADHTAICHO
                WHERE 
                    DONDATMON.KHACHHANGDAT = @MAKH
            `);

        // If no orders found
        if (result.recordset.length === 0) {
            return res.render('order', { orderItems: [], errorMessage: "There are no orders." });
        }

        // Render the orders to the view
        res.render('order', { orderItems: result.recordset });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.render("order", { orderItems: [], errorMessage: "Internal server error." });
    }
};
