Build the Tenant Onboarding and Lifecycle module for FB Business Connect.

FB Business Connect is a multi-tenant, multi-industry field-service + commerce SaaS platform.
The engine is trade-agnostic. Industry packs (Tires, HVAC, Lawn Care, Pest Control,
Painting, Roofing, Plumbing, etc.) plug into the engine. Onboarding must work for
ANY industry — not just tire shops.

═══════════════════════════════════════════════════════════
STEP 1 OF ONBOARDING — BUSINESS TYPE SELECTION
═══════════════════════════════════════════════════════════

The very first screen after email verification is a Business Type Selector.
This is the most important UX decision in the entire onboarding flow.
It determines which industry pack is activated, which service pattern is used,
which catalog schema loads, and which default templates appear throughout the platform.

Show a visual grid of industry cards. Each card has:
- Icon (industry-relevant illustration)
- Industry name
- One-line description of what FB Business Connect does for them
- "Coming Soon" badge for packs not yet live

AVAILABLE AT LAUNCH (active):
┌─────────────────────────────────────────────────────────┐
│  🔧  Mobile Tire Service                                │
│      Sell tires, book parts-aware installs,            │
│      dispatch technicians to customer locations        │
├─────────────────────────────────────────────────────────┤
│  🔧  In-Shop Tire Service                               │
│      Tire retail + service bay management,             │
│      walk-in and appointment-based installs            │
└─────────────────────────────────────────────────────────┘

COMING SOON (visible but locked — show with "Notify Me" CTA):
┌───────────────────┬───────────────────┬─────────────────┐
│ ❄️  HVAC          │ 🌿  Lawn Care     │ 🐛  Pest Control│
│ Install, repair,  │ Mowing, aeration, │ Recurring route,│
│ maintenance plans │ seasonal programs │ chemical mgmt   │
├───────────────────┼───────────────────┼─────────────────┤
│ 🎨  Painting      │ 🏠  Roofing       │ 🔩  Plumbing    │
│ Quote-to-job,     │ Inspect-quote-job,│ Parts-install + │
│ phase management  │ material tracking │ on-demand jobs  │
├───────────────────┼───────────────────┼─────────────────┤
│ ⚡  Electrical    │ 🧹  Cleaning      │ 🏊  Pool Service│
│ Code compliance,  │ Recurring route,  │ Chemical logs,  │
│ permit tracking   │ team dispatch     │ seasonal plans  │
└───────────────────┴───────────────────┴─────────────────┘

BOTTOM: "Don't see your industry? → Tell us what you do" (opens a short form
that captures: industry name, services offered, average job size, team size.
This feeds the product roadmap for future industry packs.)

On selection of an active industry:
- Store selected industry_pack on the tenant record
- Store selected service_pattern (Parts-Install for Tires; will vary per future pack)
- Proceed to Step 2

═══════════════════════════════════════════════════════════
STEP 2 — BUSINESS PROFILE
═══════════════════════════════════════════════════════════

Fields adapt slightly by industry but core fields are universal:

UNIVERSAL FIELDS (all industries):
- Business name (legal)
- Display / trading name (what customers see on the storefront)
- Business type: Sole Proprietor / LLC / Corporation / Partnership
- EIN / Tax ID (encrypted at rest)
- Primary business address
- Mailing address (if different)
- Primary phone number
- Support/customer-facing email
- Business website (optional; used in storefront footer)
- Year established (optional; used as trust signal on storefront)

INDUSTRY-ADAPTIVE FIELDS:
- Tires (Mobile): Primary warehouse address (where trucks depart from)
- Tires (In-Shop): Number of service bays
- HVAC (future): Refrigerant handler certification number
- Lawn Care (future): State applicator license number
- Pest Control (future): State pest control license number
- Roofing (future): Contractor license number, bonding/insurance details
- All others: License number (optional, labeled per industry)

TEAM SIZE QUESTION (used to recommend plan tier):
"How many people work in your business?"
○ Just me
○ 2–5 people
○ 6–20 people
○ 21–50 people
○ 50+ people

