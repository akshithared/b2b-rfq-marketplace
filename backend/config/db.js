import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL if available (Supabase Cloud), fallback to individual local parameters
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for cloud databases like Supabase/Render
      },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: String(process.env.DB_PASSWORD || ""),
      port: Number(process.env.DB_PORT) || 5432,
    };

export const pool = new Pool(connectionConfig);

// Helper function to execute queries directly
export const query = (text, params) => pool.query(text, params);

export default pool;