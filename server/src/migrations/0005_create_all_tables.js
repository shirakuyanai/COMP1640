import { sql } from 'drizzle-orm'

export const up = async (db) => {
  // Create user table first as it's referenced by many other tables
  await db.execute(sql`
    CREATE TABLE "user" (
      "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "fullName" TEXT NOT NULL
    );
  `)

  // Create role and permission tables
  await db.execute(sql`
    CREATE TABLE role (
      "roleId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "roleName" TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE permission (
      "permissionId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "permissionName" TEXT NOT NULL,
      description TEXT
    );
  `)

  // Create role_permission table
  await db.execute(sql`
    CREATE TABLE role_permission (
      "roleId" UUID NOT NULL REFERENCES role("roleId"),
      "permissionId" UUID NOT NULL REFERENCES permission("permissionId"),
      PRIMARY KEY ("roleId", "permissionId")
    );
  `)

  // Create user_role table
  await db.execute(sql`
    CREATE TABLE user_role (
      "userId" UUID NOT NULL REFERENCES "user"("userId"),
      "roleId" UUID NOT NULL REFERENCES role("roleId"),
      PRIMARY KEY ("roleId", "userId")
    );
  `)

  // Create staff, student, and tutor tables
  await db.execute(sql`
    CREATE TABLE staff (
      "staffId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId")
    );

    CREATE TABLE student (
      "studentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId")
    );

    CREATE TABLE tutor (
      "tutorId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId")
    );
  `)

  // Create class table
  await db.execute(sql`
    CREATE TABLE class (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "className" TEXT NOT NULL,
      "studentId" UUID NOT NULL REFERENCES student("studentId"),
      "tutorId" UUID NOT NULL REFERENCES tutor("tutorId"),
      "startDate" TIMESTAMP WITH TIME ZONE,
      "endDate" TIMESTAMP WITH TIME ZONE,
      schedule JSONB
    );
  `)

  // Create conversation and message tables
  await db.execute(sql`
    CREATE TABLE conversation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "tutorId" UUID NOT NULL REFERENCES "user"("userId"),
      "studentId" UUID NOT NULL REFERENCES "user"("userId"),
      UNIQUE ("tutorId", "studentId")
    );

    CREATE TABLE message (
      "messageId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "conversationId" UUID NOT NULL REFERENCES conversation(id),
      "senderId" UUID NOT NULL REFERENCES "user"("userId"),
      content TEXT NOT NULL,
      "sentDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `)

  // Create document table
  await db.execute(sql`
    CREATE TABLE document (
      "documentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "tutorId" UUID NOT NULL REFERENCES tutor("tutorId"),
      "studentId" UUID NOT NULL REFERENCES student("studentId"),
      "documentName" TEXT NOT NULL,
      "filePath" TEXT NOT NULL,
      "uploadDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `)

  // Create login_history table
  await db.execute(sql`
    CREATE TABLE login_history (
      "loginId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId"),
      "loginTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "logoutTime" TIMESTAMP WITH TIME ZONE,
      "ipAddress" TEXT NOT NULL
    );
  `)

  // Create post table
  await db.execute(sql`
    CREATE TABLE post (
      "postId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"("userId"),
      "classId" UUID NOT NULL REFERENCES class(id),
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
      "classId" UUID NOT NULL REFERENCES class(id),
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
    DROP TABLE IF EXISTS login_history CASCADE;
    DROP TABLE IF EXISTS document CASCADE;
    DROP TABLE IF EXISTS message CASCADE;
    DROP TABLE IF EXISTS conversation CASCADE;
    DROP TABLE IF EXISTS class CASCADE;
    DROP TABLE IF EXISTS staff CASCADE;
    DROP TABLE IF EXISTS student CASCADE;
    DROP TABLE IF EXISTS tutor CASCADE;
    DROP TABLE IF EXISTS user_role CASCADE;
    DROP TABLE IF EXISTS role_permission CASCADE;
    DROP TABLE IF EXISTS permission CASCADE;
    DROP TABLE IF EXISTS role CASCADE;
    DROP TABLE IF EXISTS "user" CASCADE;
    DROP TYPE IF EXISTS "meetingType";
  `)
} 