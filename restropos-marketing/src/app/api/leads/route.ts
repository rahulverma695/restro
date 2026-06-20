import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, restaurantName, email, phone, features, totalPrice, notes, product } = body;

    if (!name || !restaurantName || !email || !phone || totalPrice === undefined) {
      return NextResponse.json({ error: "Missing required contact or pricing details" }, { status: 400 });
    }

    const featuresStr = Array.isArray(features) ? features.join(", ") : String(features || "");

    // Create the lead database record
    const lead = await prisma.lead.create({
      data: {
        name,
        restaurantName,
        email,
        phone,
        features: featuresStr,
        totalPrice: Number(totalPrice),
        notes: notes || null,
      },
    });

    const productNames: Record<string, string> = {
      restropos: "RestroPOS",
      roomkey: "RoomKey PMS",
      gymflow: "GymFlow",
      salonbook: "SalonBook"
    };
    const productName = productNames[product as string] || "Anvil Labs Custom Build";

    const productDescs: Record<string, string> = {
      restropos: "3-Click Billing, Floor Table Layout, Universal Printer Sync, CRM & Loyalty registers, Core Daily Reports & GST data compiler, and Offline DB Failover logic.",
      roomkey: "Guest Reservations, Room Layout Floor Plans, Direct Reservation Calendar, Billing & Invoicing, and Guest Check-In/Out Registers.",
      gymflow: "Member Database, Check-In Logs, Subscription Plans, Receipt Invoicing, Expired Membership Alerts, and Attendance Analytics.",
      salonbook: "Appointment Planner, Stylist Queue Layouts, Service Menu Builder, Checkout Billing, and Client CRM Visit History."
    };
    const productDesc = productDescs[product as string] || "Anvil Labs Core Package and Custom UI compilation.";

    // Send notification email using Resend
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: "nikhilbhaviyavar@gmail.com",
      subject: `New Lead [${productName}]: ${restaurantName} (₹${Number(totalPrice).toLocaleString()}/year)`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #2e251f; background-color: #faf8f5; border-radius: 16px; border: 1px solid #e5dfd3;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #e0533c; border-radius: 8px; padding: 10px 18px;">
              <span style="color: white; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">${productName}</span>
            </div>
            <p style="color: #8c7f70; font-size: 13px; margin-top: 8px; font-weight: 500;">Managed Subscription Request Captured</p>
          </div>

          <h2 style="color: #2e251f; font-size: 20px; font-weight: 800; border-bottom: 2px solid #e5dfd3; padding-bottom: 12px; margin-bottom: 20px;">
            Lead Details
          </h2>

          <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #ede8df; box-shadow: 0 4px 6px rgba(0,0,0,0.015);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #8c7f70; font-size: 14px; width: 35%; font-weight: 600;">Business Name</td>
                <td style="padding: 8px 0; color: #2e251f; font-size: 14px; font-weight: 700;">${restaurantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8c7f70; font-size: 14px; font-weight: 600;">Contact Name</td>
                <td style="padding: 8px 0; color: #2e251f; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8c7f70; font-size: 14px; font-weight: 600;">Email Address</td>
                <td style="padding: 8px 0; color: #2e251f; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #e0533c; text-decoration: none; font-weight: 600;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8c7f70; font-size: 14px; font-weight: 600;">Phone Number</td>
                <td style="padding: 8px 0; color: #2e251f; font-size: 14px; font-weight: 700;">${phone}</td>
              </tr>
            </table>
          </div>

          <h2 style="color: #2e251f; font-size: 20px; font-weight: 800; border-bottom: 2px solid #e5dfd3; padding-bottom: 12px; margin-bottom: 20px;">
            Configuration &amp; Pricing
          </h2>

          <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #ede8df; box-shadow: 0 4px 6px rgba(0,0,0,0.015);">
            <div style="margin-bottom: 16px;">
              <span style="font-size: 13px; color: #8c7f70; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Base Package (${productName})</span>
              <div style="background: #faf8f5; border-radius: 8px; padding: 10px 14px; border: 1px solid #f0ede6; font-size: 13px; line-height: 1.5; color: #6b5c4f;">
                ${productDesc}
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <span style="font-size: 13px; color: #8c7f70; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Selected Add-ons</span>
              ${
                Array.isArray(features) && features.length > 0
                  ? `<div style="display: flex; flex-direction: column; gap: 6px;">
                      ${features
                        .map(
                          (feat) => {
                            return `
                              <div style="background: #fff5f3; border: 1px solid #fcd2cb; border-radius: 6px; padding: 8px 12px; font-size: 13.5px; font-weight: 600; color: #b83321; display: flex; justify-content: space-between;">
                                <span>${feat}</span>
                                <span style="color: #8c7f70; font-weight: 500; font-size: 12px;">Included</span>
                              </div>
                            `;
                          }
                        )
                        .join("")}
                    </div>`
                  : `<div style="color: #8c7f70; font-size: 13px; font-style: italic;">No features selected. Base package only.</div>`
              }
            </div>

            <div style="background: #fff7ed; border: 2px dashed #fed7aa; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 11px; color: #c2410c; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Annual Subscription</span>
                <span style="font-size: 24px; font-weight: 800; color: #ea580c;">₹${Number(totalPrice).toLocaleString()}/year</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11px; color: #8c7f70; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Post-Sales Support</span>
                <span style="font-size: 14px; font-weight: 700; color: #2e251f;">Included</span>
              </div>
            </div>
          </div>

          ${
            notes
              ? `
            <h2 style="color: #2e251f; font-size: 20px; font-weight: 800; border-bottom: 2px solid #e5dfd3; padding-bottom: 12px; margin-bottom: 20px;">
              Special Requests / Custom Notes
            </h2>
            <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #ede8df; font-size: 14px; line-height: 1.6; color: #2e251f; white-space: pre-wrap; box-shadow: 0 4px 6px rgba(0,0,0,0.015);">
              ${notes}
            </div>
            `
              : ""
          }

          <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e5dfd3; padding-top: 24px;">
            <p style="color: #8c7f70; font-size: 12px; margin: 0;">
              This record has been logged under Lead ID: <strong style="color: #2e251f;">${lead.id}</strong> in the PostgreSQL database.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error sending lead alert:", error);
      return NextResponse.json({ error: "Saved to database, but notification email delivery failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("Failed to process lead:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
