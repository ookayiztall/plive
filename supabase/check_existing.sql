-- Check what exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT type_name FROM pg_type WHERE typname = 'app_role';
