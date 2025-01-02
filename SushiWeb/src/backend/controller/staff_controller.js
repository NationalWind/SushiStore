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
