import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { ordersTable, orderItemsTable, productsTable } from "../schema.js";
import { getUserFromToken } from "./auth.js";

const router = Router();

async function buildOrderResponse(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    id: order.id, userId: order.userId, customerName: order.customerName,
    customerEmail: order.customerEmail, customerPhone: order.customerPhone,
    address: order.address, city: order.city, note: order.note,
    status: order.status, totalAmount: Number(order.totalAmount),
    items: items.map(item => ({
      id: item.id, productId: item.productId, productName: item.productName,
      quantity: item.quantity, price: Number(item.price), image: item.image,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, user.id));
  const result = await Promise.all(orders.map(o => buildOrderResponse(o.id)));
  res.json(result.filter(Boolean));
});

router.post("/orders", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  const { customerName, customerEmail, customerPhone, address, city, note, items, totalAmount } = req.body;

  const [order] = await db.insert(ordersTable).values({
    userId: user?.id ?? null, customerName, customerEmail, customerPhone,
    address, city, note: note ?? null, status: "pending", totalAmount: String(totalAmount),
  }).returning();

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (product) {
      await db.insert(orderItemsTable).values({
        orderId: order.id, productId: product.id, productName: product.name,
        quantity: item.quantity, price: product.price, image: product.image,
      });
    }
  }

  res.status(201).json(await buildOrderResponse(order.id));
});

router.get("/orders/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = await buildOrderResponse(id);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

export default router;
