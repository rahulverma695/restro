import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Expected CSV format:
// name,category,description,price,type
// Paneer Tikka,Starters,Marinated cottage cheese,280,veg
// Chicken Tikka,Starters,Tandoor grilled chicken,320,non-veg

export async function POST(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header row and at least one item" }, { status: 400 });

  // Skip header
  const rows = lines.slice(1);

  // Get or create categories
  const categoryCache: Record<string, string> = {};
  async function getCategoryId(name: string): Promise<string> {
    const key = name.trim().toLowerCase();
    if (categoryCache[key]) return categoryCache[key];
    let cat = await prisma.category.findFirst({ where: { restaurantId, name: { equals: name.trim() } } });
    if (!cat) {
      const count = await prisma.category.count({ where: { restaurantId } });
      cat = await prisma.category.create({ data: { name: name.trim(), sortOrder: count + 1, restaurantId } });
    }
    categoryCache[key] = cat.id;
    return cat.id;
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const line = rows[i];
    // Handle quoted CSV fields
    const cols = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((c) => c.replace(/^"|"$/g, "").trim()) || [];

    if (cols.length < 4) {
      results.errors.push(`Row ${i + 2}: not enough columns (got ${cols.length}, need at least 4)`);
      results.skipped++;
      continue;
    }

    const [name, category, description, priceStr, typeStr] = cols;
    const price = parseFloat(priceStr);

    if (!name || !category) {
      results.errors.push(`Row ${i + 2}: name and category are required`);
      results.skipped++;
      continue;
    }
    if (isNaN(price) || price <= 0) {
      results.errors.push(`Row ${i + 2}: invalid price "${priceStr}"`);
      results.skipped++;
      continue;
    }

    const isVeg = !typeStr || typeStr.toLowerCase() !== "non-veg";

    try {
      const categoryId = await getCategoryId(category);
      await prisma.menuItem.create({
        data: { name, price, description: description || null, isVeg, categoryId, restaurantId },
      });
      results.created++;
    } catch {
      results.errors.push(`Row ${i + 2}: failed to create "${name}"`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
