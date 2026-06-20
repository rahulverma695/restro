"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function PitchDeckPage() {
  
  useEffect(() => {
    const classes = Array.from(document.documentElement.classList);
    classes.forEach(c => {
      if (c.startsWith("theme-")) {
        document.documentElement.classList.remove(c);
      }
    });
    document.documentElement.classList.add("theme-cabernet");
  }, []);

  return (
    <div style={{ background: "#edebe7", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 30, padding: "40px 20px", fontFamily: "var(--font-outfit), sans-serif" }}>
      
      {/* ── Top Bar ── */}
      <div style={{
        width: "100%",
        maxWidth: 1000,
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(46, 37, 31, 0.03)"
      }} className="no-print">
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", margin: 0 }}>RestroPOS Pitch Deck</h4>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0 0" }}>View on-page or click Print, select **Landscape**, enable Background Graphics, and save as PDF.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)", textDecoration: "none" }}>← Back to Home</Link>
          <button 
            onClick={() => window.print()}
            style={{
              background: "var(--orange)",
              color: "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: 30,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Print to PDF
          </button>
        </div>
      </div>

      {/* Styles for print and responsive layout */}
      <style jsx global>{`
        * {
          font-family: var(--font-outfit), 'Outfit', sans-serif !important;
        }
        .slide-card {
          background-color: var(--bg-cream);
          width: 1000px;
          height: 562.5px;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 20px 40px rgba(46, 37, 31, 0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          page-break-after: always;
          break-after: page;
          transition: all 0.3s;
        }

        .slide-header-comp {
          padding: 32px 48px 0 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slide-body-comp {
          flex: 1;
          padding: 40px 48px;
          display: grid;
          grid-template-columns: 1fr;
          align-content: center;
        }

        .slide-grid-2 {
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        .slide-footer-comp {
          padding: 0 48px 32px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.6;
          font-weight: 500;
        }

        .slide-badge {
          display: inline-block;
          background-color: var(--accent-dim);
          border: 1px solid rgba(190, 18, 60, 0.1);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .slide-h1 {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 12px;
          letter-spacing: -1.2px;
          color: var(--text-dark);
        }

        .slide-h1 span {
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .slide-h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.8px;
          line-height: 1.25;
          color: var(--text-dark);
        }

        .slide-h2 span {
          color: var(--accent);
        }

        .slide-subtitle {
          font-size: 17px;
          color: var(--text-muted);
          margin-bottom: 20px;
          font-weight: 400;
        }

        .slide-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.55;
        }

        .slide-bullet-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slide-bullet-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .slide-bullet-list li strong {
          color: var(--text-dark);
          font-weight: 600;
        }

        .slide-bullet-list li svg {
          width: 18px;
          height: 18px;
          stroke: var(--accent);
          stroke-width: 2.5;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .slide-bullet-list.cross-list li svg {
          stroke: #dc2626;
        }

        .slide-mockup-container {
          width: 100%;
          height: 280px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 15px 30px rgba(46, 37, 31, 0.05);
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide-mockup-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .slide-comp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .slide-comp-table th {
          text-align: left;
          padding: 10px 14px;
          color: var(--text-dark);
          border-bottom: 1.5px solid var(--border);
          font-weight: 700;
        }

        .slide-comp-table td {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(190,18,60,0.06);
          color: var(--text-muted);
        }

        .slide-comp-table tr.highlight-row {
          background-color: var(--accent-dim);
          font-weight: 700;
        }

        .slide-comp-table tr.highlight-row td {
          color: var(--accent);
        }

        .slide-feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .slide-feat-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 10px rgba(46, 37, 31, 0.02);
        }

        .slide-feat-card h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .slide-feat-card h4 svg {
          width: 16px;
          height: 16px;
          stroke: var(--accent);
        }

        .slide-feat-card p {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .slide-model-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .slide-model-card {
          background: #ffffff;
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(46, 37, 31, 0.02);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .slide-model-num {
          font-size: 36px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }

        .slide-model-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .slide-model-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.55;
        }

        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background-color: var(--bg-cream) !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .slide-card {
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* ── SLIDE 1: COVER ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">01 / 11</span>
        </div>
        <div className="slide-body-comp">
          <div style={{ maxWidth: 720 }}>
            <span className="slide-badge">Flat-Rate SaaS Edition</span>
            <h1 className="slide-h1">The Ultimate <span>Flat-Rate</span> POS Suite.</h1>
            <p className="slide-subtitle" style={{ marginTop: 14 }}>We build your POS exactly how you want it, with the features you need. A single flat ₹14,999/year package includes managed cloud hosting, automatic backups, and direct support.</p>
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>restropos-marketing.vercel.app</span>
          <span>© 2026 RestroPOS</span>
        </div>
      </div>

      {/* ── SLIDE 2: THE SUBSCRIPTION TRAP ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">02 / 11</span>
        </div>
        <div className="slide-body-comp slide-grid-2">
          <div>
            <h2 className="slide-h2">Stop paying <span>per terminal</span> and per feature.</h2>
            <p className="slide-desc" style={{ marginBottom: 20 }}>Standard POS systems lock you into an endless subscription loop, eating your hard-earned profits month after month.</p>
            <ul className="slide-bullet-list cross-list">
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                <span><strong>Continuous Screen Fees:</strong> They charge you extra for every cashier terminal, waiter tablet, or kitchen display screen you add.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                <span><strong>Feature Paywalls:</strong> Advanced modules like recipe inventory tracking, SMS marketing, or CRM loyalty are locked behind high-tier plans.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                <span><strong>Transaction Commissions:</strong> They take hidden percentage cuts on your own table-specific QR self-ordering transactions.</span>
              </li>
            </ul>
          </div>
          <div className="slide-mockup-container">
            <img className="slide-mockup-img" src="/marketing/pos_dashboard.png" alt="POS Dashboard" />
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>The SaaS Problem</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 3: OUR SIMPLE MODEL ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">03 / 11</span>
        </div>
        <div className="slide-body-comp">
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <h2 className="slide-h2">Our Model is Simple</h2>
            <p className="slide-desc">One flat annual fee. Unlimited terminals. Zero hidden markups.</p>
          </div>
          <div className="slide-model-container">
            <div className="slide-model-card">
              <div className="slide-model-num">01</div>
              <div className="slide-model-title">Custom-Built for You</div>
              <div className="slide-model-desc">We adapt the software to match your menu layouts, printer routing, and cashier workflows. If you need a custom button or custom report, our engineering team builds it for you.</div>
            </div>
            <div className="slide-model-card">
              <div className="slide-model-num">02</div>
              <div className="slide-model-title">Unlimited Devices &amp; Screens</div>
              <div className="slide-model-desc">Run cashier terminals, waiter tablets, kitchen screens, and table QRs under a single flat ₹14,999/year subscription. No per-terminal fees, no transaction cuts, and no feature locks.</div>
            </div>
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Our Simple Model</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 4: BUILD YOUR CUSTOM POS ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">04 / 11</span>
        </div>
        <div className="slide-body-comp" style={{ paddingTop: 10 }}>
          <h2 className="slide-h2" style={{ textAlign: "center", marginBottom: 12 }}>All Features Included. <span>One Flat Subscription.</span></h2>
          <p className="slide-desc" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 20px" }}>No extra charges. No add-on fees. Every feature is fully included in the flat ₹14,999/year package.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "stretch" }}>
            {/* Column 1: Base Tier */}
            <div className="slide-feat-card" style={{ borderTop: "4px solid var(--text-dark)", padding: "18px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Core Features</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Base Package (₹14,999/yr)</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> 3-Click POS billing counter</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Self-Ordering Table QR system</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Interactive Floor Table Map</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> KOT firing &amp; station routing</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Staff roles &amp; shift registers</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Revenue charts &amp; GST reports</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> CRM loyalty &amp; customer DB</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Thermal printer routing</li>
              </ul>
            </div>
            
            {/* Column 2: Premium Add-ons */}
            <div className="slide-feat-card" style={{ borderTop: "4px solid var(--accent)", padding: "18px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Premium Modules</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Add-ons (Included)</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Employee Attendance &amp; Shifts</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Inventory &amp; Stock Depletion</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Online Order Hub (Swiggy/Zomato)</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> SMS Marketing &amp; Promo Campaigns</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> AI Brand Builder &amp; Poster Studio</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span> Multi-Terminal LAN Sync</li>
              </ul>
            </div>
            
            {/* Column 3: Mini Add-ons */}
            <div className="slide-feat-card" style={{ borderTop: "4px solid #3b82f6", padding: "18px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Interactive Widgets</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Mini Add-ons (Included)</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Cafe Jukebox Queue</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Call Waiter / Service Bell</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Valet Parking Callback</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Smart Energy Monitor</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Gamified Spin-the-Wheel</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Wi-Fi Passcode Generator</li>
                <li style={{ marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span> Instant WhatsApp Feedback</li>
              </ul>
            </div>
          </div>
          
          <p style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 12 }}>Configure your build live at <strong style={{ color: "var(--accent)" }}>restropos-marketing.vercel.app</strong> → Interactive Pricing Builder</p>
        </div>
        <div className="slide-footer-comp">
          <span>POS Configurator</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 5: POWERFUL FEATURES ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">05 / 11</span>
        </div>
        <div className="slide-body-comp">
          <h2 className="slide-h2" style={{ textAlign: "center", marginBottom: 24 }}>Everything You Need to Run Your Outlet</h2>
          <div className="slide-feat-grid">
            <div className="slide-feat-card">
              <h4><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> POS Billing &amp; KOT</h4>
              <p>Clean billing interface. Fire KOTs directly to kitchen printers, manage split bills, and process payments (UPI, Card, Cash) in under 3 clicks.</p>
            </div>
            <div className="slide-feat-card">
              <h4><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> Table Layout Status</h4>
              <p>An interactive, graphical layout of your restaurant floor showing table seating occupancy, reserved spots, and bills due at a glance.</p>
            </div>
            <div className="slide-feat-card">
              <h4><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> Table QR Self-Ordering</h4>
              <p>Provide branded table QR codes. Customers scan, browse your menu, and submit orders directly to the POS and kitchen, reducing staff load.</p>
            </div>
            <div className="slide-feat-card">
              <h4><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-10v10a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2z" /></svg> Ingredient Inventory &amp; CRM</h4>
              <p>Recipe-based ingredient tracking that auto-deducts stock as bills print, alongside customer databases and loyalty points.</p>
            </div>
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Full Feature Suite</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 6: BESPOKE OPERATIONS & CUSTOM SOFTWARE ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">06 / 11</span>
        </div>
        <div className="slide-body-comp slide-grid-2">
          <div>
            <span className="slide-badge">Bespoke Operations &amp; Custom Software</span>
            <h2 className="slide-h2">We build <span>any kind of software</span> you need.</h2>
            <p className="slide-desc" style={{ marginBottom: 20 }}>We are not just limited to restaurant billing. If your business operations require custom modules, our engineering team builds it for you at no extra charge.</p>
            <ul className="slide-bullet-list">
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Custom HRMS Platforms:</strong> Employee shift check-ins, attendance logs, and staff profiles tailored for your store.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Custom Payroll Modules:</strong> Calculate salaries, bonuses, and staff payouts directly within the system.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Tailored Integrations &amp; CRM:</strong> Connect with external legacy APIs or customize your customer loyalty rules.</span>
              </li>
            </ul>
          </div>
          <div className="mockup-container" style={{ background: "#FCFAF6", display: "flex", flexDirection: "column", gap: 16, padding: "24px", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", width: "100%" }}>
              <div style={{ width: 32, height: 32, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--accent)", fontWeight: "bold", fontSize: 16 }}>H</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: "800", color: "var(--text-dark)" }}>Store HRMS &amp; Attendance</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Active check-ins: 14 staff members</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", width: "100%" }}>
              <div style={{ width: 32, height: 32, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--accent)", fontWeight: "bold", fontSize: 16 }}>P</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: "800", color: "var(--text-dark)" }}>Custom Store Payroll</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Hourly wages &amp; split payouts enabled</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", width: "100%" }}>
              <div style={{ width: 32, height: 32, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--accent)", fontWeight: "bold", fontSize: 16 }}>S</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: "800", color: "var(--text-dark)" }}>Custom Operations CRM</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Linked with local inventory depletion</div>
              </div>
            </div>
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Custom Operations Software</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 7: COST COMPARISON ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">07 / 11</span>
        </div>
        <div className="slide-body-comp" style={{ paddingTop: 10 }}>
          <h2 className="slide-h2" style={{ textAlign: "center", marginBottom: 16 }}>The Math: <span>SaaS Subscription vs. Our Flat-Rate Package</span></h2>
          <table className="slide-comp-table">
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Typical SaaS Subscription (Base + Add-ons)</th>
                <th>RestroPOS (Flat-Rate Subscription)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Upfront Setup Fee</strong></td>
                <td>₹5,000 – ₹10,000</td>
                <td><strong>₹0</strong> (Included)</td>
              </tr>
              <tr>
                <td><strong>Monthly Software Rent</strong></td>
                <td>₹3,000/mo (Never-ending)</td>
                <td><strong>₹0</strong> (Billed annually)</td>
              </tr>
              <tr>
                <td><strong>Custom Add-ons &amp; Modules</strong></td>
                <td>Extra per module (₹2k–₹5k each)</td>
                <td><strong>₹0</strong> (All 13+ modules included)</td>
              </tr>
              <tr>
                <td><strong>Year 1 Total Cost</strong></td>
                <td>₹41,000+</td>
                <td><strong>₹14,999</strong></td>
              </tr>
              <tr>
                <td><strong>Year 2 &amp; 3 Cost</strong></td>
                <td>₹72,000+</td>
                <td><strong>₹29,998</strong></td>
              </tr>
              <tr className="highlight-row">
                <td><strong>Total 3-Year Outlay</strong></td>
                <td><strong>₹1,13,000+ (With limits)</strong></td>
                <td><strong>₹44,997 (All-Inclusive)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="slide-footer-comp">
          <span>Financial Comparison</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 7: OFFLINE LOCK ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">08 / 11</span>
        </div>
        <div className="slide-body-comp slide-grid-2">
          <div>
            <h2 className="slide-h2">Internet Down? <span>Keep Billing.</span></h2>
            <p className="slide-desc" style={{ marginBottom: 20 }}>Other cloud POS applications freeze when the internet cuts. RestroPOS keeps working without missing a beat.</p>
            <ul className="slide-bullet-list">
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Local Mini-PC DB:</strong> We set up a local database server inside your building. Your local devices communicate directly with it.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Automatic Cloud Sync:</strong> The moment your internet reconnects, all transactions sync automatically to the cloud.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Zero Speed Lag:</strong> Fast response times for billing tablets and thermal kitchen printers, regardless of external bandwidth.</span>
              </li>
            </ul>
          </div>
          <div className="slide-mockup-container">
            <img className="slide-mockup-img" src="/marketing/qr_ordering.png" alt="QR Ordering" />
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Offline Architecture</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 8: CLOUD HOSTING & NO MARKUPS ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">09 / 11</span>
        </div>
        <div className="slide-body-comp slide-grid-2">
          <div>
            <h2 className="slide-h2">Managed Cloud Hosting. <span>Zero Stress.</span></h2>
            <p className="slide-desc" style={{ marginBottom: 24 }}>Continuous server infrastructure monitoring, automated upgrades, and speed optimizations fully managed by RestroPOS.</p>
            <ul className="slide-bullet-list">
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>All-Inclusive Hosting:</strong> Dedicated database and cloud server hosting costs are fully covered under your flat-rate subscription.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Zero Server Management:</strong> You never have to log into database servers or hosting panels; we handle 100% of the maintenance and upkeep.</span>
              </li>
              <li>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Robust Backups:</strong> Automated hourly database snapshots and daily backups managed at no extra cost to secure your data.</span>
              </li>
            </ul>
          </div>
          <div className="slide-mockup-container">
            <img className="slide-mockup-img" src="/marketing/server_sync.png" alt="Server Sync Diagram" />
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Hosting Control</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 9: DEDICATED MAINTENANCE ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">10 / 11</span>
        </div>
        <div className="slide-body-comp">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <h2 className="slide-h2">Your Dedicated Tech Team</h2>
              <p className="slide-desc">All continuous upkeep and active assistance covered by your subscription.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>Included</span>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Part of your Subscription</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="slide-feat-card" style={{ borderTop: "3px solid var(--accent)" }}>
              <h4 style={{ marginBottom: 6 }}>SSL &amp; Domain</h4>
              <p>We configure and manage your secure HTTPS address so your billing link is always live and safe.</p>
            </div>
            <div className="slide-feat-card" style={{ borderTop: "3px solid var(--accent)" }}>
              <h4 style={{ marginBottom: 6 }}>Daily Backups</h4>
              <p>We set up automated database backups so your sales reports, billing data, and menus are never lost.</p>
            </div>
            <div className="slide-feat-card" style={{ borderTop: "3px solid var(--accent)" }}>
              <h4 style={{ marginBottom: 6 }}>Core Upgrades</h4>
              <p>We run security updates and code optimizations to keep the database connections running fast.</p>
            </div>
            <div className="slide-feat-card" style={{ borderTop: "3px solid var(--accent)" }}>
              <h4 style={{ marginBottom: 6 }}>Tech Support</h4>
              <p>Direct WhatsApp contact with our engineers. If anything goes wrong, we jump on it immediately.</p>
            </div>
          </div>
        </div>
        <div className="slide-footer-comp">
          <span>Dedicated Maintenance</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

      {/* ── SLIDE 10: CALL TO ACTION ── */}
      <div className="slide-card">
        <div className="slide-header-comp">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <ChefHat style={{ width: 14, height: 14, color: "#fff", margin: "auto" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>RestroPOS</span>
          </div>
          <span className="slide-num">11 / 11</span>
        </div>
        <div className="slide-body-comp" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <h2 className="slide-h2">Go back to focusing on your business.</h2>
          <p className="slide-subtitle" style={{ marginBottom: 24 }}>Setup takes under 20 minutes. We configure your POS, import your menu, connect hardware, and train your staff.</p>
          
          <div style={{ background: "#ffffff", border: "1px solid var(--border)", padding: "20px 28px", borderRadius: 12, display: "inline-block", marginBottom: 20, textAlign: "left", boxShadow: "0 4px 12px rgba(46, 37, 31, 0.02)" }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}><strong>Speak directly to our engineering team:</strong></p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>WhatsApp/Call: +91 97406 15639</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Email: nikhilbhaviyavar@gmail.com &nbsp;·&nbsp; Web: restropos-marketing.vercel.app</p>
          </div>

          <p className="slide-desc" style={{ fontSize: 12 }}>No commissions. No hidden add-on costs. Continuous support, updates, and maintenance included.</p>
        </div>
        <div className="slide-footer-comp">
          <span>Get Started</span>
          <span>restropos-marketing.vercel.app</span>
        </div>
      </div>

    </div>
  );
}
