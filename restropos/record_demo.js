const { chromium } = require('playwright');
const path = require('path');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to show spotlight on a target element and display a lower-third marketing tagline HUD
async function showSpotlight(page, selector, title, subtitle) {
  console.log(`Spotlight: "${title}" on "${selector}"`);
  await page.evaluate(({ sel, t, sub }) => {
    // Remove old overlays
    const oldSpot = document.getElementById('demo-spotlight');
    if (oldSpot) oldSpot.remove();
    const oldHud = document.getElementById('demo-hud');
    if (oldHud) oldHud.remove();
    
    // Find target using custom resolver that supports Playwright's :has-text() pseudo-selector
    const el = (() => {
      let s = sel.trim();
      if (s.endsWith(';')) s = s.slice(0, -1).trim();
      
      let getFirst = false;
      if (s.endsWith('.first()') || s.endsWith('.first')) {
        getFirst = true;
        s = s.replace(/\.first\(\)$|\.first$/, '').trim();
      }
      
      const hasText = (elem, txt) => elem.textContent && elem.textContent.includes(txt);
      
      if (s.includes(':has-text(')) {
        const parts = s.split(':has-text(');
        const cssSel = parts[0].trim();
        const textVal = parts[1].replace(/^['"\s]+|['"\s\)]+$/g, '').trim(); // clean quotes and closing parens
        
        const candidates = Array.from(document.querySelectorAll(cssSel || 'button, a, p, span, div, h1, h2, h3'));
        const matched = candidates.filter(c => hasText(c, textVal));
        return getFirst ? matched[0] : matched[0] || document.querySelector(cssSel);
      }
      
      const nodes = document.querySelectorAll(s);
      return getFirst ? nodes[0] : nodes[0];
    })();

    if (!el) {
      console.warn('Spotlight element not found:', sel);
      return;
    }
    
    // Scroll element into view smoothly if needed
    if (el.scrollIntoViewIfNeeded) {
      el.scrollIntoViewIfNeeded();
    } else {
      el.scrollIntoView({ block: 'center' });
    }
    
    const rect = el.getBoundingClientRect();
    
    // Create spotlight overlay with shadow masking
    const spot = document.createElement('div');
    spot.id = 'demo-spotlight';
    spot.style.position = 'fixed';
    spot.style.left = `${rect.left - 8}px`;
    spot.style.top = `${rect.top - 8}px`;
    spot.style.width = `${rect.width + 16}px`;
    spot.style.height = `${rect.height + 16}px`;
    spot.style.borderRadius = '10px';
    spot.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 25px rgba(249, 115, 22, 0.7)'; // Mask background and glow
    spot.style.border = '2px dashed rgba(249, 115, 22, 0.85)';
    spot.style.pointerEvents = 'none';
    spot.style.zIndex = '999990';
    spot.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    spot.style.opacity = '0';
    document.body.appendChild(spot);

    // Create glassmorphic lower-third tagline panel
    const hud = document.createElement('div');
    hud.id = 'demo-hud';
    hud.style.position = 'fixed';
    hud.style.bottom = '32px';
    hud.style.left = '50%';
    hud.style.transform = 'translateX(-50%) translateY(30px)';
    hud.style.background = 'rgba(10, 10, 10, 0.85)';
    hud.style.backdropFilter = 'blur(16px)';
    hud.style.webkitBackdropFilter = 'blur(16px)';
    hud.style.border = '1px solid rgba(255, 255, 255, 0.12)';
    hud.style.borderRadius = '16px';
    hud.style.padding = '14px 28px';
    hud.style.zIndex = '999995';
    hud.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)';
    hud.style.textAlign = 'center';
    hud.style.minWidth = '520px';
    hud.style.maxWidth = '85%';
    hud.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    hud.style.opacity = '0';

    hud.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #f97316; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px;">${t}</div>
      <div style="font-family: system-ui, -apple-system, sans-serif; color: rgba(255,255,255,0.92); font-size: 14px; font-weight: 500; line-height: 1.4;">${sub}</div>
    `;
    document.body.appendChild(hud);
    
    // Trigger entry animations
    setTimeout(() => {
      spot.style.opacity = '1';
      hud.style.opacity = '1';
      hud.style.transform = 'translateX(-50%) translateY(0)';
    }, 20);
  }, { sel: selector, t: title, sub: subtitle });
  await delay(2500); // Give user enough time to absorb the tagline
}

// Helper to remove spotlight and HUD gracefully
async function removeSpotlight(page) {
  await page.evaluate(() => {
    const oldSpot = document.getElementById('demo-spotlight');
    if (oldSpot) {
      oldSpot.style.opacity = '0';
      setTimeout(() => oldSpot.remove(), 400);
    }
    const oldHud = document.getElementById('demo-hud');
    if (oldHud) {
      oldHud.style.opacity = '0';
      oldHud.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => oldHud.remove(), 400);
    }
  });
  await delay(600);
}

async function record() {
  console.log('Starting demo recording...');
  const browser = await chromium.launch({
    headless: true, // Run headlessly to guarantee execution in all shell environments
    slowMo: 750, // Human-like speed
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: 'c:/Users/Nik/Desktop/POS/restropos/public/marketing',
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Inject virtual red cursor circle with pulse ring effect
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'playwright-cursor';
      box.style.position = 'fixed';
      box.style.width = '24px';
      box.style.height = '24px';
      box.style.borderRadius = '50%';
      box.style.border = '2px solid rgba(249, 115, 22, 0.9)'; // Orange border
      box.style.backgroundColor = 'rgba(249, 115, 22, 0.4)'; // Orange semi-transparent fill
      box.style.pointerEvents = 'none';
      box.style.zIndex = '999999';
      box.style.transition = 'transform 0.15s ease, background-color 0.15s ease';
      box.style.transform = 'translate(-50%, -50%) scale(1)';
      box.style.left = '0px';
      box.style.top = '0px';
      box.style.boxShadow = '0 0 10px rgba(249, 115, 22, 0.5)';
      document.body.appendChild(box);

      const showClickRing = (x, y) => {
        const ring = document.createElement('div');
        ring.style.position = 'fixed';
        ring.style.width = '24px';
        ring.style.height = '24px';
        ring.style.borderRadius = '50%';
        ring.style.border = '2px solid rgb(249, 115, 22)';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '999998';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.transform = 'translate(-50%, -50%) scale(1)';
        ring.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
        ring.style.opacity = '1';
        document.body.appendChild(ring);
        
        setTimeout(() => {
          ring.style.transform = 'translate(-50%, -50%) scale(2.5)';
          ring.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
          ring.remove();
        }, 500);
      };

      document.addEventListener('mousemove', (e) => {
        box.style.left = `${e.clientX}px`;
        box.style.top = `${e.clientY}px`;
      });

      document.addEventListener('mousedown', (e) => {
        box.style.transform = 'translate(-50%, -50%) scale(0.7)';
        box.style.backgroundColor = 'rgba(249, 115, 22, 0.8)';
        showClickRing(e.clientX, e.clientY);
      });

      document.addEventListener('mouseup', () => {
        box.style.transform = 'translate(-50%, -50%) scale(1)';
        box.style.backgroundColor = 'rgba(249, 115, 22, 0.4)';
      });
    });
  });

  // Automatically handle system KOT confirmation alerts
  page.on('dialog', async dialog => {
    console.log('Dialog showing:', dialog.message());
    await delay(1200); // Let the client/lead read the alert
    await dialog.accept();
  });

  // Step 1: Login
  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:3000/login');
  await delay(1500);

  // Spotlight: Explore Live Demo Button
  await showSpotlight(page, 'button:has-text("Explore Live Demo")', 'Instant Accessibility', 'One-click cashier sign-in for seamless staff onboarding');
  const demoBtn = page.locator('button:has-text("Explore Live Demo")');
  await demoBtn.hover();
  await delay(800);
  await demoBtn.click();
  await removeSpotlight(page);

  // Step 2: Dashboard
  console.log('3. Redirecting and opening dashboard...');
  await page.waitForURL('**/dashboard');
  await delay(1500);
  
  // Spotlight: Sidebar for navigation features
  await showSpotlight(page, 'aside', 'Central POS Command', 'Manage sales, active tables, custom menus, staff, and analytics from a unified panel');
  await removeSpotlight(page);

  console.log('4. Navigating to POS / Billing...');
  const posLink = page.locator('aside a[href="/pos"]').first();
  await posLink.hover();
  await delay(500);
  await posLink.click();
  await page.waitForURL('**/pos');
  await delay(1500);

  // Step 3: Select Table
  console.log('5. Selecting dining table T4...');
  // Spotlight: Table Dropdown
  await showSpotlight(page, 'select', 'Dine-In Table Registry', 'Assign orders to specific tables to track occupancy and active tabs live');
  const tableSelect = page.locator('select');
  await tableSelect.hover();
  await delay(500);
  const targetTableValue = await page.evaluate(() => {
    const select = document.querySelector('select');
    if (!select) return '';
    const opt = Array.from(select.options).find(o => o.text.includes('T4') || o.text.includes('4'));
    return opt ? opt.value : '';
  });
  if (targetTableValue) {
    await tableSelect.selectOption(targetTableValue);
  } else {
    await tableSelect.selectOption({ index: 1 });
  }
  await delay(800);
  await removeSpotlight(page);

  // Step 4: Add Starters
  console.log('6. Adding Paneer Tikka (Starters)...');
  // Spotlight: Starters category pill
  await showSpotlight(page, 'button:has-text("Starters")', 'Responsive Menu Navigation', 'Filter menu categories dynamically to handle busy service rushes');
  const startersTab = page.locator('button:has-text("Starters")');
  await startersTab.hover();
  await startersTab.click();
  await delay(500);
  await removeSpotlight(page);

  // Spotlight: Paneer Tikka Card
  await showSpotlight(page, '.flex-1.flex-col div.group:has-text("Paneer Tikka")', '3-Click Billing', 'Add menu items instantly with pre-configured pricing and tax rates');
  const startersPaneer = page.locator('.flex-1.flex-col div.group:has-text("Paneer Tikka")').first();
  await startersPaneer.hover();
  await startersPaneer.locator('button:has-text("Add")').click();
  await delay(1000);
  await removeSpotlight(page);

  // Step 5: Add Main Course
  console.log('7. Adding Butter Chicken (Main Course)...');
  const mainNonVegTab = page.locator('button:has-text("Main Course — Non Veg")');
  await mainNonVegTab.hover();
  await mainNonVegTab.click();
  await delay(800);

  // Spotlight: Butter Chicken Card
  await showSpotlight(page, '.flex-1.flex-col div.group:has-text("Butter Chicken")', 'Multi-Category Cart Integration', 'Combine veg, non-veg, and beverages inside the same active ticket');
  const mainChicken = page.locator('.flex-1.flex-col div.group:has-text("Butter Chicken")').first();
  await mainChicken.hover();
  await mainChicken.locator('button:has-text("Add")').click();
  await delay(1000);
  await removeSpotlight(page);

  // Step 6: Add Breads & Qty Increase
  console.log('8. Adding Butter Naan (Breads)...');
  const breadsTab = page.locator('button:has-text("Breads")');
  await breadsTab.hover();
  await breadsTab.click();
  await delay(800);

  // Spotlight: Butter Naan Card
  await showSpotlight(page, '.flex-1.flex-col div.group:has-text("Butter Naan")', 'Menu Customizations', 'Add rotis or naans directly from the tandoor segment');
  const breadsNaan = page.locator('.flex-1.flex-col div.group:has-text("Butter Naan")').first();
  await breadsNaan.hover();
  await breadsNaan.locator('button:has-text("Add")').click();
  await delay(1000);
  await removeSpotlight(page);

  console.log('9. Modifying item quantity to 3x...');
  // Spotlight: Cart Item Tray
  await showSpotlight(page, '.w-72 div.group:has-text("Butter Naan")', 'Tray Quantity Control', 'Adjust item counts dynamically in the tray. Totals recalculate instantly.');
  const naanCartItem = page.locator('.w-72 div.group:has-text("Butter Naan")');
  const qtyPlusBtn = naanCartItem.locator('button').nth(1); // 2nd button is Plus
  await qtyPlusBtn.hover();
  await qtyPlusBtn.click();
  await delay(600);
  await qtyPlusBtn.hover();
  await qtyPlusBtn.click();
  await delay(1000);
  await removeSpotlight(page);

  // Step 7: KOT
  console.log('10. Simulating KOT Generation...');
  // Spotlight: KOT Button
  await showSpotlight(page, 'button:has-text("KOT")', 'Kitchen Order Tickets', 'Print KOTs instantly to sync order items with kitchen display screens');
  const kotBtn = page.locator('button:has-text("KOT")');
  await kotBtn.hover();
  await kotBtn.click();
  await delay(2000); // Wait for alert dialog auto-handling
  await removeSpotlight(page);

  // Step 8: Pay with UPI & Checkout
  console.log('11. Selecting UPI Payment Mode...');
  // Spotlight: UPI Selector
  await showSpotlight(page, 'button:has-text("UPI")', 'Flexible Payment Settlement', 'Choose Cash, UPI, Card, or split bills in a single tap');
  const upiBtn = page.locator('button:has-text("UPI")');
  await upiBtn.hover();
  await upiBtn.click();
  await delay(1000);
  await removeSpotlight(page);

  console.log('12. Completing Checkout / Placing Order...');
  // Spotlight: Place Order Button
  await showSpotlight(page, 'button:has-text("Place")', 'Seamless Checkout Loop', 'Close bills, record payment transactions, and release occupied dining tables');
  const placeBtn = page.locator('button:has-text("Place")');
  await placeBtn.hover();
  await placeBtn.click();
  await delay(3000); // Allow success checkmark animation to run
  await removeSpotlight(page);

  // Step 9: Verify Tables
  console.log('13. Loading Live Tables Dashboard...');
  const tablesLink = page.locator('aside a[href="/tables"]').first();
  await tablesLink.hover();
  await tablesLink.click();
  await page.waitForURL('**/tables');
  await delay(1500);

  // Spotlight: Tables Status Grid
  await showSpotlight(page, '.p-5', 'Real-Time Table Status', 'Track Occupied, Available, Cleaning, or Reserved tables live on the floor map');
  await removeSpotlight(page);

  console.log('14. Checking Table status toggle...');
  const reserveBtn = page.locator('button:has-text("Reserve")').first();
  if (await reserveBtn.isVisible()) {
    // Spotlight: Reserve Button
    await showSpotlight(page, 'button:has-text("Reserve")', 'Manual Seating Override', 'Change seating statuses or reserve tables for guest arrivals immediately');
    await reserveBtn.hover();
    await reserveBtn.click();
    await delay(1500);
    await removeSpotlight(page);
    
    // Spotlight: Cancel Reservation Button
    await showSpotlight(page, 'button:has-text("Cancel")', 'Status Releases', 'Quickly cancel reservations or release tables back to the active pool');
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    await cancelBtn.hover();
    await cancelBtn.click();
    await delay(1500);
    await removeSpotlight(page);
  }

  // Step 10: Reports
  console.log('15. Loading Analytics & Sales Reports...');
  const reportsLink = page.locator('aside a[href="/reports"]').first();
  await reportsLink.hover();
  await reportsLink.click();
  await page.waitForURL('**/reports');
  await delay(2000);

  // Spotlight: KPI card row
  await showSpotlight(page, 'div.grid-cols-1', 'Advanced Analytics Dashboard', 'Monitor total revenue, average ticket size, and payment distributions');
  const revCard = page.locator('div.rounded-lg:has-text("Total Revenue")').first();
  await revCard.hover();
  await delay(1500);
  await removeSpotlight(page);

  // Spotlight: Export GST Button
  await showSpotlight(page, 'button:has-text("Export GST CSV")', 'Automated Tax Compliance', 'Download comprehensive sales, discount, and tax logs as GST-compliant CSV files');
  const exportBtn = page.locator('button:has-text("Export GST CSV")');
  await exportBtn.hover();
  await delay(1500);
  await removeSpotlight(page);

  console.log('Wrapping up the recording...');
  await delay(2000);

  // Close context to trigger video compile
  await context.close();
  const video = await page.video();
  const videoPath = await video.path();
  console.log('Raw video file saved temporarily at:', videoPath);

  await browser.close();

  // Relocate and finalize the video to standard folder: public/marketing/pos_demo.webm
  const outputDir = 'c:/Users/Nik/Desktop/POS/restropos/public/marketing';
  const fs = require('fs');
  const targetPath = path.join(outputDir, 'pos_demo.webm');
  
  if (fs.existsSync(videoPath)) {
    fs.mkdirSync(outputDir, { recursive: true });
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(videoPath, targetPath);
    console.log('Demo recording successfully finalized at:', targetPath);
  } else {
    console.error('Video file was not generated properly at:', videoPath);
  }
}

record().catch(console.error);
