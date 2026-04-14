# TechKraft Buyer Portal (Take-Home Assessment)

A full-stack real-estate buyer portal. Browse property listings, save favourites, and manage your account all in one place.

---

## Prerequisites

- **Node.js 18+** (no database server, no Docker. SQLite is file-based)

---

## Example Flow

| Step | Action                                                                      |
| ---- | --------------------------------------------------------------------------- |
| 1    | Visit `/register`, enter your name, email, and a password (≥ 8 chars)       |
| 2    | You are redirected to `/dashboard` and logged in automatically              |
| 3    | Browse**All Properties**. 8 sample listings are pre-seeded                  |
| 4    | Click the heart icon on any card to add it to**My Favourites**              |
| 5    | Your saved properties appear in the**My Favourites** panel at the top       |
| 6    | Click**Remove** in the Favourites panel (or un-heart the card) to remove it |
| 7    | Click**Logout** in the header, you are redirected to `/login`               |

---

## API Reference

| Method   | Path                  | Auth | Description                             |
| -------- | --------------------- | ---- | --------------------------------------- |
| `POST`   | `/api/auth/register`  | —    | Register a new user; sets JWT cookie    |
| `POST`   | `/api/auth/login`     | —    | Log in; sets JWT cookie                 |
| `POST`   | `/api/auth/logout`    | —    | Clear JWT cookie                        |
| `GET`    | `/api/auth/me`        | ✓    | Return current user from JWT            |
| `GET`    | `/api/properties`     | ✓    | All properties with `isFavourited` flag |
| `GET`    | `/api/favourites`     | ✓    | Current user's favourited properties    |
| `POST`   | `/api/favourites/:id` | ✓    | Add property to favourites              |
| `DELETE` | `/api/favourites/:id` | ✓    | Remove property from favourites         |

**Auth** = requires a valid `token` httpOnly cookie (set automatically on login/register).
