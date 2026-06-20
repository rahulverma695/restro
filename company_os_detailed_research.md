# Product Specification & Architecture: Company OS (OmniHub)
*A Complete Blueprint for a Self-Hosted, Subscription-Free Corporate Intranet Workspace.*

---

## 1. Executive Vision & Market Positioning

Modern businesses suffer from **subscription fatigue** and **tool sprawl**. The average company with 50–250 employees pays for 5–7 separate software services just to run daily internal operations:
*   **HR & Leave Tracking:** BambooHR, Rippling, Keka, Zoho People
*   **Team Communication:** Slack, Microsoft Teams
*   **Helpdesk & IT Support:** Zendesk, Freshdesk, Jira Service Desk
*   **Knowledge Base & Wiki:** Notion, Confluence, Document360
*   **Expense Auditing:** Expensify, Rydoo, Ramp

As headcount grows, these services charge **per-user, per-month seat fees**. This creates a mounting financial drag and locks valuable company data inside fragmented third-party servers.

### The Solution: Company OS
**Company OS** is a unified corporate operating system offered as a **high-ticket, one-time setup fee (lifetime license)**. The application is deployed directly to the client's private cloud (Vercel, AWS, or GCP) and connects directly to their serverless database (Neon PostgreSQL). 

The client owns their software, their database, and their code. They pay **$0/month in subscription seat fees**, only covering the raw, un-marked-up infrastructure costs of their database and servers.

---

## 2. The Financial Arbitrage (Outbound Pitch Math)

To sell this effectively to CFOs and COOs, the sales pitch is framed around direct financial returns. Below is the cost projection comparing a standard subscription stack vs. Company OS for a **150-employee firm**:

### Multi-Tool SaaS Stack (150 Users)
*   **HR & Leave Management (BambooHR):** $8.00 / user / month = $1,200/mo
*   **Team Communication (Slack Pro):** $7.25 / user / month = $1,087.50/mo
*   **Internal Helpdesk (Freshdesk):** $15.00 / user / month = $2,250/mo
*   **Knowledge Base (Notion):** $10.00 / user / month = $1,500/mo
*   **Expense Scanners (Expensify):** $9.00 / user / month = $1,350/mo
*   **TOTAL MONTHLY OUTFLOW:** **$7,387.50 / month**
*   **TOTAL YEARLY OUTFLOW:** **$88,650.00 / year**

### Company OS (Self-Hosted Private Cloud)
*   **One-time License/Setup Fee:** **$7,500 (One-Time)**
*   **Neon Serverless DB Hosting:** ~$20/mo (No markups, scales with storage size) = $240/yr
*   **Vercel Serverless Hosting:** ~$20/mo (Pro account) = $240/yr
*   **TOTAL YEAR 1 OUTFLOW:** **$7,980.00**
*   **TOTAL YEAR 2+ OUTFLOW:** **$480.00 / year**

> [!TIP]
> **Total 3-Year Savings for the Client:** **$257,970.00**  
> **Payback Period:** Less than **1.1 months**.

---

## 3. Core Module Specifications (Non-AI V1)

