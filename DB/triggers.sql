/* ============================================================================
   SECTION 13: TRIGGERS
   ============================================================================ */

-- 13.1 Generic pattern: keep UpdatedDate current on every UPDATE (Students)
CREATE OR ALTER TRIGGER trg_Students_SetUpdatedDate
ON dbo.Students
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE s
        SET UpdatedDate = SYSDATETIME()
    FROM dbo.Students s
    INNER JOIN inserted i ON s.StudentID = i.StudentID;
END;
GO

CREATE OR ALTER TRIGGER trg_Officers_SetUpdatedDate ON dbo.Officers AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE o SET UpdatedDate = SYSDATETIME() FROM dbo.Officers o JOIN inserted i ON o.OfficerID = i.OfficerID;
END;
GO
CREATE OR ALTER TRIGGER trg_Faculty_SetUpdatedDate ON dbo.Faculty AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE f SET UpdatedDate = SYSDATETIME() FROM dbo.Faculty f JOIN inserted i ON f.FacultyID = i.FacultyID;
END;
GO
CREATE OR ALTER TRIGGER trg_Lectures_SetUpdatedDate ON dbo.Lectures AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE l SET UpdatedDate = SYSDATETIME() FROM dbo.Lectures l JOIN inserted i ON l.LectureID = i.LectureID;
END;
GO
CREATE OR ALTER TRIGGER trg_StudyMaterials_SetUpdatedDate ON dbo.StudyMaterials AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE m SET UpdatedDate = SYSDATETIME() FROM dbo.StudyMaterials m JOIN inserted i ON m.MaterialID = i.MaterialID;
END;
GO
CREATE OR ALTER TRIGGER trg_Programs_SetUpdatedDate ON dbo.Programs AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE p SET UpdatedDate = SYSDATETIME() FROM dbo.Programs p JOIN inserted i ON p.ProgramID = i.ProgramID;
END;
GO
CREATE OR ALTER TRIGGER trg_Attendance_SetUpdatedDate ON dbo.Attendance AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
    UPDATE a SET UpdatedDate = SYSDATETIME() FROM dbo.Attendance a JOIN inserted i ON a.AttendanceID = i.AttendanceID;
END;
GO

-- 13.2 Full audit trail on the most business-critical table: Students
-- (INSERT / UPDATE / DELETE all logged as JSON snapshots)
CREATE OR ALTER TRIGGER trg_Students_Audit
ON dbo.Students
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN -- UPDATE
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, OldValuesJson, NewValuesJson)
        SELECT 'dbo.Students', 'UPDATE', i.StudentID,
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i JOIN deleted d ON i.StudentID = d.StudentID;
    END
    ELSE IF EXISTS (SELECT 1 FROM inserted)
    BEGIN -- INSERT
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, NewValuesJson)
        SELECT 'dbo.Students', 'INSERT', i.StudentID,
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    END
    ELSE
    BEGIN -- DELETE
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, OldValuesJson)
        SELECT 'dbo.Students', 'DELETE', d.StudentID,
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d;
    END
END;
GO

-- 13.3 Audit trail on Attendance (marking/changing attendance is sensitive)
CREATE OR ALTER TRIGGER trg_Attendance_Audit
ON dbo.Attendance
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, OldValuesJson, NewValuesJson)
        SELECT 'dbo.Attendance','UPDATE', i.AttendanceID,
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i JOIN deleted d ON i.AttendanceID = d.AttendanceID;
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, NewValuesJson)
        SELECT 'dbo.Attendance','INSERT', i.AttendanceID, (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    ELSE
        INSERT INTO audit.AuditLog (TableName, Operation, RecordID, OldValuesJson)
        SELECT 'dbo.Attendance','DELETE', d.AttendanceID, (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d;
END;
GO