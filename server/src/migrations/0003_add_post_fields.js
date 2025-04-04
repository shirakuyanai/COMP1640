import { sql } from 'drizzle-orm'

export const up = async (db) => {
  await db.execute(sql`
    ALTER TABLE post
    ADD COLUMN "classId" UUID NOT NULL REFERENCES class("id"),
    ADD COLUMN "title" TEXT NOT NULL;
  `)
}

export const down = async (db) => {
  await db.execute(sql`
    ALTER TABLE post
    DROP COLUMN "classId",
    DROP COLUMN "title";
  `)
} 