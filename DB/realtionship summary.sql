/* ============================================================================
   SECTION 18: RELATIONSHIP SUMMARY (text ER diagram)
   ============================================================================

   Batches (1) ────────< (many) Students
   Batches (1) ────────< (many) RecommendedCadets [nullable]
   Students (1) ───────< (many) Attendance
   Students (1) ───────< (0..1) RecommendedCadets [nullable]
   sec.Admins (1) ─────< (many) Attendance.MarkedByAdminID [nullable]
   LectureCategories (1) < (many) Lectures
   MaterialTypes (1) ──< (many) StudyMaterials
   Services (1) ───────< (many) RecommendedCadets
   Officers, Faculty, Programs : standalone entities (no FK dependents)
   audit.AuditLog : logs changes from Students and Attendance (extendable)

   ============================================================================ */
GO
PRINT 'SSB_Academy_DB deployed successfully.';