Based on team size answer, softly recommend a plan tier at end of wizard:
- Just me / 2–5: Suggest Starter
- 6–20: Suggest Pro
- 21+: Suggest Enterprise (with "Talk to Sales" CTA)

═══════════════════════════════════════════════════════════
STEP 3 — SERVICE AREA AND OPERATIONS TYPE
═══════════════════════════════════════════════════════════

OPERATIONS TYPE (critical for scheduling logic):
"How do you deliver your service?"

○ Mobile / On-site  — We go to the customer's location
   (Activates: GPS tracking, truck inventory, travel-time allowance,
    mobile inspection template, call-out fee logic)

○ In-Shop / Fixed location — Customers come to us
   (Activates: service bay management, walk-in queue,
    in-shop inspection template)

○ Both — We offer mobile and in-shop service
   (Activates both sets of features; Shop Admin configures per service type)

SERVICE AREA DEFINITION (shown for Mobile and Both):
- Service by ZIP codes: enter ZIP codes or upload CSV
- Service by radius: enter center address + radius in miles
- Service by drawn polygon: map-based draw tool
- Can configure different service areas per location later

LOCATION COUNT:
"How many locations do you operate from?"
○ 1 location (single base/shop)
○ 2–5 locations
○ 6–20 locations
○ 20+ locations (franchise / chain)

If >1 location:
- Unlock multi-location features in UI
- Prompt to add location details (name, address, hours) — can be done now or skipped + done later
- For 20+ locations: surface "Enterprise recommended" callout with "Talk to Sales"

═══════════════════════════════════════════════════════════
STEP 4 — BUSINESS HOURS
═══════════════════════════════════════════════════════════

UNIVERSAL:
- Per-day-of-week toggle (open/closed) + open/close time
- Lunch/break windows
- Time zone (US only in v1: Eastern, Central, Mountain, Pacific, Alaska, Hawaii)

INDUSTRY-ADAPTIVE PROMPTS:
- Tires / HVAC / Plumbing: "Do you offer emergency / after-hours service?"
  → Yes → configure after-hours surcharge (maps to F4.12 call-out fee or service-type override)
- Lawn Care / Pest Control: "Do you offer weekend service?"
  → Sets calendar accordingly
- All: "Do you serve fleet/commercial customers outside regular hours?"
  → Yes → activates fleet-only calendar windows (F5.9.2)

Holiday calendar:
- Pre-populated with US federal holidays
- Add custom holidays

═══════════════════════════════════════════════════════════
STEP 5 — PAYOUT SETUP (REQUIRED BEFORE PUBLISH)
═══════════════════════════════════════════════════════════

UNIVERSAL — same for all industries:
- Stripe Connect onboarding
- Explain: "Your customers pay through your storefront.
  FB Business Connect deposits the money directly into your bank account,
  minus a small platform fee."
- Show fee structure for selected plan tier
- Launch Stripe Connect flow (Express or Standard)
- On return: show payout account confirmed ✓

Cannot publish storefront until this step is complete.

═══════════════════════════════════════════════════════════
STEP 6 — CATALOG / INVENTORY SETUP
(INDUSTRY-ADAPTIVE — this is where packs diverge most)
═══════════════════════════════════════════════════════════

Show different content per industry_pack:

── TIRES (MOBILE / IN-SHOP) ──────────────────────────────
"Where do you source your inventory?"

○ From distributors (ATD, TireHub, or other)
   → Connect distributor account
   → Auto-import catalog
   → Required before storefront publish

○ I buy and stock my own tires locally
   → Add tires manually OR import via CSV
   → Set stock quantities and prices

○ Both (distributor + local stock)

Required: at least one distributor connected OR at least one local SKU added before storefront publish.

── HVAC (FUTURE PACK) ────────────────────────────────────
"What equipment and parts do you commonly work with?"
- Equipment brands (Carrier, Trane, Lennox, etc.) — multi-select
- Parts sourcing: wholesale supplier connections or manual entry
- Common service types (installation, repair, maintenance, tune-up)
- Flat-rate pricing book or time-and-materials

