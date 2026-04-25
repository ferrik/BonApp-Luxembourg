Use MASTER_PROMPT.

Task: Implement or verify tracking API.

Endpoint:
POST /api/tracking/click

Validate:
- restaurant_id exists
- event_type is allowed

Allowed event types:
- restaurant_view
- order_click
- call_click
- website_click

Insert into restaurant_clicks.
Do not build dashboard.
