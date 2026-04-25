---
name: market-research
---

# Skill: Market Research / Restaurant Data

Use this skill when working with Luxembourg restaurant data, source verification, delivery attributes, city / commune normalization, and data import.

## Rules
- Do not invent restaurant facts.
- Preserve source_name and source_url.
- Use null for missing values.
- Use needs_verification when a field requires manual checking.
- Default verification_status to pending for imported records.
- Normalize cuisine into MVP categories where possible.

## MVP cuisine categories
- Italian
- Asian
- Burger
- Kebab
- Local
- Healthy
- Indian
- Other

## Required output for data work
Return:
- import summary;
- number of records processed;
- duplicate rows skipped;
- failed rows;
- fields requiring verification;
- SQL checks if database was changed.
