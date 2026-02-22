# HSR Motors — LeadPulse
## Product Design Assignment | Product Specialist Role

---

## Product Overview

**Product Name:** LeadPulse by HSR Motors

**Tagline:** *Close faster. Collaborate smarter.*

**Problem Statement:** HSR Motors receives leads from multiple channels (Facebook, Google, Twitter, Website, offline events) and currently tracks them via spreadsheets — leading to poor real-time collaboration, missed follow-ups, and no visibility for business managers.

**Solution:** LeadPulse is a web-based lead management application designed for desktop, enabling the Sales Team to manage and qualify leads in real-time, and Business Managers to monitor performance through a live dashboard.

---

## User Roles

| Role | Primary Goal |
|---|---|
| Sales Executive | View, contact, and qualify leads; update lead status |
| Business Manager | View dashboard, analyze lead trends, monitor team performance |

---

## Screen Designs & Descriptions

---

### Screen 1 — Lead Listing

**Purpose:** The central hub where the Sales Team views all incoming leads across channels.

**Key UI Elements:**

- **Top Navigation Bar** — Logo (LeadPulse), nav links (Leads, Dashboard, Settings), user avatar with role label
- **Filter Bar** — Filter by Source (Facebook, Google, Twitter, Website, Offline), Status (New, Contacted, Qualified, Not Interested, Closed), Date Range picker, Search by name/phone
- **Leads Table** with columns:
  - Lead Name
  - Phone Number
  - Source (icon + label, e.g. 🟦 Facebook)
  - Car Interest (e.g. SUV, Sedan)
  - Assigned To (Sales Executive name)
  - Status (color-coded pill badge — green for Qualified, yellow for Contacted, red for Not Interested, blue for New)
  - Last Activity (relative timestamp e.g. "2 hrs ago")
  - Actions (Quick Call button, View Details button)
- **Bulk Actions Bar** — appears on row selection; options: Reassign, Change Status, Export
- **Pagination** — 25 rows per page with page controls
- **"Add Lead" button** — top right, for manually entering offline/event leads

**Automation Features:**
- 🤖 **Auto-assignment:** New leads from any source are automatically assigned to the next available sales executive using round-robin logic
- 🔔 **Smart Alerts:** If a lead has been in "New" status for more than 2 hours, it is flagged with a red clock icon and the assigned executive receives an in-app notification
- 🔁 **Real-time sync:** Table auto-refreshes every 60 seconds; live indicator dot in top bar shows connection status

---

### Screen 2 — Lead Details

**Purpose:** A deep-dive view of a single lead, accessible by clicking any row in the Lead Listing.

**Layout:** Two-column layout — Left (70%) for lead info and activity, Right (30%) for quick actions and notes.

**Left Column — Lead Profile & Timeline:**

- **Lead Header Card**
  - Name, Photo avatar (initials-based), Phone, Email, Source badge, Date added
  - Car of Interest (e.g. "Toyota Fortuner — SUV"), Budget range, Preferred test drive date
- **Activity Timeline** (chronological feed)
  - System events: "Lead created from Facebook Ad — Campaign: Diwali Offer"
  - Manual logs: "Called on 14 Feb, 11:00 AM — Interested in test drive"
  - Status changes: "Status changed from New → Contacted by Rohan S."
  - Each entry shows timestamp + user avatar

**Right Column — Actions Panel:**

- **Status Selector** — Dropdown to change lead status (New / Contacted / Qualified / Not Interested / Closed Won / Closed Lost)
- **Assign To** — Reassign lead to another executive
- **Schedule Callback** — Date + time picker with optional reminder toggle
- **Log a Call** — Free-text note + outcome selector (Answered / No Response / Call Back Later)
- **Add Note** — Rich text field for internal notes
- **WhatsApp / Call buttons** — One-click action buttons to initiate contact directly

**Automation Features:**
- 🤖 **AI Call Summary (Gen AI):** After logging a call, an optional "Summarize" button uses AI to auto-generate a brief summary from the note text and suggest a next action (e.g. "Customer is interested in a test drive — suggest scheduling one within 48 hrs")
- 📅 **Auto Callback Reminder:** If outcome is "Call Back Later," system auto-prompts to set a callback time before closing the panel
- 🔗 **Source Attribution:** Automatically pulls the originating ad campaign name and creative from the connected ad platform (e.g. DeltaX integration)

---

### Screen 3 — Lead Management

**Purpose:** An admin/manager-level screen to configure lead routing rules, manage sources, and set team assignments and SLA thresholds.

**Sections:**

