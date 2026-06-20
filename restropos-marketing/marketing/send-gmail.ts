import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────────
const SUBJECT = "Own your restaurant's billing tech for life (No subscriptions)";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("\n[Error] GMAIL_USER and GMAIL_PASS must be configured in your .env file.");
  console.error("Please add the following variables to your restropos/.env file:");
  console.error('GMAIL_USER="your-email@gmail.com"');
  console.error('GMAIL_PASS="xxxx xxxx xxxx xxxx" (Google 16-character App Password)\n');
  process.exit(1);
}

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS.replace(/\s+/g, ""), // strip spaces if user copied it with spaces
  },
});

// ── Load HTML template ────────────────────────────────────────────────────────
const templatePath = path.join(__dirname, "cold-email.html");
if (!fs.existsSync(templatePath)) {
  console.error(`[Error] HTML template file not found at ${templatePath}`);
  process.exit(1);
}
const template = fs.readFileSync(templatePath, "utf-8");

// ── Load leads from CSV ───────────────────────────────────────────────────────
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
  }).filter(l => l.email && l.email.includes("@"));
}

function buildEmail(firstName: string): string {
  return template.replace(/\{\{first_name\}\}/g, firstName);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const arg = process.argv[2];
  
  if (!arg) {
    console.error("Usage:");
    console.error("  npx tsx marketing/send-gmail.ts --test          # Sends a test email to yourself");
    console.error("  npx tsx marketing/send-gmail.ts leads.csv       # Sends outreach to all CSV contacts");
    process.exit(1);
  }

  const pdfPath = path.resolve(__dirname, "../../RestroPOS Pitch Deck & Brochure.pdf");
  const attachments = fs.existsSync(pdfPath)
    ? [{ filename: "RestroPOS Pitch Deck & Brochure.pdf", path: pdfPath }]
    : [];

  if (arg === "--test") {
    console.log(`\n--- Running SMTP Connection Test ---`);
    console.log(`Sending test email to: ${GMAIL_USER}`);
    console.log(`From:                  ${GMAIL_USER}`);
    console.log(`Subject:               ${SUBJECT} [TEST]`);
    console.log(`PDF Attached:          ${attachments.length > 0 ? "Yes" : "No"}`);
    console.log("─".repeat(50));

    try {
      await transporter.sendMail({
        from: `RestroPOS <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `${SUBJECT} [TEST]`,
        html: buildEmail("Outreach Test"),
        attachments,
      });
      console.log(`✓ Test Email Sent Successfully! Check your inbox/spam folder.`);
    } catch (err: any) {
      console.error(`✗ Test Email Failed:`, err.message);
    }
    process.exit(0);
  }

  const leads = loadLeads(arg);
  console.log(`\nLoaded ${leads.length} leads from ${arg}\n`);
  console.log(`From:    ${GMAIL_USER}`);
  console.log(`Subject: ${SUBJECT}\n`);
  console.log("─".repeat(50));

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      await transporter.sendMail({
        from: `RestroPOS <${GMAIL_USER}>`,
        to: lead.email,
        subject: SUBJECT,
        html: buildEmail(lead.first_name),
        attachments,
      });

      console.log(`✓ ${lead.email} (${lead.first_name})`);
      sent++;
    } catch (err: any) {
      console.log(`✗ ${lead.email} — ${err.message}`);
      failed++;
    }

    // Rate limit: Personal Gmail has limits. Sleep 2.5 seconds between emails to be safe.
    await sleep(2500);
  }

  console.log("─".repeat(50));
  console.log(`\nDone. Sent: ${sent} · Failed: ${failed} · Total: ${leads.length}`);
}

main().catch(console.error);
