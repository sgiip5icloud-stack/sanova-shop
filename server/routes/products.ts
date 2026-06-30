import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db.js";
import { productsTable } from "../schema.js";

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sanova-admin-2024";

function checkAdmin(req: any, res: any): boolean {
  const password = req.headers["x-admin-password"] || req.body?.adminPassword;
  if (password !== ADMIN_PASSWORD) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    scent: p.scent,
    pack: p.pack,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    image: p.image,
    images: p.images ?? [],
    description: p.description,
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    badge: p.badge ?? undefined,
    sortOrder: p.sortOrder,
  };
}

// =====================
// PUBLIC ROUTES
// =====================

router.get("/products/featured", async (_req, res) => {
  const products = await db.select().from(productsTable).where(eq(productsTable.isFeatured, true));
  res.json(products.map(formatProduct));
});

router.get("/products", async (req, res) => {
  const { scent, pack } = req.query as { scent?: string; pack?: string };
  const conditions = [];
  if (scent) conditions.push(eq(productsTable.scent, scent));
  if (pack) conditions.push(eq(productsTable.pack, pack));

  const products = conditions.length > 0
    ? await db.select().from(productsTable).where(and(...conditions)).orderBy(asc(productsTable.sortOrder))
    : await db.select().from(productsTable).orderBy(asc(productsTable.sortOrder));

  res.json(products.map(formatProduct));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json(formatProduct(product));
});

// =====================
// ADMIN ROUTES
// =====================

router.post("/admin/products", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { name, scent, pack, price, originalPrice, image, images, description, inStock, isFeatured, badge, sortOrder } = req.body;
    if (!name || !scent || !pack || !price || !image || !description) {
      res.status(400).json({ error: "Missing required fields: name, scent, pack, price, image, description" });
      return;
    }
    const [created] = await db.insert(productsTable).values({
      name,
      scent,
      pack: String(pack),
      price: String(price),
      originalPrice: originalPrice ? String(originalPrice) : null,
      image,
      images: images || [],
      description,
      inStock: inStock ?? true,
      isFeatured: isFeatured ?? false,
      badge: badge || null,
      sortOrder: sortOrder ?? 0,
    }).returning();
    res.json(formatProduct(created));
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const { name, scent, pack, price, originalPrice, image, images, description, inStock, isFeatured, badge, sortOrder } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (scent !== undefined) updateData.scent = scent;
    if (pack !== undefined) updateData.pack = String(pack);
    if (price !== undefined) updateData.price = String(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? String(originalPrice) : null;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;
    if (description !== undefined) updateData.description = description;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (badge !== undefined) updateData.badge = badge || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const [updated] = await db.update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(formatProduct(updated));
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Product not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