**3a. Lead Sources**
- Table listing all connected sources: Facebook, Google Ads, Twitter, Website Form, Walk-in/Offline
- Toggle to enable/disable each source
- Status indicator showing last sync time and lead count from each source
- "+ Connect New Source" button (opens integration wizard)

**3b. Assignment Rules**
- Visual rule builder: "If source is [Facebook] AND car interest is [SUV] → assign to [SUV Sales Team]"
- Round-robin toggle per team
- Fallback assignment rule for unmatched leads

**3c. SLA & Alerts Configuration**
- Define response time SLA: "New leads must be contacted within [X] hours"
- Alert recipients: select team members who receive breach notifications
- Escalation rule: "If not contacted in [Y] hours → escalate to [Business Manager]"

**3d. Lead Stages Customization**
- Drag-and-drop pipeline editor to rename, reorder, or add custom stages
- Color picker for each stage badge

**Automation Features:**
- 🤖 **Webhook support:** Any new offline lead submitted via a form or event app is automatically pushed into LeadPulse via a webhook URL (shown on screen, copy-able)
- 🔄 **Duplicate Detection:** System flags leads with matching phone numbers and prompts the manager to merge or keep separate

---

### Screen 4 — Dashboard

**Purpose:** A real-time analytics view for the Business Manager to monitor lead health, team performance, and channel ROI.

**Layout:** Grid-based card dashboard

**Row 1 — KPI Summary Cards (4 cards across):**

| Card | Metric |
|---|---|
| Total Leads | Count this month + % change vs last month |
| Qualified Leads | Count + conversion rate from total |
| Avg Response Time | Time from lead creation to first contact |
| Closed Won | Revenue-generating conversions this month |

**Row 2 — Charts:**

- **Leads by Source** — Donut chart (Facebook, Google, Website, Offline, Twitter) with count + % share
- **Lead Status Funnel** — Horizontal funnel chart showing New → Contacted → Qualified → Closed Won drop-off at each stage
- **Leads Over Time** — Line chart showing daily lead volume for the past 30 days, color-coded by source

**Row 3 — Team Performance Table:**

| Sales Executive | Leads Assigned | Contacted | Qualified | Closed Won | Avg Response Time |
|---|---|---|---|---|---|
| Rohan Sharma | 42 | 38 | 22 | 9 | 1.2 hrs |
| Priya Nair | 37 | 35 | 20 | 11 | 0.9 hrs |

- Sortable by any column
- Clicking a row drills down to that executive's lead list (filtered view)

**Row 4 — Recent Activity Feed:**
- Live feed of the last 10 actions across the team (status changes, calls logged, new leads arrived)

**Automation Features:**
- 📊 **Scheduled Reports:** Business Manager can subscribe to a daily/weekly PDF email digest auto-generated from dashboard data
- 🚨 **Anomaly Alerts:** If lead volume from a source drops by more than 30% vs the 7-day average, an alert banner appears on the dashboard
- 🔍 **Natural Language Query (Gen AI):** A search bar at the top of the dashboard lets the manager type questions like *"How many leads came from Facebook last week?"* and get an instant answer pulled from the data

---

## Automation Summary

| Feature | Screen | Type |
|---|---|---|
| Round-robin auto-assignment | Lead Listing | Workflow Automation |
| Stale lead alerts (2hr SLA) | Lead Listing | Rule-based Alert |
| AI call summary + next action suggestion | Lead Details | Generative AI |
| Auto callback prompt on "Call Back Later" | Lead Details | UX Automation |
| Source attribution from ad campaigns | Lead Details | Integration (DeltaX) |
| Duplicate lead detection | Lead Management | Data Intelligence |
| Webhook for offline lead ingestion | Lead Management | Integration |
| Scheduled PDF email reports | Dashboard | Workflow Automation |
| Volume anomaly alerts | Dashboard | Rule-based Alert |
| Natural language dashboard query | Dashboard | Generative AI |

---

## Design Principles Applied

**Clarity over complexity** — Every screen has a clear primary action. Sales Executives are never more than 2 clicks away from logging a call or updating a status.

**Role-appropriate views** — Sales Executives land on the Lead Listing; Business Managers land on the Dashboard. Navigation is consistent but surfaced contextually.

**Real-time by default** — Data is never stale. Live sync indicators, auto-refreshing tables, and live activity feeds ensure the team always has the latest picture.

**Automation that assists, not overwhelms** — AI and automation features are contextual (appear when relevant) and always give the user final control.

---

## Product Name Rationale

**LeadPulse** — "Lead" directly references the core object the product manages. "Pulse" conveys real-time monitoring, team heartbeat, and the speed of response that a dealership needs to convert a warm lead before a competitor does.