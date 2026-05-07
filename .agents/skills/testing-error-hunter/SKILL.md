---
name: testing-error-hunter
description: How to set up and test the Error Hunter feature locally, including required credentials, database setup, and data validation.
---

# Testing Error Hunter

## Prerequisites

1. **PostgreSQL** — required by Prisma ORM
   - Start via Docker: `docker run -d --name learnielts-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=web_ielts -p 5432:5432 postgres:15-alpine`
   - Set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web_ielts?schema=public"` in `.env`

2. **Clerk Auth** — required for the dev server to start
   - Needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env`
   - Without valid Clerk keys the dev server exits immediately
   - Ask the user for these credentials if UI testing is needed

3. **Prisma Client** — must be generated before build/dev
   - Run: `npx prisma generate`
   - Run migrations: `npx prisma migrate dev` (requires running PostgreSQL)

## Data Validation (No Credentials Needed)

Passage JSON files can be validated without running the app:
- All passages are in `data/error-hunter/pack-units-*/`
- Tips are in `app/exercises/error-hunter/data/ielts-tips.json`
- Grammar rules in `app/exercises/error-hunter/data/grammar-rules.json`

Key validation checks:
- Every passage must have `totalErrors` matching the length of `errors` array
- Every error's `passageText[startIndex:endIndex]` must equal `errorText`
- Every false alarm zone's `passageText[startIndex:endIndex]` must equal `text`
- Valid `taskType`: WRITING_TASK2, SPEAKING_PART2, SPEAKING_PART3
- Valid `difficulty`: STARTER, INTERMEDIATE, ADVANCED
- Valid `errorType`: ARTICLE, TENSE, SVA, PREPOSITION, WORD_FORM, SENTENCE_STRUCTURE, PUNCTUATION, SINGULAR_PLURAL, COLLOCATION, PRONOUN, MODIFIER, COMPARATIVE

## Running the App

```bash
npm install
npx prisma generate
npm run dev
```

Navigate to `/exercises/error-hunter?packId=pack-units-1-2` to test.

## Seeding Data

To seed grammar rules and tips into the database:
```bash
npx tsx app/exercises/error-hunter/data/seed-grammar-and-tips.ts
```

Use `--dry-run` to validate without writing to DB.
