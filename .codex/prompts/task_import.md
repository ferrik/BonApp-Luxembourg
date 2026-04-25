Use MASTER_PROMPT.

Task: Import restaurants from JSON.

Input:
DATA_SEED.json or restaurants.json

Requirements:
- Map fields to DATA_SCHEMA.md.
- Use null for missing values.
- Default verification_status to pending.
- Preserve source_name and source_url.
- Make importer idempotent.
- Avoid duplicates with name + city or name + address.
- Output import summary.

After import, run summary SQL queries from IMPLEMENTATION_PROMPTS.md.
