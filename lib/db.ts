import { Pool, type QueryResult, type QueryResultRow } from "pg";
import type { DatabaseRow } from "./schema";
import { prisma } from "./prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Singleton pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Constrain T to QueryResultRow
export async function sql<T extends QueryResultRow = DatabaseRow>(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  try {
    const result: QueryResult<T> = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[DB Error]", error);
    throw error;
  }
}

export async function executeQuery<T extends QueryResultRow = DatabaseRow>(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  return sql<T>(query, params);
}

export async function closePool() {
  await pool.end();
}

export { prisma };
export default prisma;
