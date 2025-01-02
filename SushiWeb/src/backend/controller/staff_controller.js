import { connectToDatabase } from "../config/db.js";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const createDish = async (req, res) => {
  try {
    const { TenMon, DanhMuc, MaChiNhanh, GiaHienTai, TrangThaiPhucVu } = req.body;

    // Check if all required fields are provided
    if (!TenMon || !DanhMuc || !MaChiNhanh || !GiaHienTai || !TrangThaiPhucVu) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Connect to the database
    const pool = await connectToDatabase();

    // Call the stored procedure to insert the dish
    await pool.request()
      .input('TenMon', sql.NVarChar, TenMon)
      .input('DanhMuc', sql.NVarChar, DanhMuc)
      .input('MaChiNhanh', sql.Char(10), MaChiNhanh)
      .input('GiaHienTai', sql.Float, GiaHienTai)
      .input('TrangThaiPhucVu', sql.NVarChar, TrangThaiPhucVu)
      .execute('sp_TaoMonAn'); // Executes the stored procedure

    // Render success page after dish is created
    res.render('create-dish', { success: "Dish created successfully!" });

  } catch (error) {
    console.error(error);
    res.render('create-dish', { error: "An error occurred while creating the dish." });
  }
};

export const updateDishStatus = async (req, res) => {
  try {
    // Extract the parameters from the request body
    const { MAMON, TRANGTHAIPHUCVU, MACHINHANH } = req.body;

    // Check if all required fields are provided
    if (!MAMON || !TRANGTHAIPHUCVU || !MACHINHANH) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the status is valid
    if (!['Available', 'Out of stock', 'Discontinued'].includes(TRANGTHAIPHUCVU)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Connect to the database
    const pool = await connectToDatabase();

    // Call the stored procedure to update the dish status for the specific branch
    await pool.request()
      .input('MAMON', sql.Char(10), MAMON)               // Dish code
      .input('TRANGTHAIPHUCVU', sql.NVarChar, TRANGTHAIPHUCVU) // New status
      .input('MACHINHANH', sql.Char(10), MACHINHANH)     // Branch ID
      .execute('sp_UpdateDishStatus');  // Executes the stored procedure

    // Render success message or redirect as needed
    res.render('create-dish', { success: "Dish status updated successfully!" });

  } catch (error) {
    console.error(error);
    res.render('create-dish', { error: "An error occurred while updating the dish status." });
  }
};

export const getStaffMenu = async (req, res) => {

}