── LAWN CARE (FUTURE PACK) ───────────────────────────────
"What services do you offer?"
- Mowing / edging / trimming
- Fertilization programs
- Aeration / overseeding
- Seasonal cleanup
- Pricing model: per-visit flat rate, per-square-foot, or seasonal contract

── PEST CONTROL (FUTURE PACK) ────────────────────────────
"What pest control services do you offer?"
- Residential general pest
- Termite treatment
- Rodent control
- Mosquito programs
- Chemical products used (for compliance logging)

── PAINTING (FUTURE PACK) ────────────────────────────────
"What painting services do you offer?"
- Interior / exterior / commercial
- Pricing model: per-square-foot, fixed quote, time-and-materials
- Materials sourcing (Sherwin-Williams, Benjamin Moore account)

── GENERIC / UNKNOWN INDUSTRY ────────────────────────────
If industry is not yet in the pack list:
- "Tell us about your services" — free-form service list builder
  (name, description, price, duration)
- "Do you use physical parts or materials in your work?"
  → Yes → basic catalog setup with manual SKU entry
  → No → service-only setup (no inventory management)

═══════════════════════════════════════════════════════════
STEP 7 — SERVICE TYPES SETUP
(ADAPTIVE — seeded by industry pack; customizable by shop)
═══════════════════════════════════════════════════════════

Show pre-seeded service types for the selected industry.
Shop Admin can edit, remove, or add new ones.

TIRES (MOBILE) — Pre-seeded service types:
✓ 4-Tire Installation (with M&B) — 90 min — Parts-Install
✓ 2-Tire Installation (with M&B) — 60 min — Parts-Install
✓ Single Tire Replacement — 30 min — Parts-Install
✓ Tire Rotation — 30 min — No-Parts
✓ TPMS Reset — 15 min — No-Parts
✓ Mobile Flat Repair — 45 min — Parts-Install
✓ Battery Replacement — 30 min — Parts-Install
✓ Oil Change — 45 min — Parts-Install

HVAC (FUTURE) — Pre-seeded:
✓ AC Installation — 4 hrs — Parts-Install
✓ Furnace Installation — 3 hrs — Parts-Install
✓ AC Tune-Up — 1 hr — No-Parts
✓ Emergency Repair — 2 hrs — Parts-Install
✓ Filter Replacement — 30 min — Parts-Install

LAWN CARE (FUTURE) — Pre-seeded:
✓ Lawn Mowing (up to 5,000 sq ft) — 1 hr — No-Parts
✓ Fertilization Treatment — 45 min — Parts-Install
✓ Aeration — 1.5 hrs — No-Parts
✓ Overseeding — 2 hrs — Parts-Install

PEST CONTROL (FUTURE) — Pre-seeded:
✓ General Pest Treatment — 1 hr — No-Parts
✓ Termite Inspection — 1.5 hrs — No-Parts
✓ Rodent Control Setup — 1 hr — Parts-Install

GENERIC (unknown industry):
- Empty list; Shop Admin adds service types manually
- Helper text: "Add the services you offer. Each service can have a price,
  duration, and any parts/materials required."

Each service type shows:
- Name, default duration, default price, service pattern badge (Parts-Install / No-Parts)
- Quick-edit inline before proceeding

═══════════════════════════════════════════════════════════
STEP 8 — PRICING AND FEES
(ADAPTIVE)
═══════════════════════════════════════════════════════════

UNIVERSAL:
- Review / confirm prices for each service type from Step 7
- Set default tax rate (or connect to Stripe Tax for automatic)
- Configure disposal fees if applicable (industry-adaptive label):
  * Tires: "Tire disposal fee per tire" (default $5–$10)
  * HVAC: "Refrigerant disposal fee"
  * Pest Control: "Chemical disposal fee"
  * Others: "Material disposal fee" (optional)

MOBILE OPERATIONS (if Mobile or Both selected in Step 3):
- Configure call-out fee / trip charge:
  "Do you charge a trip fee when a customer doesn't buy enough to cover dispatch costs?"
  ○ Yes → set fee amount + trigger threshold (e.g., "apply $75 fee if cart subtotal < $250")
  ○ No (I include it in my service pricing)
  → If yes: configure per-zone distance escalation option

