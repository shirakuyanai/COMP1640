import { sql } from 'drizzle-orm'

export const up = async (db) => {
  // Create post table
  await db.execute(sql`
    CREATE TABLE post (
      "postId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId"),
      "classId" UUID NOT NULL REFERENCES class("id"),
      title TEXT NOT NULL,
      "postContent" TEXT NOT NULL,
      "postDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `)

  // Create comment table
  await db.execute(sql`
    CREATE TABLE comment (
      "commentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "postId" UUID NOT NULL REFERENCES post("postId") ON DELETE CASCADE,
      "userId" UUID NOT NULL REFERENCES "user"("userId"),
      "commentContent" TEXT NOT NULL,
      "commentDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `)

  // Create meeting table
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "meetingType" AS ENUM ('in-person', 'online');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE meeting (
      "meetingId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "classId" UUID NOT NULL REFERENCES class("id"),
      "meetingDate" TIMESTAMP WITH TIME ZONE NOT NULL,
      "meetingType" "meetingType" NOT NULL,
      "meetingNotes" TEXT,
      "meetingLink" TEXT,
      location TEXT,
      "studentAttended" INTEGER NOT NULL DEFAULT 0
    );
  `)
}

export const down = async (db) => {
  await db.execute(sql`
    DROP TABLE IF EXISTS meeting CASCADE;
    DROP TABLE IF EXISTS comment CASCADE;
    DROP TABLE IF EXISTS post CASCADE;
    DROP TYPE IF EXISTS "meetingType";
  `)
} 