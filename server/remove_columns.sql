-- Drop columns if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'class' AND column_name = 'description') THEN
        ALTER TABLE "class" DROP COLUMN "description";
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'class' AND column_name = 'meetingLink') THEN
        ALTER TABLE "class" DROP COLUMN "meetingLink";
    END IF;
END $$; 