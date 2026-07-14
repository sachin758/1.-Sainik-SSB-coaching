/* ============================================================================
   SECTION 16: VIEWS (reporting layer)
   ============================================================================ */

CREATE OR ALTER VIEW dbo.vw_StudentDetails
AS
SELECT s.StudentID, s.CadetCode, s.FullName, s.Phone, b.BatchName, s.JoinDate, s.IsActive,
       dbo.fn_AttendancePercentage(s.StudentID) AS AttendancePercentage
FROM dbo.Students s
JOIN dbo.Batches b ON b.BatchID = s.BatchID;
GO

CREATE OR ALTER VIEW dbo.vw_AttendanceReport
AS
SELECT a.AttendanceDate, s.CadetCode, s.FullName, b.BatchName, a.Status,
       ad.AdminUserID AS MarkedBy
FROM dbo.Attendance a
JOIN dbo.Students s ON s.StudentID = a.StudentID
JOIN dbo.Batches b  ON b.BatchID = s.BatchID
LEFT JOIN sec.Admins ad ON ad.AdminID = a.MarkedByAdminID;
GO

CREATE OR ALTER VIEW dbo.vw_FacultyList
AS
SELECT FacultyID, FullName, Designation, Subject, PhotoUrl, Bio
FROM dbo.Faculty;
GO

CREATE OR ALTER VIEW dbo.vw_RecommendedCadets
AS
SELECT r.RecommendedID, r.CadetNameSnapshot AS CadetName, b.BatchName, sv.ServiceName,
       r.Centre, r.Testimonial, r.RecommendedDate
FROM dbo.RecommendedCadets r
LEFT JOIN dbo.Batches b  ON b.BatchID = r.BatchID
JOIN dbo.Services sv ON sv.ServiceID = r.ServiceID;
GO

CREATE OR ALTER VIEW dbo.vw_DashboardSummary
AS
SELECT
    (SELECT COUNT(*) FROM dbo.Students WHERE IsActive = 1)  AS TotalActiveCadets,
    (SELECT COUNT(*) FROM dbo.RecommendedCadets)            AS TotalRecommended,
    (SELECT COUNT(*) FROM dbo.Lectures)                     AS TotalLectures,
    (SELECT COUNT(*) FROM dbo.StudyMaterials)                AS TotalMaterials,
    (SELECT COUNT(*) FROM dbo.Faculty)                       AS TotalFaculty,
    (SELECT COUNT(*) FROM dbo.Officers)                      AS TotalOfficers;
GO