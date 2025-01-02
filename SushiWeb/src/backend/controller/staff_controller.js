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

export const formOrder = async (req, res) => {
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

		// Render the form page and pass the branch IDs and any other required data
		res.render('stafforder', { branchId, name: req.username, role: req.role });
	} catch (err) {
		console.error(err);
		res.status(500).send("Error fetching branch IDs.");
	}
};

// Create Order Controller
export const createOrder = async (req, res) => {
	try {
		const pool = await connectToDatabase();

		// Generate new order ID
		const resultMaDon = await pool.request()
			.query("SELECT TOP 1 MADON FROM DONDATMON ORDER BY MADON DESC");

		let newMADON = "DON0000001";
		if (resultMaDon.recordset.length > 0) {
			const lastMADON = resultMaDon.recordset[0].MADON;
			const lastNumber = parseInt(lastMADON.substring(3));
			const newNumber = lastNumber + 1;
			newMADON = `DON${String(newNumber).padStart(7, "0")}`;
		}

		// Extract customer data from the request body
		const { MAKH, LOAIDONDATMON, CHINHANHDAT } = req.body; // Assuming MAKH (Customer ID), LOAIDONDATMON (Order Type), CHINHANHDAT (Branch)

		// Insert the new order into DONDATMON table
		await pool.request()
			.input("MADON", sql.Char, newMADON)
			.input("KHACHHANGDAT", sql.Char, MAKH)
			.input("LOAIDONDATMON", sql.NVarChar, LOAIDONDATMON)
			.input("CHINHANHDAT", sql.Char, CHINHANHDAT)
			.query(`
                INSERT INTO DONDATMON (MADON, KHACHHANGDAT, LOAIDONDATMON, NGAYDAT, GIODAT, TRANGTHAI)
                VALUES (@MADON, @KHACHHANGDAT, @LOAIDONDATMON, GETDATE(), CONVERT(TIME(0), GETDATE()), N'Processing')
            `);

		// Send a success response
		res.redirect('/staff/order/add-dish');
	} catch (err) {
		console.error(err);
		res.status(500).send("Error processing the order.");
	}
};

export const showDish = async (req, res) => {
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

		// Fetch categories for the branch
		const categoryQuery = `
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
            AND MENU.TRANGTHAIPHUCVU = N'Available'
        `;
		const result = await pool.request()
			.input("branchId", sql.Char, branchId)
			.query(categoryQuery);

		const categorizedMenu = {};
		result.recordset.forEach(item => {
			const category = item.DANHMUC;
			if (!categorizedMenu[category]) {
				categorizedMenu[category] = [];
			}
			categorizedMenu[category].push(item);
		});

		// Pass the data to the Handlebars template for rendering
		res.render('staffadddish', {
			branchId,
			categories: Object.entries(categorizedMenu).map(([categoryName, items]) => ({
				categoryName,
				items
			})), name: req.username, role: req.role
		});
	} catch (error) {
		console.error("Error in showDish:", error);
		res.status(500).send("An error occurred while loading the menu.");
	}
}

export const addDish = async (req, res) => {
	try {
		const { MADON, dishes } = req.body;

		if (!MADON || !Array.isArray(dishes) || dishes.length === 0) {
			return res.status(400).json({ message: "Invalid order data." });
		}

		// Connect to the database
		const pool = await connectToDatabase();

		const itemResult = await pool.request()
			.query("SELECT TOP 1 MACTMON FROM CHITIETMONAN ORDER BY MACTMON DESC");

		let newMACTMON = 'CTM0000001';  // Default to the first ID if no records exist
		let numberPart = 0;
		if (itemResult.recordset.length > 0) {
			const highestMACTMON = itemResult.recordset[0].MACTMON;
			numberPart = parseInt(highestMACTMON.slice(3)) + 1;
		}

		console.log(dishes);
		// Insert each dish into the order
		for (const { MAMENU, quantity } of dishes) {
			const insertQuery = `
                INSERT INTO CHITIETMONAN (MACTMON, MAMENU, SOLUONG, MADONDATMON)
                VALUES (@MACTMON, @MAMENU, @quantity, @MADON)
            `;
			newMACTMON = `CTM${numberPart.toString().padStart(7, '0')}`;
			await pool.request()
				.input('MACTMON', sql.Char, newMACTMON)
				.input('MADON', sql.Char, MADON)
				.input('MAMENU', sql.Char, MAMENU)
				.input('quantity', sql.Int, quantity)
				.query(insertQuery);
			numberPart += 1;
		}

		res.status(200).json({ message: "Order submitted successfully!" });
	} catch (error) {
		console.error("Error in addDish:", error);
		res.status(500).json({ message: "An error occurred while submitting the order." });
	}
};

