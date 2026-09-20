import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected successfully:", result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default pool;