The V1 architecture focuses on core, robust features to handle daily company workflows without complex integrations:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              COMPANY OS                                │
├──────────────┬──────────────┬──────────────┬────────────┬──────────────┤
│ 1. Dashboard │ 2. Directory │ 3. Timesheet │ 4. Tickets │ 5. Wiki Docs │
│   Notices    │ Staff Cards  │  Clock-ins   │  HR & IT   │   Markdown   │
│  Check-ins   │ Departments  │  Vacations   │  Replies   │   Folders    │
└──────────────┴──────────────┴──────────────┴────────────┴──────────────┘
```

### Module 1: Unified Portal Dashboard
*   **Notice Board:** High-priority notices posted by admins/managers pinned to the top.
*   **Quick Check-in Node:** Card allowing employees to Clock In / Out, logging timestamp data and active locations.
*   **Department Presence Stats:** Real-time counter showing "Total Employees Online", "Active on Leave", and "Open Operations Tickets".

### Module 2: Employee Registry (Directory)
*   **Department Tree:** Visual groupings of employees by department (e.g., Engineering, Marketing, Finance, HR).
*   **Profile Cards:** Displays role title, email, manager, and active status.
*   **Presence Badges:** Visual indicators denoting whether a teammate is **Active (Online)**, **Offline**, or **On Leave** (synced with shifts and leave trackers).

### Module 3: Time & Vacation Manager
*   **Leave Request Engine:** Form to request vacations/sick leaves specifying type, dates, and justification.
*   **Manager Approval Hub:** Review queue visible only to managers. Allows Approving/Rejecting requests with single-click Server Actions.
*   **Shift History Logs:** User-specific scroll listing past clock-in times, clock-out times, total hours worked, and handover notes.

### Module 4: IT & HR Helpdesk (Ticketing Workspace)
*   **Interactive Two-Column Layout:** Select a ticket from the queue list on the left to load the details and conversation thread on the right.
*   **Category & Priority Routing:** Filter tickets by Category (IT, HR, Finance, Facility) and Priority (Low, Medium, High).
*   **Assignee & Status Control:** Managers can assign tickets to support staff and toggle ticket statuses (`open`, `in_progress`, `resolved`).
*   **Comments Feed:** Nested replies showing timeline of comments, queries, and file resolutions.

### Module 5: Company Wiki (SOP Board)
*   **Markdown SOP Viewer:** Render internal guides, developer wikis, and HR policy handbooks.
*   **Wiki Editor:** Simple textarea allowing markdown layouts and previewing documents.
*   **Role-Based Deletions:** Allow only the document creator or system managers to delete wiki entries.

---

## 4. Phase 2: AI-Enabled Extensions

Once the core portal is operational, the following modules can be added using Vertex AI (Gemini 2.5) to turn it into an **intelligent intranet**:

### Extension 1: RAG-Powered Wiki Assistant (AI HR)
*   **The Feature:** An embeddable search assistant on the Wiki tab.
*   **How it works:** We chunk the text content in `wiki_docs` and store vectors in PostgreSQL using `pgvector` on Neon. 
*   **The Value:** Employees can ask: *"What is our policy on client expense reimbursement?"* Gemini performs a vector query, reads the corresponding handbook content, and outputs a natural answer with reference links.

### Extension 2: Automated Receipt & Expense Scanner (AI CFO)
*   **The Feature:** Employees upload receipt photos via the PWA mobile camera.
*   **How it works:** Gemini parses the image to extract Merchant Name, Transaction Date, Currency, Total Amount, Tax, and line items.
*   **The Value:** Eliminates manual expense entry. Automatically categorizes and drafts the reimbursement ticket for approval.

### Extension 3: Helpdesk Auto-Triage & Copilot
*   **The Feature:** Auto-drafting resolutions for IT/HR support agents.
*   **How it works:** When a new ticket is opened, Gemini matches the description against past resolved tickets and wiki guides.
*   **The Value:** Drafts a helpful response and auto-assigns the ticket based on historically resolved categories.

---

## 5. Database Architecture (Entity Relationships)

Below is the database design optimized for Serverless PostgreSQL (Neon):

```mermaid
erDiagram
    EMPLOYEE ||--o{ SHIFT : logs
    EMPLOYEE ||--o{ LEAVE_REQUEST : submits
    EMPLOYEE ||--o{ TICKET : creates
    EMPLOYEE ||--o{ TICKET : assigned_to
    EMPLOYEE ||--o{ TICKET_REPLY : sends
    EMPLOYEE ||--o{ WIKI_DOC : creates
    EMPLOYEE ||--o{ ANNOUNCEMENT : posts
    TICKET ||--o{ TICKET_REPLY : contains

    EMPLOYEE {
        uuid id PK
        string email UNIQUE
        string first_name
        string last_name
        string role "employee | manager | admin"
        string department
        string status "online | offline | on_leave"
        timestamp created_at
    }

    SHIFT {
        uuid id PK
        uuid employee_id FK
        timestamp clock_in
        timestamp clock_out
        text notes
    }

    LEAVE_REQUEST {
        uuid id PK
        uuid employee_id FK
        string leave_type "sick | casual | annual"
        date start_date
        date end_date
        text reason
        string status "pending | approved | rejected"
        uuid approved_by FK
        timestamp created_at
    }

    TICKET {
        uuid id PK
        uuid creator_id FK
        uuid assigned_id FK
        string category "IT | HR | Finance | Facility"
        string title
        text description
        string priority "low | medium | high"
        string status "open | in_progress | resolved"
        timestamp created_at
    }

    TICKET_REPLY {
        uuid id PK
        uuid ticket_id FK
        uuid sender_id FK
        text message
        timestamp created_at
    }

    WIKI_DOC {
        uuid id PK
        string title
        text content
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    ANNOUNCEMENT {
        uuid id PK
        string title
        text content
        uuid created_by FK
        timestamp created_at
    }
```

---

## 6. Security & Corporate Compliance Analysis

Self-hosting a company's internal communications, employee directories, and documents provides a major compliance advantage:

1.  **Zero-Trust Data Sovereignty:** Corporate intellectual property (SOP guides, source code setup docs, salary ranges, employee medical leaves) remains entirely inside the company's private database. There is no risk of third-party SaaS platforms leaking data or using internal conversations to train public LLM models.
2.  **GDPR & HIPAA Alignment:** Leave requests and personal profile details can be strictly localized to geographical servers (e.g., deploying Neon/AWS inside European or Indian regions) to satisfy local data residency regulations.
3.  **Audit Logs:** Every status change, clock-in, and document edit is logged with raw timestamps inside `activity_logs`, creating a clean audit trail for ISO27001 or SOC2 compliance checks.

---

## 7. Infrastructure Deployment Guide

To deploy this self-hosted system, the IT manager runs through a three-step configuration:

```
[Vercel Serverless hosting] <---> [Secure SSL Protocol] <---> [Neon Serverless DB]
                                                                     │
                                                              [Raw AWS S3 Bucket]
                                                            (For receipt/file uploads)
```

1.  **Postgres Setup:** Create a Neon.tech project, choose the nearest AWS region, and run the [schema.sql](file:///C:/Users/Nik/Desktop/POS/company-os/src/lib/schema.sql) file.
2.  **Application Hosting:** Connect the GitHub repository containing the Next.js code to Vercel. 
3.  **Environment Sync:** Populate the database connection URL (`DATABASE_URL`) inside Vercel’s Environment variables settings. Vercel automatically configures SSL/HTTPS for the custom domain.