export const showPayment = async (req, res) => {
	try {
		const { MAKHACHHANG } = req.query;

		const pool = await connectToDatabase();

		const result = await pool.request()
			.input('MAKHACHHANG', MAKHACHHANG)
			.query(`
                SELECT MADON, NGAYDAT, TRANGTHAI, LOAIDONDATMON, HOADONLIENQUAN, MADATCHO, CHINHANHDAT, NHANVIENTAOLAP, THANHTIEN
                FROM DONDATMON
                WHERE KHACHHANGDAT = @MAKHACHHANG
            `);

		const orders = result.recordset;

		res.render("addpayment", { orders, MAKHACHHANG, name: req.username, role: req.role });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error retrieving invoices" });
	}
};

export const addPayment = async (req, res) => {
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

		// Extract values from the request body (assumed to be a list of order IDs)
		const { MAKHACHHANG, selectedOrders, TIENKHACHDUA, PHUONGTHUC } = req.body;
		console.log(MAKHACHHANG, selectedOrders, TIENKHACHDUA, PHUONGTHUC);
		// Validate required fields
		if (!selectedOrders || !selectedOrders.length || !TIENKHACHDUA || !PHUONGTHUC || !MAKHACHHANG) {
			return res.status(400).json({ error: "All fields are required" });
		}

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

		// Insert new invoice into the database
		await pool.request()
			.input('TIENKHACHDUA', TIENKHACHDUA)
			.input('PHUONGTHUC', PHUONGTHUC)
			.input('MAKHACHHANG', MAKHACHHANG)
			.input('MACHINHANH', branchId)
			.input('MAHOADON', newMAHOADON)
			.input('TRANGTHAI', "Paid")
			.query(`
				INSERT INTO HOADON (MAHOADON, NGAYLAP, GIOLAP, TIENKHACHDUA, TRANGTHAI, PHUONGTHUC, MAKHACHHANG, MACHINHANH)
				VALUES(@MAHOADON, GETDATE(), CONVERT(TIME(0),GETDATE()), @TIENKHACHDUA, @TRANGTHAI, @PHUONGTHUC, @MAKHACHHANG, @MACHINHANH)
			`);

		// Loop through each order and update its payment details
		for (const order of selectedOrders) {
			const { MADON } = order; // Extract the order ID (MADON)

			// Update the order with the new MAHOADON as HOADONLIENQUAN
			await pool.request()
				.input('HOADONLIENQUAN', newMAHOADON)
				.input('MADON', MADON)
				.query(`
					UPDATE DONDATMON
					SET HOADONLIENQUAN = @HOADONLIENQUAN
					WHERE MADON = @MADON
				`);
		}
		await pool.request()
			.input("MAHOADON", sql.Char(10), newMAHOADON)
			.execute("sp_TinhVaCapNhatTongTien");

		// Redirect to the staff page
		res.redirect(`/staff`);
	} catch (error) {
		// Handle errors
		console.error(error);
		res.status(500).json({ error: "Error adding payment" });
	}
};

