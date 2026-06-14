You are building TDforge — a multi-tenant SaaS platform for US tire service shops.

TECH STACK: React + Vite frontend, Supabase (Postgres + RLS), Medusa.js commerce, Stripe Connect, Twilio SMS, Resend email, Tailwind CSS.

DESIGN SYSTEM:
- Primary color: #C0392B (deep red)
- Primary hover: #A93226
- Primary light: #F5B7B1
- Primary bg tint: #FDEDEC
- Text primary: #1A1A1A
- Text secondary: #6B7280
- Border: #E5E7EB
- Background: #FFFFFF
- Surface: #F9FAFB
- Success: #27AE60
- Warning: #F39C12
- Error: #E74C3C
- Font: Inter (body), Sora (headings)
- Border radius: 8px (cards), 6px (inputs), 4px (badges)
- Shadow: 0 1px 3px rgba(0,0,0,0.08)

MULTI-TENANCY RULE: Every database table MUST have shop_id. Every API call MUST validate shop_id from the authenticated session token — never from request payload. Row-Level Security enforced at Postgres layer.

REQUIREMENT KEYWORDS: MUST = build it now. SHOULD = include it. MAY = optional.

Every module must include: TypeScript types, Supabase schema (SQL), React components, API routes, and acceptance test outline.

MODULE PROMPTS

F1 — Tenant Onboarding and Lifecycle
Build the Tenant Onboarding and Lifecycle module for TDforge.

WHAT TO BUILD:

1. PUBLIC SIGN-UP PAGE
   - Fields: business name, owner name, email, password, plan tier selector (Starter / Pro / Enterprise)
   - On submit: create tenant record, generate unique shop_id, assign subdomain (slug from business name, e.g., acmetires.tdforge.app)
   - Block reserved subdomains: admin, api, www, support, billing, status
   - Send email verification link via Resend
   - Tenant cannot publish storefront until email is verified

2. ONBOARDING WIZARD (multi-step, shown on first login)
   Step 1: Business profile (name, legal entity, EIN encrypted, address, phone, support email)
   Step 2: Service area (ZIP codes or polygon input)
   Step 3: Business hours (per day of week, open/close times)
   Step 4: Stripe Connect payout setup (redirect to Stripe Connect onboarding)
   Step 5: Distributor connection (at least one required before publish)
   Step 6: Catalog import (auto-import from connected distributor)
   Step 7: Pricing review
   Step 8: Technician invitation (email invite)
   Step 9: Storefront publish button
   - Steps 4 and 5 are REQUIRED before publish; all others are skippable
   - Show progress indicator and estimated time per step
   - Resume from last incomplete step on subsequent logins

3. TENANT CONFIGURATION PAGE (Settings)
   - Edit all business profile fields
   - Time zone selector (US only: Eastern, Central, Mountain, Pacific, Alaska, Hawaii)
   - Holiday calendar management
   - Per-location hours (Pro/Enterprise only)

4. LIFECYCLE STATE MANAGEMENT
   States: provisioning → active → suspended_billing → suspended_admin → archived
   - suspended_billing: disable storefront + campaigns; owner retains read access
   - suspended_admin: disable ALL access; email owner with explanation + contact path
   - archived: 30-day soft delete, then permanent delete/anonymize

