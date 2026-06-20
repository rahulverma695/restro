import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// Define interface for leads
interface Lead {
  first_name: string;
  email: string;
  business_name: string;
  phone: string;
  website: string;
  reviews: string;
  rating: string;
  source_url: string;
  notes: string;
}

// Rate limiter / sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to escape CSV values
function escapeCSV(val: string): string {
  if (!val) return "";
  const cleaned = val.replace(/\r?\n|\r/g, " ").replace(/"/g, '""');
  return `"${cleaned}"`;
}

// ── REDDIT INTENT SCRAPER ───────────────────────────────────────────────────
async function fetchRedditLeads() {
  console.log("\n[1/2] Starting Reddit Intent Scraper...");
  
  // Search queries targeting people looking for POS systems or alternatives
  const queries = [
    "POS alternative",
    "Toast POS alternative",
    "Square POS alternative",
    "Petpooja alternative",
    "best restaurant POS",
    "looking for POS",
    "POS recommendation"
  ];

  const leads: Lead[] = [];
  const processedUrls = new Set<string>();

  let playwrightChromium;
  try {
    playwrightChromium = require("playwright").chromium;
  } catch (e) {
    console.error("Playwright not found, falling back to direct fetch (might be blocked by Cloudflare)...");
  }

  let browser: any = null;
  let page: any = null;

  if (playwrightChromium) {
    try {
      browser = await playwrightChromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      });
      page = await context.newPage();
    } catch (err: any) {
      console.error("Could not launch Playwright browser for Reddit. Falling back to direct fetch. Error:", err.message);
    }
  }

  for (const query of queries) {
    console.log(`Searching Reddit for: "${query}"...`);
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=25`;
      let json: any = null;

      if (page) {
        await page.goto(url);
        const text = await page.locator("body").innerText();
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error(`Failed to parse Reddit JSON for "${query}". Text size: ${text.length}`);
        }
      } else {
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };
        const response = await fetch(url, { headers });
        if (response.ok) {
          json = await response.json();
        } else {
          console.error(`Reddit search failed: Status ${response.status}`);
        }
      }

      const posts = json?.data?.children || [];

      for (const post of posts) {
        const data = post.data;
        if (!data || data.over_18 || processedUrls.has(data.permalink)) {
          continue;
        }

        processedUrls.add(data.permalink);

        // Filter for subreddits relevant to business owners
        const sub = data.subreddit.toLowerCase();
        const relevantSubs = ["restaurantowners", "cafe", "smallbusiness", "pos", "restaurateurs", "startups", "entrepreneur"];
        const isRelevantSub = relevantSubs.some(s => sub.includes(s));
        
        // Also check if text contains POS terms to reduce noise
        const textToSearch = `${data.title} ${data.selftext}`.toLowerCase();
        const hasIntent = textToSearch.includes("pos") || textToSearch.includes("billing") || textToSearch.includes("toast") || textToSearch.includes("square") || textToSearch.includes("petpooja");

        if (isRelevantSub || hasIntent) {
          leads.push({
            first_name: data.author, // Reddit username
            email: "", // Needs direct message outreach on Reddit or manual profile lookup
            business_name: `Reddit User: u/${data.author}`,
            phone: "",
            website: "",
            reviews: "N/A",
            rating: "N/A",
            source_url: `https://reddit.com${data.permalink}`,
            notes: `Subreddit: r/${data.subreddit} | Title: ${data.title.substring(0, 100)}... | Post: ${data.selftext.substring(0, 150)}...`
          });
        }
      }
      
      // Sleep to respect Reddit API rate limits
      await sleep(1500);
    } catch (error: any) {
      console.error(`Error searching Reddit for "${query}":`, error.message);
    }
  }

  if (browser) {
    await browser.close();
  }

  // Save Reddit leads to CSV
  if (leads.length > 0) {
    const csvPath = path.join(__dirname, "reddit_intent_leads.csv");
    const headerRow = "first_name,email,business_name,phone,website,reviews,rating,source_url,notes\n";
    const rows = leads.map(l => 
      `${escapeCSV(l.first_name)},${escapeCSV(l.email)},${escapeCSV(l.business_name)},${escapeCSV(l.phone)},${escapeCSV(l.website)},${escapeCSV(l.reviews)},${escapeCSV(l.rating)},${escapeCSV(l.source_url)},${escapeCSV(l.notes)}`
    ).join("\n");

    fs.writeFileSync(csvPath, headerRow + rows, "utf-8");
    console.log(`✓ Saved ${leads.length} Reddit intent leads to: ${csvPath}`);
    if (leads.length > 0) {
      console.log(`Tip: These are direct discussions by business owners. Open the 'source_url' to send a message u/${leads[0].first_name}!`);
    }
  } else {
    console.log("No Reddit leads found matching the filters.");
  }
}

