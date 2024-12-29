import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key

const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.username = decoded.username; // Attach username to the request
        req.role = decoded.role;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.redirect("/login");
    }
};

export default authenticateToken;
