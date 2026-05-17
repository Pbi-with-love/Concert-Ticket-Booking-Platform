import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({
  path: path.resolve(__dirname, "../../.env"),
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
