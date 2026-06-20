import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL || "";
let prisma: PrismaClient;
if (dbUrl.includes("neon.tech")) {
  const adapter = new PrismaNeonHttp(dbUrl, { arrayMode: false, fullResults: false });
  prisma = new PrismaClient({ adapter } as any);
} else {
  const pool = new pg.Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter, log: ["error"] } as any);
}

const menuData = [
  {
    name: "Starters", sortOrder: 1,
    items: [
      { name: "Paneer Tikka", price: 280, isVeg: true, description: "Marinated cottage cheese grilled in tandoor" },
      { name: "Hara Bhara Kabab", price: 220, isVeg: true, description: "Spinach & pea patties with spiced potato filling" },
      { name: "Tandoori Mushroom", price: 260, isVeg: true, description: "Button mushrooms in spiced yogurt, tandoor grilled" },
      { name: "Chicken Tikka", price: 320, isVeg: false, description: "Tender chicken in yogurt & spices, tandoor grilled" },
      { name: "Chicken Malai Tikka", price: 340, isVeg: false, description: "Creamy chicken tikka with cashew & cream marinade" },
      { name: "Mutton Seekh Kabab", price: 380, isVeg: false, description: "Minced mutton kababs with ginger, garlic & herbs" },
      { name: "Fish Amritsari", price: 360, isVeg: false, description: "Crispy battered fish with ajwain & chilli" },
      { name: "Prawn Koliwada", price: 420, isVeg: false, description: "Spiced prawns in crispy batter, Mumbai street style" },
    ],
  },
  {
    name: "Soups", sortOrder: 2,
    items: [
      { name: "Tomato Shorba", price: 140, isVeg: true, description: "Spiced Indian tomato soup with fresh cream" },
      { name: "Dal Shorba", price: 130, isVeg: true, description: "Lentil soup tempered with cumin & coriander" },
      { name: "Sweet Corn Soup", price: 150, isVeg: true, description: "Creamy sweet corn soup with vegetables" },
      { name: "Chicken Shorba", price: 180, isVeg: false, description: "Clear chicken broth with whole spices & herbs" },
    ],
  },
  {
    name: "Main Course — Veg", sortOrder: 3,
    items: [
      { name: "Paneer Butter Masala", price: 320, isVeg: true, description: "Cottage cheese in rich tomato-butter-cream gravy" },
      { name: "Palak Paneer", price: 300, isVeg: true, description: "Cottage cheese in smooth spinach gravy" },
      { name: "Shahi Paneer", price: 330, isVeg: true, description: "Paneer in royal cashew & cream sauce" },
      { name: "Dal Makhani", price: 260, isVeg: true, description: "Slow-cooked black lentils with butter & cream" },
      { name: "Dal Tadka", price: 220, isVeg: true, description: "Yellow lentils tempered with ghee & cumin" },
      { name: "Chana Masala", price: 240, isVeg: true, description: "Spiced chickpeas in tangy onion-tomato gravy" },
      { name: "Malai Kofta", price: 300, isVeg: true, description: "Fried paneer & potato dumplings in creamy gravy" },
      { name: "Kadai Paneer", price: 310, isVeg: true, description: "Paneer with capsicum in spiced kadai masala" },
      { name: "Baingan Bharta", price: 240, isVeg: true, description: "Smoky roasted eggplant with onions & tomatoes" },
      { name: "Aloo Gobi", price: 220, isVeg: true, description: "Potato & cauliflower stir-fried with Indian spices" },
    ],
  },
  {
    name: "Main Course — Non Veg", sortOrder: 4,
    items: [
      { name: "Butter Chicken", price: 380, isVeg: false, description: "Tender chicken in velvety tomato-butter-cream sauce" },
      { name: "Chicken Tikka Masala", price: 370, isVeg: false, description: "Grilled chicken tikka in spiced masala gravy" },
      { name: "Kadai Chicken", price: 360, isVeg: false, description: "Chicken with capsicum & onion in kadai masala" },
      { name: "Mutton Rogan Josh", price: 460, isVeg: false, description: "Slow-cooked mutton in Kashmiri spices & yogurt" },
      { name: "Mutton Korma", price: 480, isVeg: false, description: "Tender mutton in rich cashew & cream korma sauce" },
      { name: "Prawn Masala", price: 520, isVeg: false, description: "Juicy prawns in spiced coastal masala gravy" },
      { name: "Fish Curry", price: 440, isVeg: false, description: "Fresh fish in tangy coconut & tomato curry" },
      { name: "Egg Curry", price: 260, isVeg: false, description: "Boiled eggs in spiced onion-tomato gravy" },
    ],
  },
  {
    name: "Breads", sortOrder: 5,
    items: [
      { name: "Butter Naan", price: 60, isVeg: true, description: "Soft leavened bread baked in tandoor with butter" },
      { name: "Garlic Naan", price: 70, isVeg: true, description: "Naan topped with garlic & coriander" },
      { name: "Laccha Paratha", price: 65, isVeg: true, description: "Flaky whole wheat layered paratha" },
      { name: "Tandoori Roti", price: 40, isVeg: true, description: "Whole wheat bread baked in tandoor" },
      { name: "Puri", price: 50, isVeg: true, description: "Deep-fried whole wheat bread" },
      {
        name: "Stuffed Paratha", price: 90, isVeg: true, description: "Whole wheat paratha with your choice of filling",
        variants: [{ name: "Aloo", price: 90 }, { name: "Paneer", price: 110 }, { name: "Gobi", price: 95 }],
      },
    ],
  },
  {
    name: "Rice & Biryani", sortOrder: 6,
    items: [
      { name: "Veg Biryani", price: 280, isVeg: true, description: "Fragrant basmati rice with mixed vegetables & spices" },
      { name: "Paneer Biryani", price: 320, isVeg: true, description: "Basmati rice layered with spiced paneer & saffron" },
      { name: "Chicken Biryani", price: 380, isVeg: false, description: "Hyderabadi dum biryani with tender chicken" },
      { name: "Mutton Biryani", price: 460, isVeg: false, description: "Slow-cooked mutton dum biryani with saffron" },
      { name: "Egg Biryani", price: 280, isVeg: false, description: "Basmati rice with spiced boiled eggs" },
      { name: "Jeera Rice", price: 160, isVeg: true, description: "Basmati rice tempered with cumin & ghee" },
    ],
  },
  {
    name: "Desserts", sortOrder: 7,
    items: [
      { name: "Gulab Jamun", price: 120, isVeg: true, description: "Soft milk dumplings in rose-flavoured sugar syrup" },
      { name: "Gajar Ka Halwa", price: 150, isVeg: true, description: "Slow-cooked carrot pudding with ghee & dry fruits" },
      { name: "Kheer", price: 130, isVeg: true, description: "Creamy rice pudding with cardamom & pistachios" },
      {
        name: "Kulfi", price: 140, isVeg: true, description: "Traditional Indian ice cream",
        variants: [{ name: "Malai", price: 140 }, { name: "Pista", price: 150 }, { name: "Mango", price: 150 }],
      },
    ],
  },
  {
    name: "Beverages", sortOrder: 8,
    items: [
      {
        name: "Lassi", price: 120, isVeg: true, description: "Chilled yogurt drink",
        variants: [{ name: "Sweet", price: 120 }, { name: "Salted", price: 110 }, { name: "Mango", price: 140 }],
      },
      { name: "Masala Chai", price: 60, isVeg: true, description: "Spiced Indian tea with ginger & cardamom" },
      { name: "Filter Coffee", price: 70, isVeg: true, description: "South Indian filter coffee with frothy milk" },
      { name: "Mango Lassi", price: 140, isVeg: true, description: "Thick mango & yogurt smoothie" },
      { name: "Fresh Lime Soda", price: 80, isVeg: true, description: "Fresh lime with soda — sweet or salted" },
      { name: "Cold Coffee", price: 120, isVeg: true, description: "Chilled coffee blended with milk & ice cream" },
      {
        name: "Soft Drinks", price: 60, isVeg: true, description: "Coke / Pepsi / Sprite / Limca",
        variants: [{ name: "Coke", price: 60 }, { name: "Pepsi", price: 60 }, { name: "Sprite", price: 60 }],
      },
      { name: "Mineral Water", price: 30, isVeg: true, description: "500ml chilled mineral water" },
    ],
  },
];

