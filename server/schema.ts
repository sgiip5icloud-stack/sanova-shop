import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scent: text("scent").notNull(),
  pack: text("pack").notNull(),
  price: numeric("price", { precision: 12, scale: 0 }).notNull(),
  originalPrice: numeric("original_price", { precision: 12, scale: 0 }),
  image: text("image").notNull(),
  images: text("images").array().notNull().default([]),
  description: text("description").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  badge: text("badge"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 0 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 0 }).notNull(),
  image: text("image").notNull(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  scent: text("scent").notNull(),
  pack: text("pack").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 12, scale: 0 }).notNull(),
  image: text("image").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kolVideosTable = pgTable("kol_videos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  followers: text("followers").notNull().default(""),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  quote: text("quote").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
