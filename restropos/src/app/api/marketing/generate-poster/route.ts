import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

function getClient() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  // Use @google/genai in Vertex AI mode
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    googleAuthOptions: { credentials: creds },
  } as any);
}

function buildPrompt(params: {
  dishName: string; offerText: string; price?: string; originalPrice?: string;
  restaurantName: string; address?: string; tagline?: string;
  brandColor: string; format: string;
}) {
  const { dishName, offerText, price, originalPrice, restaurantName, address, tagline, brandColor, format } = params;
  const formatDesc = format === "story" ? "vertical 9:16 Instagram Story" : format === "banner" ? "horizontal 16:9 banner" : "square 1:1 Instagram post";
  return `Create a professional, high-quality restaurant marketing poster for Instagram.

FORMAT: ${formatDesc}
STYLE: Modern, premium, appetizing — similar to top Indian restaurant brands
BRAND COLOR: ${brandColor} — use as primary accent for text overlays, badges, borders

CONTENT (render all text clearly and legibly):
- Dish name: "${dishName}" — large, bold, prominent headline
- Offer: "${offerText}" — eye-catching badge or banner
${price ? `- Price: ${price}${originalPrice ? ` (was ${originalPrice})` : ""} — prominent colored badge` : ""}
- Restaurant: "${restaurantName}" — bottom of poster
${address ? `- Address: "${address}" — small text at bottom` : ""}
${tagline ? `- Tagline: "${tagline}" — small italic near restaurant name` : ""}

VISUAL: Dark/gradient overlay on food area for text readability, subtle texture, thin colored border using brand color. Mix serif headline with sans-serif details. Professional graphic design quality.`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const mode = formData.get("mode") as "photo" | "ai";
  const dishName = formData.get("dishName") as string;
  const offerText = formData.get("offerText") as string;
  const price = formData.get("price") as string;
  const originalPrice = formData.get("originalPrice") as string;
  const format = (formData.get("format") as string) || "square";
  const foodPhoto = formData.get("foodPhoto") as File | null;

  if (!dishName || !offerText) return NextResponse.json({ error: "Dish name and offer text required" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const promptText = buildPrompt({
    dishName, offerText,
    price: price || undefined, originalPrice: originalPrice || undefined,
    restaurantName: restaurant.name, address: restaurant.address || undefined,
    tagline: restaurant.tagline || undefined,
    brandColor: restaurant.brandColor || "#f97316", format,
  });

  try {
    const ai = getClient();
    const contents: any[] = [];

    if (mode === "photo" && foodPhoto) {
      const bytes = await foodPhoto.arrayBuffer();
      const b64 = Buffer.from(bytes).toString("base64");
      contents.push({ inlineData: { mimeType: foodPhoto.type || "image/jpeg", data: b64 } });
      contents.push({ text: `Using this food photo as the hero image, ${promptText}\n\nGenerate a complete marketing poster image.` });
    } else {
      contents.push({ text: `${promptText}\n\nAlso generate a stunning, photorealistic image of "${dishName}" — professional food photography, beautiful plating, warm restaurant lighting. Combine the food image with the poster design into one final image.` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: { responseModalities: ["IMAGE", "TEXT"] } as any,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    for (const part of parts as any[]) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageBase64) return NextResponse.json({ error: "No image generated. Try again." }, { status: 500 });
    return NextResponse.json({ image: imageBase64, mimeType });
  } catch (err: any) {
    console.error("Vertex error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Generation failed" }, { status: 500 });
  }
}
