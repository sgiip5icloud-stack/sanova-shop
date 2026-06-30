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

router.get("/admin/orders", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { db } = await import("../db.js");
    const { ordersTable, orderItemsTable } = await import("../schema.js");
    const { desc, eq } = await import("drizzle-orm");
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.id));
    const result = await Promise.all(orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return {
        id: order.id, customerName: order.customerName, customerEmail: order.customerEmail,
        customerPhone: order.customerPhone, address: order.address, city: order.city,
        note: order.note, status: order.status, totalAmount: Number(order.totalAmount),
        items: items.map(i => ({ id: i.id, productId: i.productId, productName: i.productName, quantity: i.quantity, price: Number(i.price), image: i.image })),
        createdAt: order.createdAt.toISOString(),
      };
    }));
    res.json(result);
  } catch { res.status(500).json({ error: "Failed to fetch orders" }); }
});
router.put("/admin/orders/:id/status", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const { db } = await import("../db.js");
    const { ordersTable } = await import("../schema.js");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({ success: true, status: updated.status });
  } catch { res.status(500).json({ error: "Failed to update status" }); }
});
router.delete("/admin/orders/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    const { db } = await import("../db.js");
    const { ordersTable, orderItemsTable } = await import("../schema.js");
    const { eq } = await import("drizzle-orm");
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete order" }); }
});
export default router;
