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

// Controller for rendering the booking form
export const getBookingForm = async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const branchesResult = await pool.request().query('SELECT MACHINHANH, TENCHINHANH FROM CHINHANH');
        
        // Log the result to check if branches are fetched
        console.log(branchesResult.recordset);
        
        res.render("booking", { branches: branchesResult.recordset });
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.render("booking", {
            errorMessage: "An error occurred while fetching the branches."
        });
    }
};

// Controller for fetching branches as an API
export const getBranches = async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const branchesResult = await pool.request().query('SELECT MACHINHANH, TENCHINHANH FROM CHINHANH');
        
        // Check if branches are found
        if (!branchesResult.recordset || branchesResult.recordset.length === 0) {
            return res.status(404).json({ error: "No branches found." });
        }

        // Send the branches as JSON to the frontend
        res.json(branchesResult.recordset);
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).json({ error: "An error occurred while fetching branches." });
    }
};



export const createBooking = async (req, res) => {
    try {
        // Extract data from the request body
        const { NgayDen, GioDen, SoLuongKhach, GhiChu, SDT, MaChiNhanh } = req.body;

        // Validate required fields
        if (!NgayDen || !GioDen || !SoLuongKhach || !SDT || !MaChiNhanh) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Ensure GioDen is in HH:mm:ss format (if only HH:mm is provided)
        const formattedGioDen = GioDen.length === 5 ? `${GioDen}:00` : GioDen;

        // Connect to the database
        const pool = await connectToDatabase();

        // Check if tables in the branch can accommodate the guests
        const availableTables = await pool.request()
            .input("MaChiNhanh", sql.Char, MaChiNhanh)
            .query(`
                SELECT SOBAN, SONGUOITOIDA
                FROM BANAN
                WHERE MACHINHANH = @MaChiNhanh AND TRANGTHAI = N'Available'
                ORDER BY SONGUOITOIDA ASC
            `);

        let tables = availableTables.recordset;
        let selectedTables = [];
        let remainingGuests = SoLuongKhach;

        // Assign tables to accommodate the number of guests
        for (let table of tables) {
            if (remainingGuests <= 0) break;
            selectedTables.push(table.SOBAN);
            remainingGuests -= table.SONGUOITOIDA;
        }

        if (remainingGuests > 0) {
            return res.status(400).json({ error: "Not enough available tables to accommodate guests." });
        }

        // Fetch the latest MADATCHO to generate a new one
        const latestBooking = await pool.request()
            .query(`
                SELECT TOP 1 MADATCHO
                FROM DATCHO
                ORDER BY MADATCHO DESC
            `);

        let newMaDatCho = "DC00000001"; // Default if no previous bookings exist

        if (latestBooking.recordset.length > 0) {
            const lastMaDatCho = latestBooking.recordset[0].MADATCHO;
            const numericPart = parseInt(lastMaDatCho.substring(2)); // Get the numeric part of MADATCHO (e.g., 00000001)
            const newNumericPart = numericPart + 1; // Increment the numeric part

            // Format the new MADATCHO to be exactly 10 characters long
            newMaDatCho = "DC" + newNumericPart.toString().padStart(8, "0");
        }

        // Insert the booking into the DATCHO table
        await pool.request()
            .input("MaDatCho", sql.Char, newMaDatCho)
            .input("NgayDen", sql.Date, NgayDen)
            .input("GioDen", sql.VarChar, formattedGioDen)  // Use the formatted time
            .input("SoLuongKhach", sql.Int, SoLuongKhach)
            .input("GhiChu", sql.NVarChar, GhiChu)
            .input("SDT", sql.Char, SDT)
            .query(`
                INSERT INTO DATCHO (MADATCHO, NGAYDEN, GIODEN, SOLUONGKHACH, GHICHU, SDT)
                VALUES (@MaDatCho, @NgayDen, @GioDen, @SoLuongKhach, @GhiChu, @SDT)
            `);

        // Insert details into CHITIETDATCHO for each table
        for (let table of selectedTables) {
            await pool.request()
                .input("SoBan", sql.VarChar, table)
                .input("MaChiNhanh", sql.Char, MaChiNhanh)
                .input("MaDatCho", sql.Char, newMaDatCho)
                .input("SoLuongKhach", sql.Int, SoLuongKhach)
                .query(`
                    INSERT INTO CHITIETDATCHO (SOBAN, MACHINHANH, MADATCHO, SOLUONGKHACH)
                    VALUES (@SoBan, @MaChiNhanh, @MaDatCho, @SoLuongKhach)
                `);
        }

        // Update the status of the reserved tables
        for (let table of selectedTables) {
            await pool.request()
                .input("SoBan", sql.VarChar, table)
                .input("MaChiNhanh", sql.Char, MaChiNhanh)
                .query(`
                    UPDATE BANAN
                    SET TRANGTHAI = N'Reserved'
                    WHERE SOBAN = @SoBan AND MACHINHANH = @MaChiNhanh
                `);
        }

        // Redirect to the booking page with a success message
        res.render('booking', { successMessage: 'Booking created successfully!' });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "An error occurred while creating the booking." });
    }
};




