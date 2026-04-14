import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import favouritesRouter from "./routes/favourites";

// JWT_SECRET guard

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-secret-please-set-JWT_SECRET-in-env";
  console.warn(
    "[WARNING] JWT_SECRET is not set. Using an insecure default. " +
      "Set JWT_SECRET in your .env file before deploying.",
  );
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware

app.use(
  cors({
    origin: "https://aayushshres.github.io",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes

app.use("/api/auth", authRouter);
app.use("/api", favouritesRouter);

// 404 handler

app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: "Route not found." });
});

// Global error handler

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("[Error]", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    res.status(500).json({ error: message });
  },
);

// Start server

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
