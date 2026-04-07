import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db.js";
import { productsTable } from "../schema.js";

const router = Router();

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
  };
}

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

export default router;
