import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import "dotenv/config";

import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import kolVideosRouter from "./routes/kol-videos.js";

// Fix __dirname cho ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve product images
const assetsDir = path.resolve(__dirname, "..", "assets");
app.use("/assets", express.static(assetsDir));

// API routes
app.use("/api", productsRouter);
app.use("/api", authRouter);
app.use("/api", cartRouter);
app.use("/api", ordersRouter);
app.use("/api", kolVideosRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ✅ Serve frontend (CHUẨN NHẤT)
const frontendDist = path.resolve(process.cwd(), "client", "dist");

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const port = Number(process.env.PORT) || 8080;

app.listen(port, () => {
  console.log(`🚀 SANOVA server running at http://localhost:${port}`);
});