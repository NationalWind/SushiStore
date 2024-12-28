import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { connectToDatabase } from "../config/db.js"; // Your database connection file
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key

// User signup controller
export const signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query("SELECT * FROM ACCOUNT WHERE username = @username");

        if (result.recordset.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        await pool.request()
            .input("username", sql.NVarChar, username)
            .input("password", sql.NVarChar, hashedPassword)
            .input("role", sql.NVarChar, "customer") // Insert the role as "customer"
            .query("INSERT INTO ACCOUNT (username, password, role) VALUES (@username, @password, @role)");

        res.redirect("/login"); // Redirect to the login page
        //res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User login controller
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query("SELECT * FROM ACCOUNT WHERE username = @username");

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const user = result.recordset[0];
        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.USERNAME }, SECRET_KEY, {
            expiresIn: "1h", // Token expires in 1 hour
        });
        //res.status(200).json({ message: "Login successful", token });
        // Set token in cookies or session (if using sessions)
        res.cookie("authToken", token, { httpOnly: true, secure: true }); // Secure in production
        res.redirect("/home"); // Redirect to the home page
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
