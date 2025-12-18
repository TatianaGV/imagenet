CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS imagenet_tuples_name_trgm_idx
  ON imagenet_tuples USING gin (name gin_trgm_ops);
