import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SALT_ROUNDS = 10;
const COOKIE_NAME = "token";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function signToken(payload: {
  id: number;
  email: string;
  role: string;
}): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

function setTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

// Validation helpers

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  const errors: Record<string, string> = {};
  if (!name || name.trim().length === 0) errors.name = "Name is required.";
  if (!email || email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const passwordHash = await bcrypt.hash(password!, SALT_ROUNDS);

  try {
    const stmt = db.prepare(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    );
    const result = stmt.run(
      name!.trim(),
      email!.toLowerCase().trim(),
      passwordHash,
    );
    const userId = result.lastInsertRowid as number;

    const user = db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(userId) as { id: number; name: string; email: string; role: string };

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    setTokenCookie(res, token);

    res.status(201).json(user);
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string };
    if (sqliteErr.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res
        .status(409)
        .json({
          errors: { email: "An account with that email already exists." },
        });
      return;
    }
    throw err;
  }
});

// POST /api/auth/login

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res
      .status(400)
      .json({ errors: { form: "Email and password are required." } });
    return;
  }

  const user = db
    .prepare(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
    )
    .get(email.toLowerCase().trim()) as
    | {
        id: number;
        name: string;
        email: string;
        role: string;
        password_hash: string;
      }
    | undefined;

  // Always run bcrypt to prevent timing attacks
  const dummyHash =
    "$2b$10$invalidhashpaddingtomakethislong00000000000000000000000";
  const passwordMatch = await bcrypt.compare(
    password,
    user?.password_hash ?? dummyHash,
  );

  if (!user || !passwordMatch) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setTokenCookie(res, token);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// POST /api/auth/logout

router.post("/logout", (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" });
  res.status(200).json({ message: "Logged out successfully." });
});

// GET /api/auth/me

router.get("/me", requireAuth, (req: Request, res: Response): void => {
  const user = db
    .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
    .get(req.user!.id) as
    | { id: number; name: string; email: string; role: string }
    | undefined;

  if (!user) {
    res.status(401).json({ error: "User not found." });
    return;
  }

  res.json(user);
});

export default router;
