import { connectToDatabase } from "../config/db.js";
import sql from "mssql";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const getCreate = async (req, res) => {
	const token = req.cookies.authToken;

	if (!token) {
		return res.render("staffmenu", { categories: [], errorMessage: "No token provided." });
	}

	// Decode the token to get the user's username
	const decoded = jwt.verify(token, SECRET_KEY);
	const username = decoded.username;

	// Connect to the database
	const pool = await connectToDatabase();

	// Fetch the branch ID (`CHINHANHLAMVIEC`) for the staff member
	const branchQuery = `
            SELECT NV.CHINHANHLAMVIEC 
            FROM NHANVIEN NV
            INNER JOIN ACCOUNT ACC ON NV.ACCOUNT_ID = ACC.ID
            WHERE ACC.USERNAME = @username
        `;

	const branchResult = await pool.request()
		.input("username", sql.NVarChar, username)
		.query(branchQuery);

	if (branchResult.recordset.length === 0) {
		return res.render("staffmenu", { categories: [], errorMessage: "Staff not found or unauthorized." });
	}
	const branchId = branchResult.recordset[0].CHINHANHLAMVIEC;
	const danhmuc_list = ["Sushi", "Sashimi", "Tempura", "Ramen", "Dessert", "Drinks", "Combo"];
	res.render('create-dish', { danhmuc_list, branchId });
}

export const createDish = async (req, res) => {
	try {
		const { TenMon, DanhMuc, MaChiNhanh, GiaHienTai, TrangThaiPhucVu, MoTaCombo } = req.body;

		// Check if all required fields are provided
		if (!TenMon || !DanhMuc || !MaChiNhanh || !GiaHienTai || !TrangThaiPhucVu) {
			return res.status(400).json({ error: "All fields are required" });
		}

		const token = req.cookies.authToken;

		if (!token) {
			return res.render("staffmenu", { categories: [], errorMessage: "No token provided." });
		}

		// Decode the token to get the user's username
		const decoded = jwt.verify(token, SECRET_KEY);
		const username = decoded.username;

		// Connect to the database
		const pool = await connectToDatabase();

		// Call the stored procedure to insert the dish
		await pool.request()
			.input('TenMon', sql.NVarChar, TenMon)
			.input('DanhMuc', sql.NVarChar, DanhMuc)
			.input('MaChiNhanh', sql.Char(10), MaChiNhanh)
			.input('GiaHienTai', sql.Float, GiaHienTai)
			.input('TrangThaiPhucVu', sql.NVarChar, TrangThaiPhucVu)
			.input('MoTaCombo', sql.NVarChar, MoTaCombo)
			.execute('sp_TaoMonAnCombo'); // Executes the stored procedure

		// Render success page after dish is created
		const branchQuery = `
            SELECT NV.CHINHANHLAMVIEC 
            FROM NHANVIEN NV
            INNER JOIN ACCOUNT ACC ON NV.ACCOUNT_ID = ACC.ID
            WHERE ACC.USERNAME = @username
        `;

		const branchResult = await pool.request()
			.input("username", sql.NVarChar, username)
			.query(branchQuery);

		if (branchResult.recordset.length === 0) {
			return res.render("staffmenu", { categories: [], errorMessage: "Staff not found or unauthorized." });
		}
		const branchId = branchResult.recordset[0].CHINHANHLAMVIEC;
		const danhmuc_list = ["Sushi", "Sashimi", "Tempura", "Ramen", "Dessert", "Drinks", "Combo"];
		res.render('create-dish', { branchId, danhmuc_list, success: "Dish created successfully!" });

	} catch (error) {
		console.error(error);
		res.render('create-dish', { error: "An error occurred while creating the dish." });
	}
};

export const updateDishStatus = async (req, res) => {
	try {
		// Extract the parameters from the request body
		const { MAMENU, TRANGTHAIPHUCVU } = req.body;

		// Check if all required fields are provided
		if (!MAMENU || !TRANGTHAIPHUCVU || !MACHINHANH) {
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
			.input('MAMENU', sql.Char(10), MAMENU)               // Dish code
			.input('TRANGTHAIPHUCVU', sql.NVarChar, TRANGTHAIPHUCVU) // New status
			.query(`UPDATE MENU
					SET TRANGTHAIPHUCVU = @TRANGTHAIPHUCVU
					WHERE MAMENU = @MAMENU`);  // Executes the stored procedure

		// Render success message or redirect as needed
		res.render('update-dish-status', { success: "Dish status updated successfully!" });

	} catch (error) {
		console.error(error);
		res.render('update-dish-status', { error: "An error occurred while updating the dish status." });
	}
};

export const getStaffMenu = async (req, res) => {
	try {
		// Extract token from cookies
		const token = req.cookies.authToken;

		if (!token) {
			return res.render("staffmenu", { categories: [], errorMessage: "No token provided." });
		}

		// Decode the token to get the user's username
		const decoded = jwt.verify(token, SECRET_KEY);
		const username = decoded.username;

		// Connect to the database
		const pool = await connectToDatabase();

		// Fetch the branch ID (`CHINHANHLAMVIEC`) for the staff member
		const branchQuery = `
            SELECT NV.CHINHANHLAMVIEC 
            FROM NHANVIEN NV
            INNER JOIN ACCOUNT ACC ON NV.ACCOUNT_ID = ACC.ID
            WHERE ACC.USERNAME = @username
        `;

		const branchResult = await pool.request()
			.input("username", sql.NVarChar, username)
			.query(branchQuery);

		if (branchResult.recordset.length === 0) {
			return res.render("staffmenu", { categories: [], errorMessage: "Staff not found or unauthorized." });
		}

		const branchId = branchResult.recordset[0].CHINHANHLAMVIEC;

		// Fetch the menu for the staff's branch
		const menuQuery = `
            SELECT MENU.MAMENU, 
                   ISNULL(MONAN.TENMON, COMBOMONAN.TENCOMBO) AS TENMON, 
                   ISNULL(MONAN.DANHMUC, N'Combo') AS DANHMUC, 
                   ISNULL(MONAN.IMAGE_LINK, COMBOMONAN.IMAGE_LINK) AS IMAGE_LINK, 
                   MENU.GIAHIENTAI, 
                   MENU.TRANGTHAIPHUCVU
            FROM MENU
            LEFT JOIN MONAN ON MENU.MAMON = MONAN.MAMON
            LEFT JOIN COMBOMONAN ON MENU.MACOMBO = COMBOMONAN.MACOMBO
            WHERE MENU.MACHINHANH = @branchId
        `;

		const menuResult = await pool.request()
			.input("branchId", sql.Char, branchId)
			.query(menuQuery);

		if (menuResult.recordset.length === 0) {
			return res.render("staffmenu", { categories: [], errorMessage: "No menu items found for this branch." });
		}

		// Group data by `DANHMUC`
		const categorizedMenu = {};
		menuResult.recordset.forEach(item => {
			const category = item.DANHMUC;
			if (!categorizedMenu[category]) {
				categorizedMenu[category] = [];
			}
			categorizedMenu[category].push(item);
		});

		console.log(categorizedMenu);
		// Render the staff menu view
		res.render("staffmenu", {
			branchId,
			categories: Object.entries(categorizedMenu).map(([categoryName, items]) => ({
				categoryName,
				items
			})),
			errorMessage: null // No error
		});
	} catch (error) {
		console.error("Error fetching staff menu:", error);
		res.render("staffmenu", { categories: [], errorMessage: "Internal server error." });
	}
};