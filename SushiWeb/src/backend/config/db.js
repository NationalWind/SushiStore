import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// SQL Server configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Use encryption if required
        trustServerCertificate: true, // Use this for self-signed certificates
    },
};

/**
 * Establishes a connection to the SQL Server.
 * @returns {Promise<sql.ConnectionPool>} The connection pool.
 */
const connectToDatabase = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log("Connected to the database.");
        return pool;
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

export { connectToDatabase };
