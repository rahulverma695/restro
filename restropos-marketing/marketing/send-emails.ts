import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL || "noreply@yourdomain.com";
const SUBJECT = "Own your restaurant's billing tech for life (No subscriptions)";

// ── Load HTML template ────────────────────────────────────────────────────────
const templatePath = path.join(__dirname, "cold-email.html");
const template = fs.readFileSync(templatePath, "utf-8");

// ── Load leads from CSV ───────────────────────────────────────────────────────
// CSV format: first_name,email  (header row required)
// Example:
//   first_name,email
//   Rahul,rahul@spicegarden.com
//   Priya,priya@dosacafe.com

function loadLeads(csvPath: string): { first_name: string; email: string }[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const nameIdx  = headers.indexOf("first_name");
  const emailIdx = headers.indexOf("email");

  if (nameIdx === -1 || emailIdx === -1) {
    throw new Error("CSV must have 'first_name' and 'email' columns");
  }

  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    return { first_name: cols[nameIdx] || "there", email: cols[emailIdx] };
  }).filter(l => l.email.includes("@"));
}

function buildEmail(firstName: string): string {
  return template.replace(/\{\{first_name\}\}/g, firstName);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx marketing/send-emails.ts leads.csv");
    process.exit(1);
  }

  const leads = loadLeads(csvPath);
  console.log(`\nLoaded ${leads.length} leads from ${csvPath}\n`);
  console.log(`From:    ${FROM}`);
  console.log(`Subject: ${SUBJECT}\n`);
  console.log("─".repeat(50));

  const pdfPath = path.resolve(__dirname, "../../RestroPOS Pitch Deck & Brochure.pdf");
  const attachments = fs.existsSync(pdfPath)
    ? [{ filename: "RestroPOS Pitch Deck & Brochure.pdf", content: fs.readFileSync(pdfPath) }]
    : [];

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: lead.email,
        subject: SUBJECT,
        html: buildEmail(lead.first_name),
        attachments,
      });

      if (error) {
        console.log(`✗ ${lead.email} — ${error.message}`);
        failed++;
      } else {
        console.log(`✓ ${lead.email} (${lead.first_name})`);
        sent++;
      }
    } catch (err: any) {
      console.log(`✗ ${lead.email} — ${err.message}`);
      failed++;
    }

    // Rate limit: Resend allows 2 req/sec on free, 10/sec on paid
    // 500ms gap = safe for both
    await sleep(500);
  }

  console.log("─".repeat(50));
  console.log(`\nDone. Sent: ${sent} · Failed: ${failed} · Total: ${leads.length}`);
}

main().catch(console.error);