export const displayAllPayment = async (req, res) => {
	try {
		const { MAKHACHHANG } = req.query;

		const pool = await connectToDatabase();

		const result = await pool.request()
			.input('MAKHACHHANG', MAKHACHHANG)
			.query(`
                SELECT MAHOADON, NGAYLAP, TONGTIENTRUOCKM, TONGTIENSAUKM, TIENKHACHDUA, TRANGTHAI, PHUONGTHUC
                FROM HOADON
                WHERE MAKHACHHANG = @MAKHACHHANG
            `);

		const invoices = result.recordset;
		console.log(invoices);
		res.render("allPayments", { invoices, MAKHACHHANG, name: req.username, role: req.role });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error retrieving invoices" });
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

// Controller function to render the form and handle the results
export const getStaffReviewsForm = (req, res) => {
	// Render the form (this can be a button or just an action to fetch data)
	res.render('staff-reviews-form', { title: "Staff and Corresponding Reviews" });
};

export const getStaffReviewsResults = async (req, res) => {
	try {
		// Connect to the database
		const pool = await connectToDatabase();

		// Execute the stored procedure to get staff and reviews data
		const result = await pool.request().execute('SP_XemDanhSachDanhGiaNhanVien');

		if (result.recordset.length === 0) {
			return res.render('staff-reviews-form', {
				errorMessage: "No data found.",
				statisticsItems: []
			});
		}

		// Render the results in the view
		res.render('staff-reviews-form', {
			statisticsItems: result.recordset,
			errorMessage: null
		});

	} catch (error) {
		console.error("Error fetching staff reviews:", error);
		res.render('staff-reviews-form', {
			errorMessage: "An error occurred while fetching the data. Please try again.",
			statisticsItems: []
		});
	}
};

export const getCustomerOrderTrendsForm = (req, res) => {
	res.render('customer-order-trends', { title: "Customer Order Trends" });
};

export const getCustomerOrderTrendsResults = async (req, res) => {
	try {
		const { NgayBatDau, NgayKetThuc, MaChiNhanh } = req.body;

		// Validate inputs
		if (!NgayBatDau || !NgayKetThuc || !MaChiNhanh) {
			return res.render('customer-order-trends', {
				errorMessage: "Please provide all required fields (Start Date, End Date, and Branch ID)."
			});
		}

		const pool = await connectToDatabase();

		// Execute the stored procedure for customer order trends
		const result = await pool.request()
			.input('NgayBatDau', sql.Date, NgayBatDau)
			.input('NgayKetThuc', sql.Date, NgayKetThuc)
			.input('MaChiNhanh', sql.Char(10), MaChiNhanh)
			.execute('SP_THONGKE_XUHUONG_KHACHHANG');

		if (result.recordset.length === 0) {
			return res.render('customer-order-trends', {
				errorMessage: "No data found for the given period and branch.",
				trendsData: []
			});
		}

		// Render the results in the view
		res.render('customer-order-trends', {
			trendsData: result.recordset,
			errorMessage: null
		});
	} catch (error) {
		console.error("Error fetching customer order trends:", error);
		res.render('customer-order-trends', {
			errorMessage: "An error occurred while fetching the data. Please try again.",
			trendsData: []
		});
	}
};

export const getOrderAndInvoiceDetails = async (req, res) => {
	try {
		const { NgayDat } = req.body;

		// Validate if the required input (NgayDat) is provided
		if (!NgayDat) {
			return res.render('order-invoice', { errorMessage: "Please provide a date." });
		}

		const pool = await connectToDatabase();

		// Execute the stored procedure to fetch orders and invoices for the given date
		const result = await pool.request()
			.input('ngaydat', sql.Date, NgayDat)
			.execute('SP_DS_DONDATMON_HOADON_THEONGAY');

		if (result.recordset.length === 0) {
			return res.render('order-invoice', {
				errorMessage: "No orders or invoices found for the given date.",
				orders: []
			});
		}

		// Render the result
		res.render('order-invoice', {
			orders: result.recordset,
			errorMessage: null
		});

	} catch (error) {
		console.error("Error fetching order and invoice details:", error);
		res.render('order-invoice', {
			errorMessage: "An error occurred while fetching the data. Please try again.",
			orders: []
		});
	}
};

export const updateMembershipStatus = async (req, res) => {
	try {
		const pool = await connectToDatabase();

		// Execute the stored procedure for updating membership status
		await pool.request()
			.execute('SP_CapNhatHangThe'); // Executes the stored procedure

		// Render the success message with a success status
		res.render('update-membership-status', {
			successMessage: "Membership status updated successfully!"
		});

	} catch (error) {
		console.error(error);
		res.render('update-membership-status', {
			errorMessage: "An error occurred while updating membership status."
		});
	}
};


export const createMembershipCard = async (req, res) => {
	try {
		const { MAKHACHHANG, HOTEN, SDT, EMAIL, CCCD } = req.body;

		// Check if all required fields are provided
		if (!MAKHACHHANG || !HOTEN || !SDT || !EMAIL || !CCCD) {
			return res.status(400).json({ error: "All fields are required" });
		}

		const token = req.cookies.authToken;

		if (!token) {
			return res.render("create-membership", { categories: [], errorMessage: "No token provided." });
		}

		// Decode the token to get the user's username
		const decoded = jwt.verify(token, SECRET_KEY);
		const username = decoded.username;

		// Connect to the database
		const pool = await connectToDatabase();

		// Fetch the staff ID (MANHANVIEN) for the logged-in user
		const staffQuery = `
			SELECT NV.MANHANVIEN 
			FROM NHANVIEN NV
			INNER JOIN ACCOUNT ACC ON NV.ACCOUNT_ID = ACC.ID
			WHERE ACC.USERNAME = @username
		`;

		const staffResult = await pool.request()
			.input("username", sql.NVarChar, username)
			.query(staffQuery);

		if (staffResult.recordset.length === 0) {
			return res.render("create-membership", { categories: [], errorMessage: "Staff not found or unauthorized." });
		}

		const staffId = staffResult.recordset[0].MANHANVIEN;

		// Insert into the database using a stored procedure for creating/updating the membership card
		await pool.request()
			.input('MAKHACHHANG', sql.Char(10), MAKHACHHANG)
			.input('HOTEN', sql.NVarChar(50), HOTEN)
			.input('SDT', sql.Char(10), SDT)
			.input('EMAIL', sql.NVarChar(50), EMAIL)
			.input('CCCD', sql.NVarChar(20), CCCD)
			.input('NHANVIENTAOLAP', sql.Char(10), staffId) // Use staffId instead of username
			.execute('SP_TaoVaCapThe'); // Executes the stored procedure for membership card creation

		// Render success message after membership card is created
		res.render("create-membership", {
			successMessage: "Membership card created/updated successfully!"
		});
	} catch (error) {
		console.error(error);
		res.render("create-membership", { errorMessage: "An error occurred while creating/updating the membership card." });
	}
};
