import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db.js";
import { cartItemsTable, productsTable } from "../schema.js";

const router = Router();

function getSessionId(req: any): string {
  const header = req.headers["x-session-id"];
  if (typeof header === "string") return header;
  if (Array.isArray(header) && header.length > 0) return header[0];
  return "anonymous";
}

async function buildCartResponse(sessionId: string) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    items: items.map(item => ({
      id: item.id, productId: item.productId, productName: item.productName,
      scent: item.scent, pack: item.pack, quantity: item.quantity,
      price: Number(item.price), image: item.image,
    })),
    total, itemCount,
  };
}

router.get("/cart", async (req, res) => {
  res.json(await buildCartResponse(getSessionId(req)));
});

router.post("/cart", async (req, res) => {
  const sessionId = getSessionId(req);
  const { productId, quantity } = req.body;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const [existing] = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  if (existing) {
    await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity }).where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId, productId: product.id, productName: product.name,
      scent: product.scent, pack: product.pack, quantity, price: product.price, image: product.image,
    });
  }
  res.json(await buildCartResponse(sessionId));
});

router.delete("/cart", async (req, res) => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, getSessionId(req)));
  res.json({ items: [], total: 0, itemCount: 0 });
});

router.put("/cart/:itemId", async (req, res) => {
  const sessionId = getSessionId(req);
  const itemId = parseInt(req.params.itemId, 10);
  const { quantity } = req.body;
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  } else {
    await db.update(cartItemsTable).set({ quantity }).where(eq(cartItemsTable.id, itemId));
  }
  res.json(await buildCartResponse(sessionId));
});

router.delete("/cart/:itemId", async (req, res) => {
  const sessionId = getSessionId(req);
  const itemId = parseInt(req.params.itemId, 10);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  res.json(await buildCartResponse(sessionId));
});

export default router;
