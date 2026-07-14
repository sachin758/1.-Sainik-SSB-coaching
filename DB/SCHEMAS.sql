/* ============================================================================
   SECTION 2: SCHEMAS
   Design decision: separate schemas for core data, audit, and security keep
   permissions granular (e.g. GRANT SELECT on sec.* only to admin roles).
   ============================================================================ */
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'sec')  EXEC('CREATE SCHEMA sec');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'audit') EXEC('CREATE SCHEMA audit');
GO