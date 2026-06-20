# RestroPOS: Database, Hosting, and Scaling Guide
*A comprehensive guide on hosting optimization, infrastructure scaling, and offline local architecture for the RestroPOS platform.*

---

## 1. Neon Database Compute & Free Tier Limits

Neon's Free Tier provides **100 CU-hours (Compute Unit hours) per project per month**. Below is a detailed breakdown of how compute usage is calculated and how it applies to a real-world restaurant environment.

### 1.1 Compute Units (CU) & Auto-Suspend
* **Compute Units (CU):** The database autoscales its resources based on query load. The minimum size is **0.25 CU** (0.25 vCPU, ~1 GB RAM), and it scales up to **2 CU** (2 vCPU, 8 GB RAM) under heavy load. A POS system primarily runs at **0.25 CU** for standard billing and order actions.
* **Scale-to-Zero (Autosuspend):** On the Free Tier, the database automatically suspends (powers down) after **5 minutes of total inactivity**. During suspension, it consumes **0 CU-hours**. The database wakes up automatically when a new query arrives (taking about `300ms–1s`).
* **Active Compute Rates (at 0.25 CU):**
  $$\text{CU-Hours} = 0.25 \times \text{Active Hours}$$
  This means 100 CU-hours yields **400 hours of active database time per month** (an average of **13.3 hours of database activity per day**).

### 1.2 Real-World Customer Capacity Scenarios
Because of the 5-minute autosuspend rule, your monthly compute usage is determined by **how queries are spaced out in time**, rather than the raw number of orders or customers.

* **Scenario A: High Traffic (Concentrated Operating Hours) — [SAFE]**
  If a restaurant serves **200+ orders per day** within a continuous 11-hour operating window (e.g., 11:30 AM to 10:30 PM):
  $$\text{Daily Compute} = 11\text{ hours} \times 0.25\text{ CU} = 2.75\text{ CU-hours/day}$$
  $$\text{Monthly Total} = 2.75\text{ CU-hours/day} \times 30\text{ days} = \mathbf{82.5\text{ CU-hours}}$$
  *Result:* Fits comfortably within the 100 CU-hour budget.

* **Scenario B: Low Traffic (Spread Out 24/7) — [RISK OF EXHAUSTION]**
  If customers or staff access the POS or online menus occasionally throughout the 24-hour cycle (at least once every 10–15 minutes):
  $$\text{Daily Compute} = 24\text{ hours} \times 0.25\text{ CU} = 6\text{ CU-hours/day}$$
  $$\text{Monthly Total} = 6\text{ CU-hours/day} \times 30\text{ days} = \mathbf{180\text{ CU-hours}}$$
  *Result:* The database will run out of compute and suspend in **16.6 days**, even with minimal total orders.

* **Scenario C: Uptime Monitors and Health Checks — [HIGH RISK]**
  If any third-party monitoring service (e.g., UptimeRobot) pings your database-connected API routes (like `/api/ops/db-health`) every 1 to 5 minutes:
  * The database will never suspend, running 24/7.
  * *Result:* Consumes **180 CU-hours/month**. The free tier will be exhausted midway through the month even with **zero** real customers.

---

## 2. Multi-Instance vs. Multi-Tenant Architecture

For your business model of **lifetime ownership, custom features on-demand, and a low annual upkeep fee (₹999/year)**, choosing the right architecture is critical.

| Feature / Metric | Multi-Tenant (Single Shared App & DB) | Multi-Instance (Separate Project & DB per Cafe) |
| :--- | :--- | :--- |
| **Hosting Cost** | Paid tier required quickly as traffic aggregates across all clients. | **₹0 (Free)** (Each client runs on their own isolated Vercel/Neon Free Tiers). |
| **Custom Feature Isolation** | Hard. Requires conditional feature flags (`if client == A`). Code becomes "spaghetti." | **Easy.** Write custom code directly inside the specific client's code branch. |
| **System Stability** | Vulnerable. If the database crashes, **all** client restaurants go offline. | **Isolated.** If Cafe A's app crashes, Cafe B, C, and D are unaffected. |
| **Data Security** | High Risk. Query bugs can accidentally leak Client A's data to Client B. | **Absolute.** Separate databases make cross-client leaks physically impossible. |
| **Migration to Local** | Very complex to extract data for a single client. | **Instant.** Copy the client's repository and database to a local machine. |

### Why Multi-Instance Fits Your Business Model
By creating a separate GitHub repository, Neon DB, and Vercel project for every client:
1. **No Infrastructure Costs:** You pay zero hosting fees because each cafe stays within its own free limits.
2. **Premium Customization:** You can charge premium development fees to build bespoke integrations (e.g., custom loyalty flows, local hardware drivers) directly inside that client's codebase without affecting other customers.
3. **True Ownership:** You can cleanly hand over the complete infrastructure to a client if they ever request to self-manage.

---

## 3. Local (On-Premise) & Hybrid Offline Database Setup

To protect cafes from internet outages and remove cloud compute limits entirely, you can transition them to a **Local** or **Hybrid** database model.

### 3.1 Local Server Architecture (On-Premise)
* **Hardware:** A low-cost Mini PC (such as an Intel NUC, ₹12,000–₹15,000) or a spare desktop computer placed at the billing counter.
* **Database & App Hosting:** PostgreSQL and the Next.js production build (`npm run start` via Node.js or Docker) are installed directly on the Mini PC.
* **Local Connectivity:** The Mini PC acts as a server on the restaurant's local Wi-Fi router. 
* **Accessing the POS:** Billing computers, waiter tablets, and kitchen displays connect to the local IP (e.g., `http://192.168.1.100:3000` or `http://pos.local`).
  * **Pros:** Works 100% offline (zero internet dependence), ultra-fast page loads (`<5ms`), and zero database hosting charges.

### 3.2 Hybrid Sync Model (Cloud + Local)
For restaurants that require local offline reliability for billing but still need to receive online orders (from Swiggy, Zomato, or their online website menu) and sync reporting dashboard data:

```
                  ┌──────────────────────────────┐
                  │  Online Services / Customers │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Cloud Database (Neon)     │
                  └──────────────┬───────────────┘
                                 ▲
                          (Internet Sync)
                                 ▼
                  ┌──────────────────────────────┐
                  │    Local Mini PC Server      │
                  │   (On-Premise Postgres)      │
                  └──────┬──────────────┬────────┘
                         │              │
                         ▼              ▼
                  ┌───────────┐   ┌───────────┐
                  │  Tablet 1 │   │  Tablet 2 │
                  └───────────┘   └───────────┘
```

1. **Active Internet Mode:** A background worker running on the local server polls the cloud Neon DB for incoming web orders and updates the local state. In-house billing records are instantly pushed to the cloud DB to update the owner's dashboard.
2. **Offline Mode:** If the internet fails, in-house POS operations (KOT printing, bill generation, table layout) continue running locally without interruption.
3. **Recovery Sync:** As soon as the internet connection is restored, the local server pushes all offline transactions up to the cloud and pulls missed online orders automatically.

### 3.3 Business Monetization
This architecture can be packaged as a **Premium Up-sell (e.g., ₹9,999 one-time setup fee + hardware cost)**. You handle the physical setup or remote configuration of the Mini PC, providing the customer with a completely bulletproof, offline-resilient billing environment.
