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
	res.render('create-dish', { danhmuc_list, branchId, name: req.username, role: req.role });
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
			errorMessage: null, name: req.username, role: req.role // No error
		});
	} catch (error) {
		console.error("Error fetching staff menu:", error);
		res.render("staffmenu", { categories: [], errorMessage: "Internal server error." });
	}
};

export const getTopRevenueCustomersForm = (req, res) => {
    res.render('top-revenue-customers', { title: "Top Revenue Customers" });
};

export const getTopRevenueCustomersResults = async (req, res) => {
    try {
        const { NgayBatDau, NgayKetThuc, SoLuongTop } = req.body;

        // Validate inputs
        if (!NgayBatDau || !NgayKetThuc || !SoLuongTop) {
            return res.render('top-revenue-customers', { 
                errorMessage: "Please provide all required fields (Start Date, End Date, and Number of Top Customers)." 
            });
        }

        const pool = await connectToDatabase();

        // Execute the stored procedure for top revenue customers
        const result = await pool.request()
            .input('NgayBatDau', sql.Date, NgayBatDau)
            .input('NgayKetThuc', sql.Date, NgayKetThuc)
            .input('TopBaoNhieu', sql.Int, SoLuongTop)
            .execute('SP_ThongKe_Top_KhachHang');

        if (result.recordset.length === 0) {
            return res.render('top-revenue-customers', {
                errorMessage: "No data found for the given period.",
                statisticsItems: []
            });
        }

        // Render the results in the view
        res.render('top-revenue-customers', {
            statisticsItems: result.recordset,
            errorMessage: null
        });
    } catch (error) {
        console.error("Error fetching top revenue customers:", error);
        res.render('top-revenue-customers', {
            errorMessage: "An error occurred while fetching the data. Please try again.",
            statisticsItems: []
        });
    }
};

// Get the input form for top-selling dishes
export const getTopSellingDishesForm = (req, res) => {
    res.render('top-selling-dishes', { title: "Top-Selling Dishes" });
};

// Get the results of top-selling dishes
export const getTopSellingDishesResults = async (req, res) => {
    try {
        const { NgayBatDau, NgayKetThuc, SoLuongTop } = req.body;

        // Validate inputs
        if (!NgayBatDau || !NgayKetThuc || !SoLuongTop) {
            return res.render('top-selling-dishes', { 
                errorMessage: "Please provide all required fields (Start Date, End Date, and Number of Top Dishes)." 
            });
        }

        const pool = await connectToDatabase();

        // Execute the stored procedure for top-selling dishes
        const result = await pool.request()
            .input('NgayBatDau', sql.Date, NgayBatDau)
            .input('NgayKetThuc', sql.Date, NgayKetThuc)
            .input('TopBaoNhieu', sql.Int, SoLuongTop)
            .execute('SP_ThongKe_Top_MonAn');

        if (result.recordset.length === 0) {
            return res.render('top-selling-dishes', {
                errorMessage: "No data found for the given period.",
                statisticsItems: []
            });
        }

        // Render the results in the view
        res.render('top-selling-dishes', {
            statisticsItems: result.recordset,
            errorMessage: null
        });
    } catch (error) {
        console.error("Error fetching top-selling dishes:", error);
        res.render('top-selling-dishes', {
            errorMessage: "An error occurred while fetching the data. Please try again.",
            statisticsItems: []
        });
    }
};


// Method to show the form and handle the revenue statistics
export const getBranchRevenue = async (req, res) => {
    try {
        res.render('branch-revenue', { title: "Branch Revenue", errorMessage: null, revenue: null });
    } catch (error) {
        console.error(error);
        res.render('branch-revenue', { errorMessage: "An error occurred while fetching the data.", revenue: null });
    }
};

export const postBranchRevenue = async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.body;

        // Validate inputs
        if (!branchId || !startDate || !endDate) {
            return res.render('branch-revenue', { 
                errorMessage: "Please provide all required fields (Branch, Start Date, End Date).", 
                revenue: null 
            });
        }

        // Connect to the database
        const pool = await connectToDatabase();

        // Execute the stored procedure to get the revenue
        const result = await pool.request()
            .input('MACHI_NHANH', sql.Char(10), branchId)
            .input('NGAYBATDAU', sql.Date, startDate)
            .input('NGAYKETTHUC', sql.Date, endDate)
            .execute('sp_ThongKeDoanhThu');

        // If there's no revenue, handle the case
        const revenue = result.recordset[0]?.TONGDOANHTHU ?? 0;

        // Render the result
        res.render('branch-revenue', { 
            title: "Branch Revenue", 
            revenue, 
            errorMessage: null 
        });
    } catch (error) {
        console.error("Error fetching branch revenue:", error);
        res.render('branch-revenue', { 
            errorMessage: "An error occurred while fetching the data.", 
            revenue: null 
        });
    }
};

export const getFoodQualityAndCustomerFeedbackForm = (req, res) => {
    res.render('food-quality-feedback', { title: "Food Quality and Customer Feedback" });
};

export const getFoodQualityAndCustomerFeedbackResults = async (req, res) => {
    try {
        const { NgayBatDau } = req.body;

        // Validate the input
        if (!NgayBatDau) {
            return res.render('food-quality-feedback', {
                errorMessage: "Please provide the start date for the report."
            });
        }

        const pool = await connectToDatabase();

        // Execute the stored procedure for food quality and customer feedback
        const result = await pool.request()
            .input('NGAYBATDAU', sql.Date, NgayBatDau)
            .execute('SP_THONGKE_CHATLUONG_MONAN');

        if (result.recordset.length === 0) {
            return res.render('food-quality-feedback', {
                errorMessage: "No data found for the given period.",
                statisticsItems: []
            });
        }

        // Render the results in the view
        res.render('food-quality-feedback', {
            statisticsItems: result.recordset,
            errorMessage: null
        });
    } catch (error) {
        console.error("Error fetching food quality and customer feedback:", error);
        res.render('food-quality-feedback', {
            errorMessage: "An error occurred while fetching the data. Please try again.",
            statisticsItems: []
        });
    }
};