DEPOSIT POLICY:
"When do you collect payment?"
○ Full payment upfront at booking (simplest)
○ Deposit at booking, balance at completion (enter deposit %)
○ Full payment at completion only (no upfront charge)

═══════════════════════════════════════════════════════════
STEP 9 — TEAM SETUP
═══════════════════════════════════════════════════════════

UNIVERSAL:
"Invite your team members"
- Enter name + email + role for each team member
- Role selector: Manager / Dispatcher / Technician / Service Writer / Marketing / Bookkeeper
- Team member receives email invite with onboarding link
- Can skip and invite later

TECHNICIAN SETUP (if at least one Technician role added):
For each technician:
- Working hours (defaults to shop hours; can customize)
- Skill set (from industry-adaptive list):
  * Tires: tire installation, TPMS, alignment, balancing
  * HVAC: AC installation, furnace, heat pump, refrigerant certified
  * Lawn Care: mowing, fertilization, aeration, pesticide licensed
  * Generic: free-text skill tags
- Service area (defaults to shop service area; can customize per tech)
- Vehicle/truck assigned (optional)

═══════════════════════════════════════════════════════════
STEP 10 — STOREFRONT BRANDING
═══════════════════════════════════════════════════════════

UNIVERSAL (all industries):
- Upload logo (light + dark variant)
- Choose primary brand color (color picker; default shows #C0392B red as example)
- Tagline / headline (shown on storefront hero)
- Short business description (shown on storefront About section)
- Service area summary text (shown on storefront; e.g., "Serving the greater Austin area")
- Upload hero image or select from stock library (industry-filtered)
- Preview: live storefront preview updates in real time on the right panel

SUBDOMAIN CONFIRMATION:
"Your storefront will be live at:"
→ [business-name].fb-business-connect.app
"You can connect your own domain (e.g., www.yourbusiness.com) after publishing. [Pro/Enterprise]"

═══════════════════════════════════════════════════════════
STEP 11 — REVIEW AND PUBLISH
═══════════════════════════════════════════════════════════

Show a summary checklist before publishing:

✓ Business profile complete
✓ Service area defined
✓ Business hours set
✓ Payout account connected (REQUIRED)
✓ Catalog / inventory set up (REQUIRED — at least 1 item or service)
✓ Service types configured
✓ Pricing set
✓ Storefront branded

⚠ Optional (can be done after publish):
○ Team members invited
○ Custom domain connected [Pro/Enterprise]
○ Distributor integration complete (Tires only)
○ Marketing campaigns set up
○ Fleet accounts configured [Pro/Enterprise]

PUBLISH BUTTON:
"Your storefront is ready. Let's go live."
→ Red "Publish Storefront" button
→ On publish: lifecycle state changes from provisioning → active
→ Confetti animation + success screen showing live storefront URL
→ Next steps panel: "Here's what to do next" with 3–5 recommended actions

═══════════════════════════════════════════════════════════
WIZARD BEHAVIOR (UNIVERSAL)
═══════════════════════════════════════════════════════════

- Left sidebar on desktop shows all steps with completion status
  (✓ complete / ● current / ○ not started)
- Top stepper on mobile
- Every step is skippable EXCEPT:
  * Step 5 (Payout setup) — REQUIRED before publish
  * Step 6 (Catalog/inventory) — at least 1 item/service REQUIRED before publish
- Resume from last incomplete step on subsequent logins
- Progress saved automatically after each step
- Show estimated time per step (Step 1: 1 min, Step 2: 3 min, etc.)
- "Save and finish later" available at any step
- On first login after publish: dismiss wizard; show operational dashboard

═══════════════════════════════════════════════════════════
TENANT CONFIGURATION (SETTINGS — POST-WIZARD)
═══════════════════════════════════════════════════════════

After publishing, Shop Admin can return to Settings to configure:

GENERAL:
- All business profile fields from Step 2
- Time zone, holiday calendar
- Multi-location management [Pro/Enterprise]

OPERATIONS:
- Service types (add/edit/remove)
- Technician profiles and skills
- Calendar configuration per location [Pro/Enterprise]
- Travel-time allowance per location
- Call-out fee rules per location

CATALOG:
- Industry-specific catalog management
- Distributor connections [Tires]
- Custom products, services, and fees (F3.7)
- Pricing markup rules

STOREFRONT:
- Branding (logo, colors, CSS, copy)
- Custom domain [Pro/Enterprise]
- Custom email sender domain [Enterprise]
- SEO settings per page

TEAM:
- Invite / manage staff
- Role assignments
- Commission settings [Pro/Enterprise]

BILLING:
- Current plan + upgrade/downgrade
- Payment methods
- Invoice history
- Stripe Connect status

INTEGRATIONS:
- Distributor connections [Tires]
- QuickBooks Online [Pro/Enterprise]
- Google Business Profile [Pro/Enterprise]
- Google Local Services Ads [Pro/Enterprise]
- Mailchimp / Klaviyo [Pro/Enterprise]
- Zapier connector [All tiers]
- API access [Pro/Enterprise]
- Facebook / Instagram [Pro/Enterprise]
- Consumer financing: Affirm, Snap, Synchrony [All tiers]

═══════════════════════════════════════════════════════════
DATABASE SCHEMA
═══════════════════════════════════════════════════════════

tenants (
  id uuid PRIMARY KEY,
  shop_id uuid UNIQUE NOT NULL,
  business_name text NOT NULL,
  display_name text,
  slug text UNIQUE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  industry_pack text NOT NULL,         -- 'tires_mobile' | 'tires_inshop' | 'hvac' | 'lawn_care' | 'generic' | ...
  service_pattern text NOT NULL,       -- 'parts_install' | 'recurring_route' | 'on_demand' | 'inspect_quote_job'
  operations_type text NOT NULL,       -- 'mobile' | 'inshop' | 'both'
  plan_tier text NOT NULL DEFAULT 'starter',
  lifecycle_state text NOT NULL DEFAULT 'provisioning',
  email_verified boolean DEFAULT false,
  wizard_step int DEFAULT 1,
  wizard_completed boolean DEFAULT false,
  payout_connected boolean DEFAULT false,
  catalog_seeded boolean DEFAULT false,
  storefront_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

tenant_config (
  shop_id uuid PRIMARY KEY REFERENCES tenants(shop_id),
  ein_encrypted text,
  legal_entity_type text,
  business_address_json jsonb,
  mailing_address_json jsonb,
  primary_phone text,
  support_email text,
  website_url text,
  year_established int,
  timezone text NOT NULL DEFAULT 'America/New_York',
  service_area_json jsonb,
  hours_json jsonb,
  holiday_calendar_json jsonb,
  team_size_range text,
  location_count int DEFAULT 1,
  industry_specific_config_json jsonb  -- license numbers, bay count, etc. per pack
)

industry_pack_catalog (
  id uuid PRIMARY KEY,
  pack_id text NOT NULL,               -- 'tires_mobile' | 'hvac' | 'lawn_care' etc.
  entity_type text NOT NULL,           -- 'service_type' | 'addon' | 'default_template' | 'fee'
  entity_data_json jsonb NOT NULL,
  is_active boolean DEFAULT true
)

wizard_progress (
  shop_id uuid PRIMARY KEY REFERENCES tenants(shop_id),
  step_1_complete boolean DEFAULT false,   -- industry selected
  step_2_complete boolean DEFAULT false,   -- business profile
  step_3_complete boolean DEFAULT false,   -- service area + ops type
  step_4_complete boolean DEFAULT false,   -- hours
  step_5_complete boolean DEFAULT false,   -- payout (REQUIRED)
  step_6_complete boolean DEFAULT false,   -- catalog (REQUIRED)
  step_7_complete boolean DEFAULT false,   -- service types
  step_8_complete boolean DEFAULT false,   -- pricing + fees
  step_9_complete boolean DEFAULT false,   -- team setup
  step_10_complete boolean DEFAULT false,  -- branding
  last_active_step int DEFAULT 1,
  updated_at timestamptz DEFAULT now()
)

industry_waitlist (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  industry_name text NOT NULL,
  services_description text,
  avg_job_size text,
  team_size text,
  created_at timestamptz DEFAULT now()
)

═══════════════════════════════════════════════════════════
DESIGN
═══════════════════════════════════════════════════════════

INDUSTRY SELECTOR (Step 1):
- Dark hero background with grid of industry cards
- Each card: white/light card, large industry emoji/icon, name in bold, one-line description
- Hover state: card lifts with red (#C0392B) border glow
- Selected state: red border + red checkmark badge top-right corner
- "Coming Soon" cards: slightly desaturated, locked icon overlay, "Notify Me" button instead of select
- "Don't see your industry?" row at bottom: dashed border card with plus icon

WIZARD SHELL:
- Left sidebar: vertical step list; completed steps show red checkmark circle; current step shows red filled dot; future steps show gray empty circle
- Step names visible at all times on desktop (collapsed to icons on mobile)
- Content area: white card, centered, max-width 680px
- Step header: step number in red, step title in dark bold, estimated time in gray
- "Save and continue" red primary button; "Skip for now" gray text link

OPERATIONS TYPE (Step 3):
- Three large selection cards side by side (or stacked on mobile)
- Icons: van for Mobile, building for In-Shop, split icon for Both
- Selected card: red left border + red text + light red background tint

SERVICE TYPE SEED (Step 7):
- Pre-seeded service types appear as checkable rows
- Each row: checkbox (checked by default), service name, duration, price (editable inline), pattern badge
- "Add another service type" link at bottom
- Industry badge in header: e.g., "Tires — Mobile" pill in red

STOREFRONT PREVIEW (Step 10):
- Split screen: left = form inputs, right = live preview iframe
- Preview updates instantly on color/logo/text change
- Preview shows mobile viewport by default (toggle desktop/mobile)
- Live URL shown below preview: "[slug].fb-business-connect.app" with copy button

PUBLISH SCREEN:
- Full-screen celebration: animated confetti in brand colors (red + white)
- Large green checkmark
- "Your storefront is live!" heading
- Live URL in big red text (clickable)
- "Share your storefront" quick actions: copy link, share to WhatsApp, copy to clipboard
- "What's next" card below: 3 recommended next steps (invite team / connect Google / set up first campaign)

COMING SOON INDUSTRY CARDS:
- "Notify Me" button opens inline email capture form within the card
- On submit: save to industry_waitlist table + show "We'll notify you when [industry] launches!"
- Collected emails feed directly into product launch campaigns for each future pack

═══════════════════════════════════════════════════════════
LOGIC NOTES FOR ENGINEERING
═══════════════════════════════════════════════════════════

1. industry_pack stored on tenant record drives:
   - Which catalog schema loads (F3)
   - Which service-type seeds appear (F5.1)
   - Which default inspection templates activate (F16)
   - Which distributor connector options appear (F7)
   - Which industry-specific fields appear in Settings
   - Which add-on services are pre-registered (F5.7)

2. operations_type stored on tenant drives:
   - Whether GPS tracking + truck inventory modules activate (F6.13, F6.14)
   - Whether travel-time allowance is configured (F5.7.5)
   - Whether call-out fee prompts appear (F4.12)
   - Whether mobile inspection template is the default (T12.2)
   - Whether service bay management appears (future in-shop packs)

3. service_pattern stored on tenant drives:
   - Parts-Install: parts ETA required for booking slot computation (F5.3)
   - Recurring Route (future): fixed schedule + route optimization
   - On-Demand (future): real-time dispatch without pre-booking
   - Inspect-Quote-Job (future): estimate-first, no upfront booking

4. When a "Coming Soon" industry is eventually launched:
   - Existing waitlist members receive email campaign
   - They can sign up and onboarding wizard auto-selects their industry
   - Their industry_pack, service_pattern, and operations_type are pre-set
     from the waitlist form data they submitted

5. "Generic" industry fallback (for unknown industries):
   - industry_pack = 'generic'
   - service_pattern = 'parts_install' by default (can change in settings)
   - No pre-seeded catalog; no distributor connections; manual-only setup
   - All engine features (F1–F18) are available; no pack-specific features (T1–T12)
   - Shop Admin builds their catalog from scratch using F3.7 custom products framework