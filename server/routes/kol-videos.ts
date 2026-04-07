import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { kolVideosTable } from "../schema.js";

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sanova-admin-2024";

function checkAdmin(req: any, res: any): boolean {
  const password = req.headers["x-admin-password"] || req.body?.adminPassword;
  if (password !== ADMIN_PASSWORD) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

router.get("/kol-videos", async (_req, res) => {
  try {
    const videos = await db.select().from(kolVideosTable).orderBy(kolVideosTable.sortOrder);
    res.json(videos);
  } catch { res.status(500).json({ error: "Failed to fetch" }); }
});

router.post("/admin/kol-videos", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { name, channel, followers, videoUrl, thumbnailUrl, quote, sortOrder } = req.body;
    const [created] = await db.insert(kolVideosTable)
      .values({ name, channel, followers, videoUrl, thumbnailUrl: thumbnailUrl || "", quote: quote || "", sortOrder: sortOrder || 0 })
      .returning();
    res.json(created);
  } catch { res.status(500).json({ error: "Failed to create" }); }
});

router.put("/admin/kol-videos/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    const { name, channel, followers, videoUrl, thumbnailUrl, quote, sortOrder } = req.body;
    const [updated] = await db.update(kolVideosTable)
      .set({ name, channel, followers, videoUrl, thumbnailUrl: thumbnailUrl || "", quote: quote || "", sortOrder: sortOrder ?? 0 })
      .where(eq(kolVideosTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update" }); }
});

router.delete("/admin/kol-videos/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(kolVideosTable).where(eq(kolVideosTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete" }); }
});

export default router;
