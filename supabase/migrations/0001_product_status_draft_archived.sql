-- ============================================================================
-- Migration 0001 — add draft/archived to product_status
-- ============================================================================
-- Apply this ONLY to an EXISTING database created before draft/archived existed.
-- Fresh installs already get all four values from supabase/schema.sql.
--
-- Run in the Supabase SQL editor. ADD VALUE is idempotent via IF NOT EXISTS and
-- cannot run inside a transaction block alongside use of the new value — run it
-- as its own statement(s), which the SQL editor does by default.
--
-- Effect: owners can mark products as `draft` (not yet public) or `archived`
-- (retired). Both are hidden from the public catalog, sitemap, and product page;
-- the application enforces this in src/lib/data/products.ts. No data is changed.

alter type product_status add value if not exists 'draft';
alter type product_status add value if not exists 'archived';
