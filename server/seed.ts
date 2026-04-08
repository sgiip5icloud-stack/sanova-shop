import { db } from "./db.js";
import { productsTable, kolVideosTable, usersTable } from "./schema.js";
import crypto from "crypto";
import "dotenv/config";

// Hash password giống auth
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sanova-salt-2024").digest("hex");
}

async function seed() {
  console.log("🚀 Start seeding...");

  // =====================
  // ADMIN USER
  // =====================
  console.log("Seeding admin...");

  const existingUsers = await db.select().from(usersTable);

  if (existingUsers.length === 0) {
    await db.insert(usersTable).values({
      name: "Admin",
      email: "admin@gmail.com",
      passwordHash: hashPassword("123456"),
      phone: null,
      role: "admin",
    });

    console.log("✅ Admin created: admin@gmail.com / 123456");
  } else {
    console.log("⚠️ Users already exist, skip admin seed");
  }

  // =====================
  // PRODUCTS
  // =====================
  console.log("Seeding products...");
  await db.delete(productsTable);

  await db.insert(productsTable).values([
    { name: "SANOVA Room Fragrance Diffuser", scent: "peach", pack: "1", price: "300", originalPrice: "420", image: "peach-1", description: "Fresh and sweet peach scent that brightens any room. Each bottle lasts up to 90 days. Made with 100% natural extracts — safe for the whole family.", inStock: true, isFeatured: true, badge: "New", sortOrder: 1 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "lavender", pack: "1", price: "300", originalPrice: "420", image: "lavender-1", description: "Soft and calming lavender scent perfect for relaxation. Each bottle lasts up to 90 days. Made with 100% natural extracts — safe for the whole family.", inStock: true, isFeatured: true, badge: "New", sortOrder: 2 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "ocean", pack: "1", price: "300", originalPrice: "420", image: "ocean-1", description: "Cool and refreshing ocean scent that energizes your space. Each bottle lasts up to 90 days. Made with 100% natural extracts — safe for the whole family.", inStock: true, isFeatured: true, badge: "New", sortOrder: 3 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "peach", pack: "2", price: "525", originalPrice: "750", image: "peach-2", description: "Pack of 2 Peach diffusers — save more, last longer.", inStock: true, isFeatured: false, badge: "Sale", sortOrder: 4 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "lavender", pack: "2", price: "525", originalPrice: "750", image: "lavender-2", description: "Pack of 2 Lavender diffusers — save more, last longer.", inStock: true, isFeatured: false, badge: "Sale", sortOrder: 5 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "ocean", pack: "2", price: "525", originalPrice: "750", image: "ocean-2", description: "Pack of 2 Ocean diffusers — save more, last longer.", inStock: true, isFeatured: false, badge: "Sale", sortOrder: 6 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "peach", pack: "3", price: "750", originalPrice: "1050", image: "peach-3", description: "Pack of 3 Peach diffusers — best value.", inStock: true, isFeatured: false, badge: "Best Value", sortOrder: 7 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "lavender", pack: "3", price: "750", originalPrice: "1050", image: "lavender-3", description: "Pack of 3 Lavender diffusers — best value.", inStock: true, isFeatured: false, badge: "Best Value", sortOrder: 8 },
    { name: "SANOVA Room Fragrance Diffuser", scent: "ocean", pack: "3", price: "750", originalPrice: "1050", image: "ocean-3", description: "Pack of 3 Ocean diffusers — best value.", inStock: true, isFeatured: false, badge: "Best Value", sortOrder: 9 },
    { name: "SANOVA Mix Pack – Peach & Lavender", scent: "peach-lavender", pack: "2", price: "525", originalPrice: "750", image: "peach-lavender-2", description: "Mix pack Peach & Lavender.", inStock: true, isFeatured: false, badge: null, sortOrder: 10 },
    { name: "SANOVA Mix Pack – Peach & Ocean", scent: "peach-ocean", pack: "2", price: "525", originalPrice: "750", image: "peach-ocean-2", description: "Mix pack Peach & Ocean.", inStock: true, isFeatured: false, badge: null, sortOrder: 11 },
    { name: "SANOVA Mix Pack – Lavender & Ocean", scent: "lavender-ocean", pack: "2", price: "525", originalPrice: "750", image: "lavender-ocean-2", description: "Mix pack Lavender & Ocean.", inStock: true, isFeatured: false, badge: null, sortOrder: 12 },
    { name: "SANOVA Ultimate Collection – All 3 Scents", scent: "all", pack: "3", price: "750", originalPrice: "1050", image: "all-3", description: "Full collection of all scents.", inStock: true, isFeatured: true, badge: "Popular", sortOrder: 13 }
  ]);

  // =====================
  // KOL VIDEOS
  // =====================
 console.log("Seeding KOL videos...");
  await db.delete(kolVideosTable);
  await db.insert(kolVideosTable).values([
    { name: "", channel: "", followers: "", videoUrl: "/assets/review1.mp4", thumbnailUrl: "", quote: "SANOVA keeps my bedroom smelling amazing all day! Absolutely obsessed with the Lavender scent 💜", sortOrder: 1 },
    { name: "", channel: "", followers: "", videoUrl: "/assets/review2.mp4", thumbnailUrl: "", quote: "Honest review: used it for a month and it is still fragrant — totally worth every penny!", sortOrder: 2 },
    { name: "", channel: "", followers: "", videoUrl: "/assets/review3.mp4", thumbnailUrl: "", quote: "Put SANOVA Peach in my living room and every guest asks what perfume I am wearing 🍑", sortOrder: 3 },
    { name: "", channel: "", followers: "", videoUrl: "/assets/review4.mp4", thumbnailUrl: "", quote: "Ocean scent is so cool and refreshing — perfect for my home office 🌊", sortOrder: 4 },
  ]);

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});