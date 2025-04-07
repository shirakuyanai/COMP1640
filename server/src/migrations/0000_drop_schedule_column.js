import { sql } from 'drizzle-orm'

export const up = async (db) => {
  await db.execute(sql`
    ALTER TABLE class
    DROP COLUMN schedule;
  `)
}

export const down = async (db) => {
  await db.execute(sql`
    ALTER TABLE class
    ADD COLUMN schedule JSONB;
  `)
} 