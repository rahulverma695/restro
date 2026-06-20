import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = fs.readFileSync(path.join(__dirname, "cold-email.html"), "utf-8")
    .replace(/\{\{first_name\}\}/g, "Nikhil");

  const pdfPath = path.resolve(__dirname, "../../RestroPOS Pitch Deck & Brochure.pdf");
  const attachments = fs.existsSync(pdfPath)
    ? [{ filename: "RestroPOS Pitch Deck & Brochure.pdf", content: fs.readFileSync(pdfPath) }]
    : [];

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: "nikkibhaviyavar@gmail.com",
    subject: "Own your restaurant's billing tech for life (No subscriptions) [TEST]",
    html,
    attachments,
  });

  if (error) { console.error("Error:", error); process.exit(1); }
  console.log("Sent! ID:", data?.id);
}

main();
