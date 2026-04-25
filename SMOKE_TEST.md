# SMOKE_TEST.md

## Goal
Verify that BonApp MVP works end-to-end locally.

## Expected local URLs
Frontend:
http://localhost:5173

Backend:
http://localhost:4000

## Manual smoke test
1. Start backend.
2. Start frontend.
3. Open http://localhost:5173.
4. Choose a category: Pizza, Sushi, Burger, Kebab, Asian, or Surprise me.
5. Confirm max 3 restaurant cards are shown.
6. Open a restaurant detail page.
7. Click each CTA:
   - Order directly
   - Call
   - Website
8. Confirm no browser console errors.
9. Confirm backend does not return 500.
10. Confirm a tracking record exists.

## SQL checks
```sql
SELECT * FROM restaurant_clicks ORDER BY created_at DESC LIMIT 5;

SELECT event_type, COUNT(*)
FROM restaurant_clicks
GROUP BY event_type
ORDER BY COUNT(*) DESC;

SELECT r.name, c.event_type, c.created_at
FROM restaurant_clicks c
JOIN restaurants r ON r.id = c.restaurant_id
ORDER BY c.created_at DESC
LIMIT 10;
```

## Success criteria
- Frontend loads.
- Category selection works.
- Restaurant detail works.
- CTA click does not break the app.
- CTA click is saved in PostgreSQL.

## If smoke test fails
Fix only the failing part.
Do not refactor the full project.
