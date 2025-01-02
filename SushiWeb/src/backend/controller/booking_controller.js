import { connectToDatabase } from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


export const getBookings = async (req, res) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.authToken;

        if (!token) {
            return res.render('booking', {
                bookings: [],
                errorMessage: "No token provided."
            });
        }

        // Decode the token to get the user's MAKH (customer ID)
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.render('booking', {
                bookings: [],
                errorMessage: "Customer ID not found in token."
            });
        }

        // Connect to the database
        const pool = await connectToDatabase();

        // SQL query to join DONDATMON, DATHANGTRUCTUYEN, and DATHANGTAICHO
        const result = await pool.request()
            .input("MAKH", sql.Char, MAKH)
            .query(`
                
            `);

        // Render the orders to the view
        res.render('booking', {

        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.render("booking", {
            processingOrders: [],
            successfulOrders: [],
            errorMessage: "Internal server error."
        });
    }
};