Build the Booking and Parts-Aware Scheduling module for TDforge.

WHAT TO BUILD:

1. SERVICE TYPES
   - Shop Admin defines service types: name, default duration, default price, skill required, online-bookable flag
   - Mark as Parts-Install (requires parts) or No-Parts (rotation, balance)
   - Duration can vary by vehicle attribute (e.g., dual-rear-wheel trucks take longer)

2. TECHNICIAN AVAILABILITY
   - Track per-technician: working hours (per day of week), assigned service area, skill set, time-off
   - Exclude: time-off, lunch breaks, prior-booked visits
   - Per-technician booking buffers (travel time before, cleanup after) per service type
   - Mark technicians as customer-facing bookable vs. internal dispatch only

3. PARTS-AWARE SLOT COMPUTATION (core brain)
   Compute bookable slots as intersection of:
   - Service type duration
   - Technician availability
   - Shop business hours
   - Service area validity for customer address
   - Parts availability: for each tire in cart → resolve supplier source → get ETA → add per-(shop, supplier) safety buffer
   
   Rules:
   - Show minimum 14 days of slots; should show 30 days if available
   - Recompute slots ≤60 seconds before presenting (never stale)
   - Performance: ≤1.5s at p95 cold cache; ≤400ms at p95 warm cache
   
4. BOOKING LIFECYCLE
   Visit record: visit_id, shop_id, customer_id, service_type, scheduled_start, scheduled_end, technician_id, service_address, vehicle, parts_required, parts_status, visit_state
   
   Visit states (in order): scheduled → parts_pending → parts_ready → en_route → on_site → in_progress → completed / no_show / cancelled
   
   - Auto-transition parts_pending → parts_ready on distributor arrival webhook
   - Reschedule by Staff: recompute parts ETA; surface conflicts before confirming; notify customer within 60 seconds

5. MANUAL BOOKING (back-office)
   - Dispatcher+ creates booking on customer's behalf (phone-in)
   - Can override parts-aware constraints with confirmation prompt; override logged
   - Payment: Stripe Terminal, Tap to Pay on iPhone/Android, manual card entry, or marked-as-paid-offline

6. CUSTOMER-SIDE RESCHEDULING AND CANCELLATION
   - Customer views upcoming appointments in account portal
   - Reschedule within shop-configured window (default 24h); outside window requires staff approval
   - Cancel within cancellation window per shop policy
   - Refund per policy; no auto-refund outside policy without staff

7. ADD-ON SERVICES, DURATIONS, AND TRAVEL TIME
   - Add-ons attach to primary service: additive duration + price
   - Duration configurable per location (e.g., Location A: 60 min M&B; Location B: 120 min)
   - Duration varies by quantity (1-tire M&B = 20 min; 4-tire = 60 min)
   - Add-ons presented at checkout as opt-in; effect on slot + price shown before commitment
   - Standard travel-time allowance per location for mobile visits (between consecutive visits)
   - Smart travel-time: compute from actual distance between consecutive addresses; fallback to standard on failure
   - Duration breakdown (primary + add-ons + travel) shown to staff + tech

8. SMART JOBS / CANNED JOB TEMPLATES
   - Shop Admin defines job templates: name, parts/SKUs + qty, labor time, price, recommended add-ons, vehicle filters
   - Templates presented to Service Writer/Dispatcher on estimate/booking creation; one-action pre-fill
   - User customizes after selection; template unchanged
   - Tires pack defaults: "4-tire install with M&B", "Single tire replacement", "Rotation", "TPMS reset", "Mobile flat repair"

9. PER-LOCATION SMART CALENDAR (Pro/Enterprise)
   - Working hours per location per day: open/closed, open/close time, breaks, split-shift
   - Access policy per window: retail-only, fleet-only, or mixed
   - Designate specific days/dates as fleet-only
   - Seasonal profiles with date ranges
   - Ad-hoc closures with flag for existing bookings
   - Changes propagate to slot computation within 60 seconds

10. TIME-SLOT BOOKING MODEL (Pro/Enterprise)
    - Two models per service type per location: precise-slot (exact time) OR time-slot (window)
    - Time-slot mode: define windows (e.g., "Morning 9am–11am", "Afternoon 2pm–5pm") with max job count
    - Smart capacity: max jobs computed from cumulative durations vs. available tech-hours
    - Customer sees: window label + remaining capacity (e.g., "2 spots remaining")
    - Customer notification: "Your technician will arrive within this window; we'll text 30 min before"
    - Hybrid: different service types can use different models in same location

11. CUSTOMER HUB (Self-Service Portal)
    All in one place:
    - Upcoming appointments (with reschedule/cancel)
    - Service history with photos + notes
    - All invoices + receipts (download as PDF)
    - Approved/declined/deferred recommendations
    - All vehicles with per-vehicle service history
    - Active warranties + expiration dates
    - Active service plans + entitlement balances
    - Payment methods management
    - Communication history (SMS thread)
    - Notification preferences (opt-ins)
    - Full account data export on demand

DATABASE SCHEMA:
- service_types (id, shop_id, name, duration_minutes, price, requires_parts, online_bookable, skill_required)
- technician_availability (id, shop_id, technician_id, day_of_week, start_time, end_time)
- technician_timeoff (id, technician_id, date_from, date_to)
- visits (id, shop_id, customer_id, service_type_id, scheduled_start, scheduled_end, technician_id, service_address, vehicle_id, parts_status, visit_state, created_at)
- visit_addons (id, visit_id, addon_service_id, duration_minutes, price)
- bookable_slots_cache (id, shop_id, location_id, slot_start, slot_end, technician_id, available, parts_eta_date, cached_at)
- calendar_windows (id, shop_id, location_id, day_of_week, start_time, end_time, segment_access, window_type)
- job_templates (id, shop_id, name, service_type_id, parts_json, labor_minutes, price, vehicle_filters_json)

DESIGN:
- Slot calendar: month view with available days highlighted in red; day view shows time slots as chips
- Available slot: white chip with red border on hover; selected slot: filled red chip
- Time-slot windows: large clickable cards (Morning/Afternoon/Evening) with capacity indicator ("2 spots left" in red)
- Add-on services: checkbox cards at checkout; selecting one updates duration + price in real time
- Customer Hub: clean dashboard with sidebar nav; active appointments card has red left border accent
- Reschedule: modal with calendar; shows new ETA + any parts conflict warning in amber