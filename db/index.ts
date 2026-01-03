import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({ path: ".env.local" });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

export const db = databaseUrl ? drizzle(neon(databaseUrl)) : null;
