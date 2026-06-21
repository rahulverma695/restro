import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const { allowed, retryAfter } = await checkRateLimit(getClientIp(req), 5, "1 m");
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  const parsed = ForgotPasswordSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.passwordReset.deleteMany({ where: { email } });
  await prisma.passwordReset.create({ data: { email, otp, expiresAt } });

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: "Reset your RestroPOS password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #f97316; border-radius: 12px; padding: 12px 20px;">
            <span style="color: white; font-size: 20px; font-weight: bold;">RestroPOS</span>
          </div>
        </div>
        <h2 style="color: #111827;">Reset your password</h2>
        <p style="color: #6b7280;">Use the code below to reset your password. It expires in 10 minutes.</p>
        <div style="background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #9a3412; font-size: 13px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Reset Code</p>
          <p style="color: #ea580c; font-size: 40px; font-weight: 800; letter-spacing: 0.2em; margin: 0;">${otp}</p>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
