import { sql } from 'drizzle-orm'

export const up = async (db) => {
  // Drop existing tables if they exist
  await db.execute(sql`
    DROP TABLE IF EXISTS comment CASCADE;
    DROP TABLE IF EXISTS post CASCADE;
  `)

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
}

export const down = async (db) => {
  await db.execute(sql`
    DROP TABLE IF EXISTS comment CASCADE;
    DROP TABLE IF EXISTS post CASCADE;
  `)
} 