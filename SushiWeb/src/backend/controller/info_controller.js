import sql from "mssql";
import { connectToDatabase } from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


export const getStore = async (req, res) => {
    try {
        // Get database connection
        const pool = await connectToDatabase();

        // Execute the SELECT query
        const result = await pool.request().query("SELECT * FROM CHINHANH");

        // Send the result to the view, pass it as 'stores' to be used in the template
        res.render("stores", { title: "Stores", stores: result.recordset });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data from the database");
    }
};

export const getMembership = async (req, res) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "No token provided. Please login" });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH
        const username = decoded.username
        res.render("membership", {
            title: "Membership",
            name: req.username || null, role: req.role, username, MAKH
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const searchMembership = async (req, res) => {
    const { MAKHACHHANG } = req.query;

    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    if (!MAKHACHHANG) {
        // Render the search page with an error if no Customer ID is provided
        return res.status(400).render('searchMembership', { error: "Customer ID is required." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const MAKH = decoded.MAKH; // Get the MAKH from the token
        if (MAKHACHHANG !== MAKH) {
            // Render the search page with an error if no Customer ID is provided
            return res.status(400).render('searchMembership', { error: "Unable to search other users'ID" });
        }
        const query = `
            SELECT 
                C.MAKHACHHANG, 
                C.MATHE, 
                C.NGAYDK, 
                C.DIEMTICHLUY, 
                C.NGAYNANGHANG, 
                C.TRANGTHAITAIKHOAN, 
                C.NHANVIENTAOLAP,
                T.LOAITHE
            FROM 
                CHITIETKHACHHANG C
            INNER JOIN 
                THETHANHVIEN T 
            ON 
                C.MATHE = T.MATHE
            WHERE 
                C.MAKHACHHANG = @MAKHACHHANG;
        `;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("MAKHACHHANG", sql.Char(10), MAKHACHHANG)
            .query(query);

        if (result.recordset.length === 0) {
            // Render the search page with an error if no record is found
            return res.status(404).render('searchMembership', { error: "No membership found for the given Customer ID." });
        }

        // Render the search page with the retrieved membership data
        res.render('searchMembership', {
            data: result.recordset[0],
            name: req.username || null, role: req.role, MAKH
        });
    } catch (error) {
        console.error("Database query failed:", error);
        // Render the search page with an error if there is a server issue
        res.status(500).render('searchMembership', { error: "Internal server error." });
    }
};