F4 — Cart, Checkout, and Payment
Build the Cart, Checkout, and Payment module for TDforge.

WHAT TO BUILD:

1. CART
   - Quantities: 1, 2, or 4 tires only (no sets of 3)
   - Per line: SKU image, name, quantity, unit price, line total, supplier, ETA if not local
   - Running total: tires subtotal, install fee, disposal fee, taxes, discounts, grand total
   - Persist across sessions (logged-in); 24 hours for guests via cookie
   - Revalidate prices + availability immediately before checkout; surface any change to customer
   - Promo/discount code input: validate expiration, usage limits, minimum cart value

2. CHECKOUT FLOW (on tenant's domain — no external redirects)
   - Collect: customer contact (name, email, phone), service address, vehicle, payment, install slot
   - Guest checkout: no account creation required
   - Tax estimate based on install address ZIP; recompute on address change
   - All required fields filled before "Pay Now" button activates

3. SOFT-HOLD MECHANICS
   - On slot selection: create soft-hold record (15-minute window, not configurable)
   - Slot shows as unavailable to all other concurrent shoppers
   - Soft-hold expires automatically; slot returns to availability; no customer penalty
   - Convert soft-hold to firm Visit record on successful payment
   - If soft-hold expires during payment: refund + show next available slot

4. PAYMENT PROCESSING (Stripe Connect)
   - Credit/debit, Apple Pay, Google Pay
   - Raw card data NEVER touches TDforge servers (Stripe hosted elements)
   - 3-D Secure (SCA) supported without abandoning cart
   - Human-readable error messages (not raw processor codes)
   - Tag every payment: order ID, cart, customer, vehicle, booking slot

5. ORDER CONFIRMATION
   - Confirmation page: order number, items, total paid, install slot, address, ICS calendar download
   - Confirmation email within 60 seconds (Resend)
   - Confirmation SMS within 60 seconds (Twilio, if consent granted)
   - Notification to shop (dispatcher / shop admin) within 60 seconds

6. REFUNDS AND ADJUSTMENTS
   - Full + partial refunds by Shop Admin / Manager / Dispatcher
   - Reason capture required; audit logged
   - Process via Stripe Refunds; update order ledger
   - Configurable: auto-release slot on refund or retain at staff discretion
   - Notify customer within 60 seconds via email + SMS

7. CONSUMER FINANCING (Affirm, Snap Finance, Synchrony)
   - Show financing options when cart meets eligibility threshold
   - Per-location enable/disable for each provider
   - Branded redirect to provider → return to storefront on approval/decline
   - Cart/vehicle/slot preserved across redirect
   - On approval: same flow as card payment
   - Payment method recorded as financing provider in reports

8. ADDITIONAL PAYMENT METHODS (PayPal, Venmo, PayPal Pay Later)
   - Present alongside card/Apple Pay/Google Pay
   - Per-location configuration for which methods appear

9. SPLIT TENDER
   - Single order paid by multiple methods (e.g., $300 card + $200 financing)
   - Per-channel configuration (online vs. in-shop)
   - Each tender tracked individually (authorized / captured / refunded); reconciles against order total

10. CONFIGURABLE DEPOSITS vs. FULL PAYMENT
    - Options: full prepayment, percentage deposit at booking (0–100%), book-now-pay-later
    - Configurable per service type; defaults to shop-wide policy
    - Balance auto-presented at visit completion via PWA or customer payment link
    - Deposit/balance amounts shown at cart, checkout, confirmation, reminders, invoice

11. MANAGER-OVERRIDE DISCOUNTS
    - Configurable threshold beyond which Manager/Shop Admin approval required
    - In-app approval with reason; audit log: requester, approver, discount, reason, order ID, timestamp
    - Override events in dedicated report for periodic review

12. GOOD-BETTER-BEST ESTIMATE PRESENTATION
    - 3 pre-configured option packages shown side-by-side in estimates
    - Shop Admin defines per service type: name, inclusions, price, value highlights, recommended indicator
    - One-tap customer selection updates estimate in single action; further customization allowed
    - Track package presented vs. selected; per-package conversion metrics in reports

13. CALL-OUT FEE / TRIP CHARGE
    - Shop Admin configures per-location: fee name, amount, taxability, visibility rules
    - Trigger: minimum cart subtotal threshold AND/OR service-type-based rules
    - Per-service-type: always-exempt, always-charges, or trigger-by-rule
    - Displayed in cart with plain-language explanation; customer cannot remove
    - Per-order waiver with audit (reason + actor + timestamp)
    - Distance/zone escalating charges (e.g., ≤10 miles: $50; 10–25 miles: $100)
    - Fleet Accounts with pre-agreed pricing may have call-out fee waived
    - Call-out fee revenue reported separately in F11 financial reports

DATABASE SCHEMA:
- carts (id, shop_id, customer_id, session_token, lines_json, promo_code, expires_at)
- soft_holds (id, shop_id, slot_id, customer_session, expires_at, converted_to_visit_id)
- orders (id, shop_id, customer_id, cart_id, visit_id, status, subtotal, install_fee, disposal_fee, tax, discount, total, created_at)
- order_payments (id, order_id, method, provider, amount, status, stripe_payment_intent_id)
- refunds (id, order_id, amount, reason, initiated_by, created_at)
- call_out_fees (id, shop_id, location_id, name, amount, trigger_type, threshold_amount, taxable)

DESIGN:
- Cart: right-side slide-over panel on desktop; full-page on mobile
- Line items: product image thumbnail + name + qty stepper + price; red remove button
- Price breakdown table: clean rows, total row with red bold text
- Checkout: 2-column on desktop (left: form steps, right: order summary sticky)
- "Pay Now" button: full-width red (#C0392B), disabled state gray until all fields filled
- Financing options: card grid with provider logo, monthly estimate, "Apply" outline red button
- Good-Better-Best: 3-column cards; "Best" card with red border + "Recommended" red badge
- Call-out fee: amber/yellow disclosure banner in cart with info icon + plain-language text
- Soft-hold timer: subtle countdown in slot selection step ("Slot held for 14:32")
