import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "data.db");

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Schema

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'buyer',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    address   TEXT    NOT NULL,
    price     INTEGER NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS favourites (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    property_id INTEGER NOT NULL REFERENCES properties(id),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
  );
`);

// Seed properties on first run

const propertyCount = (
  db.prepare("SELECT COUNT(*) as count FROM properties").get() as {
    count: number;
  }
).count;

if (propertyCount === 0) {
  const insert = db.prepare(
    "INSERT INTO properties (title, address, price, image_url) VALUES (?, ?, ?, ?)",
  );

  const seed = db.transaction(() => {
    insert.run(
      "Sunset Ridge Villa",
      "Nagarkot, Kathmandu",
      57500000,
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    );
    insert.run(
      "Downtown Loft",
      "Durbarmarg, Kathmandu",
      42000000,
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    );
    insert.run(
      "Lakefront Cottage",
      "Pokhara, Kaski",
      12500000,
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80",
    );
    insert.run(
      "Modern Townhouse",
      "Jhamsikhel, Lalitpur",
      59000000,
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    );
    insert.run(
      "Garden Bungalow",
      "Maharajgunj, Kathmandu",
      37500000,
      "https://images.unsplash.com/photo-1744311971558-58b152011777?q=80&w=2070",
    );
    insert.run(
      "Penthouse Suite",
      "Baneshwor, Kathmandu",
      21000000,
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    );
    insert.run(
      "Colonial Estate",
      "Dhulikhel, Kavre",
      96000000,
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    );
    insert.run(
      "Beach House Retreat",
      "Sukute, Sindhupalchowk",
      17500000,
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    );
  });

  seed();
  console.log("Database seeded with 8 sample properties.");
}

export default db;