// ── EMAIL HARVESTER FROM WEBSITES ──────────────────────────────────────────
async function harvestEmailFromWebsite(url: string): Promise<string> {
  if (!url || url.includes("facebook.com") || url.includes("instagram.com") || url.includes("youtube.com")) {
    return "";
  }

  // Format URL correctly
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `http://${targetUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout to keep script fast

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) return "";

    const html = await res.text();
    
    // Regular expression to find email addresses
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/gi;
    const matches = html.match(emailRegex);

    if (matches) {
      // Clean and filter common false positives or image links
      const validEmails = matches
        .map(e => e.toLowerCase())
        .filter(e => {
          const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e);
          const isJunk = e.includes("sentry") || e.includes("wixpress") || e.includes("bootstrap") || e.includes("wp.com") || e.includes("example.com") || e.includes("domain.com");
          return !isImage && !isJunk;
        });
      
      if (validEmails.length > 0) {
        // Return unique first match
        return [...new Set(validEmails)][0];
      }
    }
  } catch (err: any) {
    // Fail silently to prevent interrupting scraping loop
  }

  return "";
}

// ── GOOGLE MAPS SCRAPER (via PLAYWRIGHT) ──────────────────────────────────────
async function scrapeGoogleMapsLeads(query: string, limit: number = 20) {
  console.log(`\n[2/2] Starting Google Maps Scraper for query: "${query}" (Limit: ${limit})...`);
  
  let playwrightChromium;
  try {
    playwrightChromium = require("playwright").chromium;
  } catch (e) {
    console.error("\n[Playwright Error] Playwright is not available or browsers are not installed.");
    console.error("Please run the following command in terminal to set it up:");
    console.error("  npx playwright install chromium");
    return;
  }

  console.log("Launching browser in background...");
  const browser = await playwrightChromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();

  // Search URL on Google Maps
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  await page.goto(searchUrl);
  
  console.log("Waiting for search results page to load...");
  try {
    // Wait for the feed list element or a listing anchor
    await page.waitForSelector('a[href*="/maps/place/"]', { timeout: 10000 });
  } catch (err) {
    console.error("Timeout waiting for Google Maps listings. Maybe the query returned no results, or Google blocked the requests.");
    await browser.close();
    return;
  }

  console.log("Scrolling sidebar to load listings...");
  
  // Locate the scrollable sidebar container.
  // Google Maps uses an element with role="feed" for the sidebar.
  const sidebarSelector = 'div[role="feed"]';
  const sidebar = await page.$(sidebarSelector);
  
  if (sidebar) {
    let prevHeight = 0;
    let currentHeight = await page.evaluate((el) => el.scrollHeight, sidebar);
    let scrollAttempts = 0;
    
    // Scroll a few times to load more listings
    while (scrollAttempts < 15) {
      // Get current list of loaded anchors
      const listingCount = (await page.$$('a[href*="/maps/place/"]')).length;
      if (listingCount >= limit) {
        console.log(`Loaded ${listingCount} listing links. Stopping scroll.`);
        break;
      }

      await page.evaluate((el) => {
        el.scrollTo(0, el.scrollHeight);
      }, sidebar);
      
      await sleep(1500); // Wait for lazy load
      
      prevHeight = currentHeight;
      currentHeight = await page.evaluate((el) => el.scrollHeight, sidebar);
      
      if (prevHeight === currentHeight) {
        scrollAttempts++;
      } else {
        scrollAttempts = 0; // reset if height changed
      }
    }
  }

  // Get all listing elements
  const listingElements = await page.$$('a[href*="/maps/place/"]');
  console.log(`Found ${listingElements.length} listings in search results. Extracting details...`);

  const rawLeads: { name: string; url: string }[] = [];
  
  // Extract names and URLs first to avoid DOM detachment during navigation clicks
  for (const element of listingElements.slice(0, limit)) {
    try {
      const name = await element.getAttribute("aria-label");
      const url = await element.getAttribute("href");
      if (name && url) {
        rawLeads.push({ name, url });
      }
    } catch (err) {
      // listing got detached, skip
    }
  }

  const leads: Lead[] = [];

  for (let i = 0; i < rawLeads.length; i++) {
    const item = rawLeads[i];
    console.log(`[${i + 1}/${rawLeads.length}] Processing: ${item.name}...`);
    
    try {
      // Navigate/Click detail of the item by loading its direct URL
      await page.goto(item.url);
      // Wait for the main detail container
      await page.waitForSelector('h1', { timeout: 8000 });
      await sleep(1000); // Let values render

      // 1. Extract phone number
      let phone = "";
      try {
        const phoneEl = await page.$('button[data-item-id^="phone:tel:"]');
        if (phoneEl) {
          phone = (await phoneEl.getAttribute("data-item-id"))?.replace("phone:tel:", "").trim() || "";
        } else {
          // Alternative fallback selector
          const phoneText = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const phoneBtn = btns.find(b => b.getAttribute('data-item-id')?.startsWith('phone:tel:'));
            return phoneBtn ? phoneBtn.textContent?.trim() : "";
          });
          phone = phoneText || "";
        }
      } catch (e) {}

      // 2. Extract website
      let website = "";
      try {
        const webEl = await page.$('a[data-item-id="authority"]');
        if (webEl) {
          website = (await webEl.getAttribute("href")) || "";
        } else {
          // Alternative selector search
          const webUrl = await page.evaluate(() => {
            const anchor = document.querySelector('a[data-item-id="authority"]');
            return anchor ? anchor.getAttribute('href') : "";
          });
          website = webUrl || "";
        }
      } catch (e) {}

      // 3. Extract Rating and Review Count
      let rating = "0.0";
      let reviews = "0";
      try {
        const ratingText = await page.evaluate(() => {
          // Google Maps ratings usually sit inside a span next to reviews or inside aria-label of reviews
          const reviewBtn = document.querySelector('button[jsaction="pane.rating.moreReviews"]');
          if (reviewBtn) {
            const text = reviewBtn.getAttribute("aria-label") || ""; // e.g. "4.3 stars 125 reviews"
            const starsMatch = text.match(/([\d.]+)\s*stars?/i);
            const countMatch = text.match(/([\d,]+)\s*reviews?/i);
            return {
              rating: starsMatch ? starsMatch[1] : "",
              reviews: countMatch ? countMatch[1].replace(/,/g, "") : ""
            };
          }
          return null;
        });

        if (ratingText) {
          rating = ratingText.rating || "0.0";
          reviews = ratingText.reviews || "0";
        }
      } catch (e) {}

      // 4. Crawl website for email if website exists!
      let email = "";
      if (website && website !== "") {
        console.log(`   └─ Crawling website for email: ${website}...`);
        email = await harvestEmailFromWebsite(website);
        if (email) {
          console.log(`   └─ ✓ Email found: ${email}`);
        } else {
          console.log(`   └─ ✗ No email found on website homepage.`);
        }
      }

      // Add to leads list
      leads.push({
        first_name: "Owner", // default first name for cold outreach
        email: email,
        business_name: item.name,
        phone: phone,
        website: website,
        reviews: reviews,
        rating: rating,
        source_url: item.url,
        notes: `Google Maps Scraped | Rating: ${rating} (${reviews} reviews) | Phone: ${phone}`
      });

    } catch (err: any) {
      console.error(`Error loading details for ${item.name}:`, err.message);
    }
  }

  await browser.close();

  // Save GMaps leads to CSV
  if (leads.length > 0) {
    // Generate filename based on query
    const safeQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const csvPath = path.join(__dirname, `gmaps_${safeQuery}.csv`);
    
    const headerRow = "first_name,email,business_name,phone,website,reviews,rating,source_url,notes\n";
    const rows = leads.map(l => 
      `${escapeCSV(l.first_name)},${escapeCSV(l.email)},${escapeCSV(l.business_name)},${escapeCSV(l.phone)},${escapeCSV(l.website)},${escapeCSV(l.reviews)},${escapeCSV(l.rating)},${escapeCSV(l.source_url)},${escapeCSV(l.notes)}`
    ).join("\n");

    fs.writeFileSync(csvPath, headerRow + rows, "utf-8");
    console.log(`\n✓ Saved ${leads.length} Google Maps leads to: ${csvPath}`);
    
    // Output stats
    const leadsWithEmail = leads.filter(l => l.email !== "").length;
    console.log(`Statistics:`);
    console.log(`· Total Scraped: ${leads.length}`);
    console.log(`· Leads with emails (ready for cold outreach): ${leadsWithEmail}`);
    console.log(`· Leads with phone numbers (ready for cold calling/WhatsApp): ${leads.filter(l => l.phone !== "").length}`);
  } else {
    console.log("No leads were successfully scraped from Google Maps.");
  }
}

// ── MAIN EXECUTION ──────────────────────────────────────────────────────────
async function main() {
  const mode = process.argv[2];
  
  if (mode === "reddit") {
    await fetchRedditLeads();
  } else if (mode === "gmaps") {
    const query = process.argv[3] || "cafes in Bangalore";
    const limit = parseInt(process.argv[4] || "15", 10);
    await scrapeGoogleMapsLeads(query, limit);
  } else {
    console.log("RestroPOS Lead Generation Automation Tool");
    console.log("=".repeat(50));
    console.log("Usage:");
    console.log("  npx tsx marketing/find-leads.ts reddit");
    console.log("    Scrapes Reddit for active posts of business owners looking for POS recommendation.\n");
    console.log("  npx tsx marketing/find-leads.ts gmaps [query] [limit]");
    console.log("    Scrapes Google Maps and harvests contact emails from business homepages.");
    console.log("    Example: npx tsx marketing/find-leads.ts gmaps \"restaurants in Hebbal\" 15");
    console.log("=".repeat(50));
  }
}

main().catch(console.error);
