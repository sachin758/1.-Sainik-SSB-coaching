/* ============================================================================
   SECTION 11: ATTENDANCE  (Attendance / Daily Attendance requirement)
   Design decision: one row per (Student, Date) - enforced by a UNIQUE
   constraint - which is both a business rule (a cadet can only be marked
   once per day) and a performance aid (used directly by the upsert proc).
   ============================================================================ */
CREATE TABLE dbo.Attendance
(
    AttendanceID    INT IDENTITY(1,1) NOT NULL,
    StudentID       INT               NOT NULL,
    AttendanceDate  DATE              NOT NULL,
    Status          CHAR(1)           NOT NULL,        -- 'P' = Present, 'A' = Absent
    MarkedByAdminID INT               NULL,
    CreatedDate     DATETIME2(0)      NOT NULL CONSTRAINT DF_Attendance_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate     DATETIME2(0)      NULL,
    CONSTRAINT PK_Attendance PRIMARY KEY CLUSTERED (AttendanceID),
    CONSTRAINT UQ_Attendance_Student_Date UNIQUE (StudentID, AttendanceDate),  -- prevents duplicate marking
    CONSTRAINT CK_Attendance_Status CHECK (Status IN ('P','A')),
    CONSTRAINT FK_Attendance_Students FOREIGN KEY (StudentID)
        REFERENCES dbo.Students(StudentID) ON DELETE CASCADE,
    CONSTRAINT FK_Attendance_Admins FOREIGN KEY (MarkedByAdminID)
        REFERENCES sec.Admins(AdminID)
);
GO
-- Attendance registers are queried "by date, all students" and "by student, date range"
CREATE NONCLUSTERED INDEX IX_Attendance_Date_Student ON dbo.Attendance (AttendanceDate, StudentID) INCLUDE (Status);
CREATE NONCLUSTERED INDEX IX_Attendance_Student_Date ON dbo.Attendance (StudentID, AttendanceDate) INCLUDE (Status);
GO