import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function getClient() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    googleAuthOptions: { credentials: creds },
  } as any);
}

export async function POST(req: NextRequest) {
  const { allowed, retryAfter } = await checkRateLimit(getClientIp(req), 20, "1 m");
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, history } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, address: true, brandColor: true, tagline: true },
  });

  const systemContext = `You are a creative marketing assistant for ${restaurant?.name}, an Indian restaurant.
Brand color: ${restaurant?.brandColor || "#f97316"}
${restaurant?.tagline ? `Tagline: ${restaurant.tagline}` : ""}
${restaurant?.address ? `Address: ${restaurant.address}` : ""}
When asked to create a poster or image — generate it. Make it professional, high-quality, suitable for Instagram.
Always include the restaurant name "${restaurant?.name}". Use ${restaurant?.brandColor || "#f97316"} as primary accent.
For text-only questions, respond with text only.`;

  try {
    const ai = getClient();
    const contents: any[] = [];

    if (history?.length) {
      for (const msg of history) {
        contents.push({ role: msg.role, parts: msg.parts });
      }
    }

    const userText = history?.length ? message : `${systemContext}\n\nUser: ${message}`;
    contents.push({ role: "user", parts: [{ text: userText }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: { responseModalities: ["IMAGE", "TEXT"] } as any,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const result: { type: "text" | "image"; content: string; mimeType?: string }[] = [];

    for (const part of parts as any[]) {
      if (part.text) result.push({ type: "text", content: part.text });
      else if (part.inlineData?.data) result.push({ type: "image", content: part.inlineData.data, mimeType: part.inlineData.mimeType });
    }

    const modelParts = (parts as any[]).map((p: any) => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: { mimeType: p.inlineData.mimeType, data: p.inlineData.data } };
      return p;
    });

    return NextResponse.json({ result, modelParts, userParts: [{ text: userText }] });
  } catch (err: any) {
    console.error("Vertex chat error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
