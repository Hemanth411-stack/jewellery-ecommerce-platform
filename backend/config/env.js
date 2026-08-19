import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = resolve(__dirname, "..");

dotenv.config({ path: resolve(backendRoot, ".env") });

if (!process.env.MONGO_URI) {
  dotenv.config({ path: resolve(backendRoot, ".env.example") });
}
