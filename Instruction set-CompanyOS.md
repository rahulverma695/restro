You are a Principal Enterprise Systems Architect and Lead Frontend Engineer. 

Your objective is to architect the core frontend chassis, global state engine, and modular routing shell for "Company OS"—a massive, all-in-one Internal Corporate Operating System. This platform aims to replace fragmented internal SaaS stacks (HR, IT ticketing, Finance, Wikis, Project Management, and Password Vaults) with a single, highly performant Progressive Web Application (PWA) designed for self-hosted enterprise deployments.

\#\#\# 1\. VISUAL DESIGN SYSTEM & BRANDING AESTHETIC  
\- \*\*The Vibe:\*\* Reject boring, corporate SaaS norms. Implement a high-value, highly energetic, and aggressive modern tech aesthetic. It must feel like an elite command center.  
\- \*\*Foundation:\*\* A premium, deep dark mode canvas (obsidians, rich charcoals, and deep slates).  
\- \*\*Accents:\*\* Use ultra-vibrant, high-contrast neon tokens (e.g., Electric Blue for primary navigation, Acid Green for positive financial/status metrics, Intense Neon Orange/Red for critical alerts and active states).  
\- \*\*Layout & UX:\*\* Maximize data density without clutter to solve human friction points instantly. Use sharp-edged containers, distinct pane splitters, subtle glassmorphism for floating overlays, and instantaneous hover/active states to emphasize raw speed and premium build quality. No empty whitespace; every pixel must serve an operational purpose.

\#\#\# 2\. CORE ARCHITECTURE & ROLE-BASED ACCESS CONTROL (RBAC)  
Implement a robust global context provider utilizing a strictly typed local-first state engine. The state must manage the \`ActiveUser\` profile and instantly arbitrate UI rendering based on 4 strict roles:  
\- \*\*SuperAdmin:\*\* Universal access. Can view global ledgers, system settings, Vault root, and assign roles.  
\- \*\*HR Admin:\*\* Access to all employee profiles, salary data, ATS, and company-wide leave balances.  
\- \*\*Manager:\*\* Access restricted to their specific Department Node (viewing data, leave requests, and OKRs only for their direct reports).  
\- \*\*Employee:\*\* Can only view their own profile, their personal metrics, global directory, and public wikis.

\#\#\# 3\. MASTER APPLICATION SHELL & GLOBAL ROUTING  
Construct a "Modular Monolith" layout featuring a persistent, collapsible Left-Hand Command Sidebar that handles switching between 10 distinct Internal Suites with zero page reloads. 

\*\*SUITE 1: HR & People Operations\*\*  
\- \*\*Geofenced Check-in:\*\* Dashboard widget to Clock In/Out, logging timestamps and location.  
\- \*\*Leave Engine:\*\* Visual balance rings (Sick, Casual) and a calendar picker for requests, routing to the Manager's approval queue.  
\- \*\*Org Directory:\*\* An interactive, draggable org chart tree. Clicking a card opens a sliding drawer with contact info, current status, and assigned hardware.

\*\*SUITE 2: IT & Operations Service Desk\*\*  
\- \*\*Ticketing Queues:\*\* Employees raise categorized requests (IT, HR, Facility).   
\- \*\*Resolution Workspace:\*\* Dual-pane layout for agents. Left column lists open tickets sorted by SLA countdown. Right column displays a threaded chat UI for resolution, attachments, and status toggles.  
\- \*\*Shift Handovers:\*\* Forced prompt for 24/7 roles to leave handover notes when clocking out.

\*\*SUITE 3: Financial & Expense Ledger\*\*  
\- \*\*Receipt Capture:\*\* UI for uploading receipt images, inputting amounts/categories, and submitting for Finance Admin approval.  
\- \*\*Vendor Tracker:\*\* Dashboard tracking third-party software subscriptions, monthly costs, renewal dates, and assigned internal owners.

\*\*SUITE 4: Knowledge Base & Async Comms\*\*  
\- \*\*Company Wiki:\*\* A nested folder system for SOPs and policies featuring a clean Markdown renderer. Read-only for employees, editable by Admins.  
\- \*\*Global Notice Board:\*\* High-priority pinned announcements on the main dashboard requiring a forced "I acknowledge" click from users.

\*\*SUITE 5: Project & Work Management\*\*  
\- \*\*Agile Kanban:\*\* Drag-and-drop task boards (To Do, In Progress, Done) with priority tags and assignees.  
\- \*\*Time-to-Task Tracking:\*\* "Start Timer" buttons on individual project cards to log exact billable hours.  
\- \*\*Gantt Visualizer:\*\* Chronological timeline view for department leads to track overlapping project dependencies.

\*\*SUITE 6: Performance & OKRs\*\*  
\- \*\*Company Goals:\*\* Visual progress bars linking top-level company OKRs to individual department targets.  
\- \*\*360-Review Engine:\*\* Radar chart visualizations aggregating peer, self, and manager ratings.  
\- \*\*1-on-1 Logs:\*\* Private, persistent threaded notes between an employee and their manager for weekly coaching.

\*\*SUITE 7: Facility & Resource Booking\*\*  
\- \*\*Room Booking:\*\* Visual timeline calendar to reserve physical meeting rooms, strictly preventing double-booking.  
\- \*\*Desk Hoteling:\*\* Interactive office floor plan map for hybrid employees to click and reserve a physical desk for the day.

\*\*SUITE 8: Automated Onboarding Pipelines\*\*  
\- \*\*Provisioning Checklists:\*\* Sequential workflow triggers when a candidate is marked "Hired" (e.g., auto-generating an IT ticket for a laptop, an HR ticket for payroll).  
\- \*\*Training Tracker:\*\* Checklist of mandatory Wiki SOPs new hires must read and check off during week one.

\*\*SUITE 9: Secure Vault & Credentials\*\*  
\- \*\*Role-Locked Vault:\*\* Encrypted database table displaying masked shared passwords (e.g., team social media logins) based strictly on RBAC department tags.  
\- \*\*One-Click Copy:\*\* Action button to copy passwords to the clipboard without revealing plain text on the screen.

\*\*SUITE 10: Admin Command Center\*\*  
\- \*\*Custom Field Generator:\*\* UI for SuperAdmins to dynamically inject new data fields (Text, Dropdown) into all global employee profiles.  
\- \*\*System Audit Logs:\*\* Read-only, heavily restricted timestamped ledger tracking every state change, ticket assignment, and document edit across the OS.

\#\#\# 4\. EXECUTION INSTRUCTIONS  
Generate the exact directory tree required to cleanly house these 10 micro-apps. Scaffold the state architecture, the master routing shell, and the RBAC wrappers. Fully build the highly interactive UI components for the Main Dashboard, the Helpdesk Split-View, and the Kanban Board to establish the design system baseline. Ensure all code is production-ready, heavily modularized, and strictly styled using Tailwind CSS utility classes.  
