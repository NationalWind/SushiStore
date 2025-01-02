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
            return res.render('order', {
                processingOrders: [],
                successfulOrders: [],
                errorMessage: "No token provided."
            });
        }

        // Decode the token to get the user's MAKH (customer ID)
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.render('order', {
                processingOrders: [],
                successfulOrders: [],
                errorMessage: "Customer ID not found in token."
            });
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

        // Separate orders into "Processing" and "Successful"
        const processingOrders = result.recordset.filter(order => order.DONDATMON_TRANGTHAI === 'Processing');
        const successfulOrders = result.recordset.filter(order => order.DONDATMON_TRANGTHAI === 'Successful');
        const paidOrders = result.recordset.filter(order => order.DONDATMON_TRANGTHAI === 'Paid');

        // If no orders are found
        if (processingOrders.length === 0 && successfulOrders.length === 0 && paidOrders.length === 0) {
            return res.render('order', {
                processingOrders: [],
                successfulOrders: [],
                paidOrders: [],
                errorMessage: "There are no orders."
            });
        }

        // Render the orders to the view
        res.render('order', {
            processingOrders,
            successfulOrders,
            paidOrders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.render("order", {
            processingOrders: [],
            successfulOrders: [],
            errorMessage: "Internal server error."
        });
    }
};


export const selectOrder = async (req, res) => {
    try {
        let { selectedOrders } = req.body;

        if (!selectedOrders || selectedOrders.length === 0) {
            return res.status(400).json({ message: "No orders selected." });
        }

        // If selectedOrders is a string, wrap it in an array to ensure it is always an array
        if (typeof selectedOrders === "string") {
            selectedOrders = [selectedOrders];  // Wrap the string in an array
        }

        // Ensure selectedOrders is an array
        if (!Array.isArray(selectedOrders)) {
            return res.status(400).json({ message: "Invalid format for selected orders." });
        }

        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing." });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH;

        if (!MAKH) {
            return res.status(400).json({ message: "Customer ID not found in token." });
        }

        const pool = await connectToDatabase();

        // Generate new MAHOADON
        const result = await pool.request().query(`
            SELECT TOP 1 MAHOADON 
            FROM HOADON 
            ORDER BY MAHOADON DESC
        `);

        let newMAHOADON = "HD00000001"; // Default if no records exist
        if (result.recordset.length > 0) {
            const currentMaxMAHOADON = result.recordset[0].MAHOADON;
            const numericPart = parseInt(currentMaxMAHOADON.substring(2), 10);
            newMAHOADON = `HD${(numericPart + 1).toString().padStart(8, "0")}`;
        }

        // Insert new invoice into HOADON table
        await pool.request()
            .input("MAHOADON", sql.Char(10), newMAHOADON)
            .input("MAKHACHHANG", sql.Char(10), MAKH)
            .input("TRANGTHAI", sql.NVarChar, "Unpaid")
            .query(`
                INSERT INTO HOADON (MAHOADON, TRANGTHAI, NGAYLAP, GIOLAP, MAKHACHHANG)
                VALUES (@MAHOADON, @TRANGTHAI, GETDATE(), CONVERT(TIME(0),GETDATE()), @MAKHACHHANG)
            `);

        // Update selected orders to "Successful" status
        for (const MADON of selectedOrders) {
            await pool.request()
                .input("MAKH", sql.Char, MAKH)
                .input("MADON", sql.Char, MADON)
                .input("TRANGTHAI", sql.NVarChar, "Successful")
                .input("MAHOADON", sql.Char, newMAHOADON)
                .query(`
                    UPDATE DONDATMON
                    SET TRANGTHAI = @TRANGTHAI, HOADONLIENQUAN = @MAHOADON
                    WHERE MADON = @MADON AND KHACHHANGDAT = @MAKH
                `);
        }

        await pool.request()
            .input("MAHOADON", sql.Char(10), newMAHOADON)
            .execute("sp_TinhVaCapNhatTongTien");

        // Redirect to payment page
        res.redirect(`/payment`); // Pass the new invoice ID for payment processing
    } catch (error) {
        console.error("Error processing order selection:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