5. PLAN TIER MANAGEMENT (within Settings)
   - Show current plan + full plan comparison matrix
   - Upgrade: immediate effect + prorate billing
   - Downgrade: schedule for end of period + 14-day warning
   - Show "Available on Pro / Enterprise" badges on locked features (don't hide them)

6. DATA MIGRATION AND IMPORT
   - Bulk customer import via CSV/XLSX with field-mapping UI
   - Column mapping step: map source columns to TDforge fields
   - Support concatenated field splitting (e.g., "Full Name" → first + last)
   - Per-row outcome report: imported / skipped-duplicate / failed-with-reason
   - Download failed rows for correction and re-import
   - Bulk historical job/order import for analytics
   - QuickBooks Desktop import via IIF or QBXML file upload
   - Schedule imports for off-peak hours + send completion notification
   - Imports reversible within 7-day window via single rollback action

DATABASE SCHEMA:
- tenants (shop_id, name, slug, subdomain, plan_tier, lifecycle_state, email_verified, created_at)
- tenant_config (shop_id, ein_encrypted, address, phone, timezone, service_area_json, hours_json)
- import_jobs (id, shop_id, type, status, total_rows, imported, failed, created_at, rollback_available_until)
- import_rows (id, import_job_id, status, error_reason, source_data_json)

DESIGN:
- Red primary (#C0392B) for CTA buttons, active step indicators, and progress bar
- Wizard steps as a left sidebar on desktop, top stepper on mobile
- Each step card: white background, subtle shadow, red "Continue" button
- Completed steps show green checkmark; current step shows red indicator
- Import UI: drag-and-drop zone, column mapping table, results summary with red/green/yellow row counts

F2 — Identity, Roles, and Access Control
Build the Identity, Roles, and Access Control module for TDforge.

WHAT TO BUILD:

1. AUTHENTICATION
   - Email + password login (Argon2id hashing via Supabase Auth)
   - Password rules: min 12 chars OR min 10 with 3 of 4 character classes; reject known-compromised passwords (HaveIBeenPwned API check)
   - TOTP multi-factor authentication (QR code setup, backup codes)
   - MFA required for Shop Admin on Pro/Enterprise
   - Rate limiting: 5 failed attempts per 15 minutes → account lock
   - Unlock path via email verification link
   - Magic-link login for customers (P4)
   - SSO via SAML 2.0 / OpenID Connect for Enterprise tenants

2. SESSIONS AND TOKENS
   - Staff sessions: 12-hour JWT lifetime with refresh
   - Customer sessions: 30-day JWT with refresh
   - shop_id embedded in every token; validated on every request server-side
   - "Sign out everywhere" session revocation
   - Shop Admin can revoke any staff session

3. ROLES (built-in per tenant)
   Roles: Shop Admin, Manager, Dispatcher, Service Writer, Technician, Marketing, Read-Only Reporter, Bookkeeper
   - Role assignment UI: staff member list + role badges + assign/remove
   - HTTP 403 returned on unauthorized action attempts
   - Enterprise: custom role builder (compose permission sets)
   - Pro: may allow custom roles
   - Starter: built-in roles only

4. PERMISSIONS MATRIX
   Build a permissions matrix defining what each role can do:
   - Shop Admin: everything
   - Manager: all except billing settings and staff management
   - Dispatcher: job/visit management, customer view, no billing or staff
   - Technician: own assigned visits only, time tracking, photo/signature capture
   - Marketing: segments, campaigns, attribution reports only
   - Read-Only Reporter: read-only dashboard and reports
   - Bookkeeper: financial reports and invoice views only

5. MULTI-TENANT ISOLATION
   - Supabase RLS policy on EVERY table: shop_id = auth.jwt()->>'shop_id'
   - Cache keys namespaced: {shop_id}:{resource}:{id}
   - Queue payloads include shop_id validated server-side
   - Storage paths: /{shop_id}/{resource}/{filename}
   - Tenant-leak test suite (CI required check):
     * Direct DB bypass attempt
     * Forged JWT with wrong shop_id
     * Payload-supplied shop_id override attempt
     * Cache key collision attempt
     * Queue payload injection attempt

6. CUSTOMER IDENTITY
   - Customer accounts scoped to one tenant (same email = separate record per shop)
   - Guest checkout: persist order + contact + vehicle under guest_customer record
   - Guest-to-account conversion: set password post-purchase; link prior guest orders

7. AUDIT LOG
   - Log every auth event: success, failure, MFA prompt, MFA pass/fail
   - Fields: timestamp, user_id, shop_id, event_type, ip_address, user_agent, outcome
   - Append-only table; no update or delete permitted

DATABASE SCHEMA:
- users (id, shop_id, email, role, mfa_enabled, mfa_secret_encrypted, created_at)
- sessions (id, user_id, shop_id, expires_at, revoked_at)
- custom_roles (id, shop_id, name, permissions_json) [Pro/Enterprise]
- audit_log (id, shop_id, user_id, event_type, ip_address, user_agent, outcome, created_at)
- customer_accounts (id, shop_id, email, is_guest, created_at)

DESIGN:
- Login page: centered card, red "Sign In" button, subtle red focus ring on inputs
- MFA setup: QR code display with red border frame, backup codes in monospace with red copy button
- Role badges: color-coded pills (Shop Admin = red, Manager = orange, Technician = blue, etc.)
- Permissions matrix: table with red checkmarks for allowed, gray dashes for denied
- Staff list: avatar + name + role badge + "Revoke Session" button (red outline)

F3 — Storefront and Catalog
Build the Storefront and Catalog module for TDforge.

WHAT TO BUILD:

1. STOREFRONT SHELL
   - Serve each tenant's storefront at their subdomain (acmetires.tdforge.app)
   - Pro/Enterprise: serve at custom domain (configured in F12)
   - Every page renders: tenant logo, business name, contact info, hours, service area summary, trust signals (reviews, badges, photos)
   - SEO: per-page meta tags, Schema.org LocalBusiness + Product JSON-LD, sitemap.xml per tenant
   - Performance: above-fold content loads ≤2.5s on 4G
   - Responsive: usable at 360px minimum width

2. TIRE CATALOG
   - Catalog scoped per tenant (populated from distributor + local SKUs)
   - Each SKU fields: brand, model, size (width/aspect/diameter), load index, speed rating, season (all-season/summer/winter), run-flat flag, vehicle compatibility, distributor sources + per-distributor stock status, product images
   - Deduplicate SKUs across distributors; show as single product with multiple sources
   - Refresh inventory/pricing every 60 minutes; refresh on-demand when item added to cart
   - Stock labels: "In Stock" (local), "Available — ships in X days" (distributor), "Unavailable"
   - Shop Admin sets per-SKU markup (% or fixed over cost) or individual price override

3. VEHICLE SELECTOR
   - Year → Make → Model → Trim cascading dropdowns (YMMT)
   - Filter catalog to compatible tires on selection
   - Manual tire size entry (e.g., 225/65R17) as alternative
   - Persist vehicle selection across browser sessions (localStorage)
   - Associate with customer account if logged in
   - Save multiple vehicles per account; switch between them

4. SEARCH, FILTER, AND SORT
   Filters: brand, size, price range, season, speed rating, load index, fuel efficiency, treadwear rating, in-stock only
   Sort: relevance, price low→high, price high→low, brand, customer rating
   Side-by-side comparison: up to 4 tires

5. PRODUCT DETAIL PAGE
   - Images, brand/model, size + specs
   - All-in price breakdown: tires + install fee + disposal fee + tax (per-line)
   - Supplier source + ETA if not local stock
   - Primary CTA: "Add 4 to Cart" button (red)
   - Warranty/return info
   - Customer reviews: rating distribution + 3 most recent
   - If final price depends on install ZIP: show "Final price calculated at checkout"

6. LOCAL SKUs
   - Shop Admin can add local SKUs: stock quantity, cost, price, full catalog metadata
   - Auto-decrement on sale
   - Low-stock alert at configurable threshold
   - Treated as in-stock-now for booking (no distributor ETA needed)

7. CUSTOM PRODUCTS, SERVICES, AND FEES
   - Shop Admin defines custom entries: name, category, description, price type (fixed / % of cart / per-unit), unit, taxability, plan scoping, expiration duration (optional)
   - Assign to: storefront-visible, cart add-on, service add-on, or back-office-only
   - Mark as required / optional / recommended per service type
   - Per-location pricing (e.g., Location A: $5 disposal; Location B: $8)
   - Per-location tax rate override
   - Expiration-managed entitlements (e.g., "6-month road hazard warranty")
   - Inventory tracking for physical custom entries

8. MULTI-LOCATION STOREFRONT ROUTING (Pro/Enterprise)
   - Parent-brand landing page: ZIP code or geolocation input → routes to closest location
   - Routing: haversine distance from ZIP centroid to each location's centroid; tie-break by name
   - Chosen location shown prominently; option to switch with confirmation if outside service area
   - Each location's storefront: own inventory, pricing, slots, tax config
   - Both brand page and location pages SEO-distinct with per-location JSON-LD

9. VEHICLE ID: LICENSE PLATE + VIN (Pro/Enterprise)
   - License plate + state → lookup → pre-populate YMMT + engine + OEM tire size
   - VIN entry + camera-based VIN scan with OCR
   - User confirms/corrects each field before saving
   - Cache results; refreshable on demand
   - Track lookup costs per tenant

DATABASE SCHEMA:
- skus (id, shop_id, brand, model, size_width, size_aspect, size_diameter, load_index, speed_rating, season, run_flat, vehicle_compatibility_json, images_json, is_local, local_stock_qty, retail_price, cost_price)
- sku_distributor_sources (sku_id, distributor_id, stock_status, eta_days, price, last_refreshed_at)
- custom_catalog_entries (id, shop_id, name, category, price_type, price_value, taxable, visibility, expiration_days, inventory_qty)
- customer_vehicles (id, customer_id, shop_id, year, make, model, trim, vin, plate, state)
- storefront_locations (id, shop_id, name, slug, address, lat, lng, service_area_json, hours_json)

DESIGN:
- Storefront header: white background, tenant logo left, nav center, "Book Now" red CTA button right
- Catalog grid: white product cards with red "Add to Cart" button, stock badge (green/orange/gray)
- Vehicle selector: prominent gray box at top of catalog page, red "Find My Tires" button
- Filter panel: left sidebar on desktop, bottom sheet on mobile; active filters shown as red pills
- Product detail: image left, specs + price breakdown right; red "Add 4 to Cart" full-width on mobile
- All-in price table: clean rows with total row highlighted in light red (#FDEDEC) background
- Comparison table: sticky header, differences highlighted with red underline