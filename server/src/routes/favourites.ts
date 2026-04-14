import { Router, Request, Response } from "express";
import db from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/properties
// Returns all properties with an `isFavourited` boolean for the current user.

router.get("/properties", (req: Request, res: Response): void => {
  const userId = req.user!.id;

  const properties = db
    .prepare(
      `SELECT
         p.id,
         p.title,
         p.address,
         p.price,
         p.image_url AS imageUrl,
         CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS isFavourited
       FROM properties p
       LEFT JOIN favourites f ON f.property_id = p.id AND f.user_id = ?
       ORDER BY p.id ASC`,
    )
    .all(userId) as Array<{
    id: number;
    title: string;
    address: string;
    price: number;
    imageUrl: string | null;
    isFavourited: number;
  }>;

  // Normalise SQLite integer boolean to JS boolean
  const result = properties.map((p) => ({
    ...p,
    isFavourited: p.isFavourited === 1,
  }));
  res.json(result);
});

// GET /api/favourites

router.get("/favourites", (req: Request, res: Response): void => {
  const userId = req.user!.id;

  const favourites = db
    .prepare(
      `SELECT
         p.id,
         p.title,
         p.address,
         p.price,
         p.image_url AS imageUrl,
         f.created_at AS savedAt
       FROM favourites f
       JOIN properties p ON p.id = f.property_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
    )
    .all(userId);

  res.json(favourites);
});

// POST /api/favourites/:propertyId

router.post("/favourites/:propertyId", (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const propertyId = parseInt(req.params.propertyId, 10);

  if (isNaN(propertyId)) {
    res.status(400).json({ error: "Invalid property ID." });
    return;
  }

  const property = db
    .prepare("SELECT id FROM properties WHERE id = ?")
    .get(propertyId);
  if (!property) {
    res.status(404).json({ error: "Property not found." });
    return;
  }

  try {
    db.prepare(
      "INSERT INTO favourites (user_id, property_id) VALUES (?, ?)",
    ).run(userId, propertyId);

    res.status(201).json({ message: "Property added to favourites." });
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string };
    if (sqliteErr.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res
        .status(409)
        .json({ error: "Property is already in your favourites." });
      return;
    }
    throw err;
  }
});

// DELETE /api/favourites/:propertyId

router.delete(
  "/favourites/:propertyId",
  (req: Request, res: Response): void => {
    const userId = req.user!.id;
    const propertyId = parseInt(req.params.propertyId, 10);

    if (isNaN(propertyId)) {
      res.status(400).json({ error: "Invalid property ID." });
      return;
    }

    // Only delete if the row belongs to the current user (ownership enforced via WHERE)
    const result = db
      .prepare("DELETE FROM favourites WHERE user_id = ? AND property_id = ?")
      .run(userId, propertyId);

    if (result.changes === 0) {
      res.status(404).json({ error: "Favourite not found." });
      return;
    }

    res.json({ message: "Property removed from favourites." });
  },
);

export default router;