const inventoryItems = [
  { name: "Chicken", unit: "kg", quantity: 25, minQuantity: 5, costPerUnit: 220 },
  { name: "Mutton", unit: "kg", quantity: 15, minQuantity: 3, costPerUnit: 680 },
  { name: "Paneer", unit: "kg", quantity: 10, minQuantity: 2, costPerUnit: 320 },
  { name: "Prawns", unit: "kg", quantity: 8, minQuantity: 2, costPerUnit: 480 },
  { name: "Basmati Rice", unit: "kg", quantity: 30, minQuantity: 5, costPerUnit: 90 },
  { name: "Wheat Flour", unit: "kg", quantity: 20, minQuantity: 5, costPerUnit: 45 },
  { name: "Tomatoes", unit: "kg", quantity: 12, minQuantity: 3, costPerUnit: 30 },
  { name: "Onions", unit: "kg", quantity: 15, minQuantity: 4, costPerUnit: 25 },
  { name: "Butter", unit: "kg", quantity: 5, minQuantity: 1, costPerUnit: 480 },
  { name: "Fresh Cream", unit: "L", quantity: 4, minQuantity: 1, costPerUnit: 220 },
  { name: "Cooking Oil", unit: "L", quantity: 15, minQuantity: 3, costPerUnit: 140 },
  { name: "Cashews", unit: "kg", quantity: 2, minQuantity: 0.5, costPerUnit: 900 },
  { name: "Mineral Water (500ml)", unit: "pcs", quantity: 3, minQuantity: 12, costPerUnit: 12 }, // intentionally low for alert demo
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({ orderBy: { createdAt: "desc" } });
  if (!restaurant) throw new Error("No restaurant found. Run /setup first.");
  const rid = restaurant.id;
  console.log(`Seeding: ${restaurant.name}\n`);

  // Clear existing
  await prisma.payment.deleteMany({ where: { order: { restaurantId: rid } } });
  await prisma.orderItem.deleteMany({ where: { order: { restaurantId: rid } } });
  await prisma.order.deleteMany({ where: { restaurantId: rid } });
  await prisma.variant.deleteMany({ where: { menuItem: { restaurantId: rid } } });
  await prisma.menuItem.deleteMany({ where: { restaurantId: rid } });
  await prisma.category.deleteMany({ where: { restaurantId: rid } });
  await prisma.inventoryItem.deleteMany({ where: { restaurantId: rid } });

  // Menu
  for (const cat of menuData) {
    const created = await prisma.category.create({
      data: { name: cat.name, sortOrder: cat.sortOrder, restaurantId: rid },
    });
    for (const item of cat.items) {
      const mi = await prisma.menuItem.create({
        data: { name: item.name, price: item.price, description: item.description, isVeg: item.isVeg, categoryId: created.id, restaurantId: rid },
      });
      if ((item as any).variants) {
        for (const v of (item as any).variants) {
          await prisma.variant.create({ data: { name: v.name, price: v.price, menuItemId: mi.id } });
        }
      }
    }
    console.log(`✓ ${cat.name}`);
  }

  // Inventory
  for (const inv of inventoryItems) {
    await prisma.inventoryItem.create({ data: { ...inv, restaurantId: rid } });
  }
  console.log(`✓ Inventory (${inventoryItems.length} items)`);

  console.log("\nDone! Go test it at http://localhost:3000");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
