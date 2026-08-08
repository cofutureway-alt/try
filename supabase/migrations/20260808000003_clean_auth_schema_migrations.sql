-- Clean fake future versions from auth.schema_migrations so GoTrue auth operates normally
DO $$
BEGIN
  DELETE FROM auth.schema_migrations WHERE version >= '2025';
END $$;
