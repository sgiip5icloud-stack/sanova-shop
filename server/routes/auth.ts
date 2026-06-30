import { Router } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../db.js";
import { usersTable, sessionsTable } from "../schema.js";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sanova-salt-2024").digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const [session] = await db
    .select({ userId: sessionsTable.userId, expiresAt: sessionsTable.expiresAt })
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token));

  if (!session || session.expiresAt < new Date()) return null;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  return user || null;
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) { res.status(400).json({ error: "Missing fields" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) { res.status(400).json({ error: "Email already exists" }); return; }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, phone: phone ?? null, role: "customer",
  }).returning();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Missing fields" }); return; }

  const passwordHash = hashPassword(password);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "Invalid credentials" }); return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    token,
  });
});

router.post("/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
});

// =====================
// ADMIN USER MANAGEMENT
// =====================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sanova-admin-2024";

function checkAdmin(req: any, res: any): boolean {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

router.get("/admin/users", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.put("/admin/users/:id/role", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { role } = req.body;
  if (!role || !["customer", "admin"].includes(role)) {
    res.status(400).json({ error: "Role must be 'customer' or 'admin'" }); return;
  }

  const [updated] = await db.update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
});

router.delete("/admin/users/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  // Delete sessions first
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));
  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true });
});

export default router;