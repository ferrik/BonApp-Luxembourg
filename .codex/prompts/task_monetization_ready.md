Use MASTER_PROMPT.

Task: Prepare database for future monetization without implementing payments.

Do:
- add billing_enabled field if missing
- add pricing_plan field if missing
- add restaurant_usage_daily table if missing
- keep click tracking as source of billing-ready usage data

Do not:
- implement Stripe
- implement invoices
- implement VAT
- implement checkout
- implement subscriptions
