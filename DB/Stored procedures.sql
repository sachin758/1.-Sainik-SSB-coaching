/* ============================================================================
   SECTION 15: STORED PROCEDURES
   Convention: usp_<Entity>_<Action>. All write procedures use explicit
   transactions + TRY/CATCH with ROLLBACK, and return a result code plus
   message so calling application code can branch reliably instead of
   parsing exception text.
   ============================================================================ */

-- 15.1 usp_Student_Add ------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Student_Add
    @CadetCode    VARCHAR(20),
    @FullName     NVARCHAR(150),
    @Phone        VARCHAR(15) = NULL,
    @BatchID      INT,
    @PlainPassword NVARCHAR(100),
    @NewStudentID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;                 -- auto-rollback on any error
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Students WHERE CadetCode = @CadetCode)
        BEGIN
            RAISERROR('Cadet ID already in use.', 16, 1);
            RETURN;
        END

        DECLARE @Salt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
        DECLARE @Hash VARBINARY(64) = HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), @PlainPassword) + @Salt);

        BEGIN TRANSACTION;
            INSERT INTO dbo.Students (CadetCode, FullName, Phone, BatchID, PasswordHash, PasswordSalt)
            VALUES (@CadetCode, @FullName, @Phone, @BatchID, @Hash, @Salt);

            SET @NewStudentID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;                          -- re-raise to caller with original error info
    END CATCH
END;
GO

-- 15.2 usp_Student_Update ----------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Student_Update
    @StudentID    INT,
    @FullName     NVARCHAR(150),
    @Phone        VARCHAR(15) = NULL,
    @BatchID      INT,
    @PlainPassword NVARCHAR(100) = NULL   -- pass NULL to leave password unchanged
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Students WHERE StudentID = @StudentID)
        BEGIN
            RAISERROR('Student not found.', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;
            IF @PlainPassword IS NOT NULL
            BEGIN
                DECLARE @Salt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
                DECLARE @Hash VARBINARY(64) = HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), @PlainPassword) + @Salt);
                UPDATE dbo.Students
                    SET FullName = @FullName, Phone = @Phone, BatchID = @BatchID,
                        PasswordHash = @Hash, PasswordSalt = @Salt
                WHERE StudentID = @StudentID;
            END
            ELSE
            BEGIN
                UPDATE dbo.Students
                    SET FullName = @FullName, Phone = @Phone, BatchID = @BatchID
                WHERE StudentID = @StudentID;
            END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.3 usp_Student_Delete (soft delete preserves attendance/audit history) --
CREATE OR ALTER PROCEDURE dbo.usp_Student_Delete
    @StudentID INT,
    @HardDelete BIT = 0            -- 0 = deactivate (recommended), 1 = physically remove
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            IF @HardDelete = 0
                UPDATE dbo.Students SET IsActive = 0 WHERE StudentID = @StudentID;
            ELSE
                DELETE FROM dbo.Students WHERE StudentID = @StudentID; -- cascades to Attendance
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.4 usp_Student_Login ------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Student_Login
    @CadetCode     VARCHAR(20),
    @PlainPassword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @StoredHash VARBINARY(64), @Salt VARBINARY(32), @StudentID INT, @IsActive BIT;

        SELECT @StudentID = StudentID, @StoredHash = PasswordHash, @Salt = PasswordSalt, @IsActive = IsActive
        FROM dbo.Students WHERE CadetCode = @CadetCode;

        IF @StudentID IS NULL OR @IsActive = 0
        BEGIN
            SELECT CAST(0 AS BIT) AS Success, 'Invalid cadet ID or password.' AS Message;
            RETURN;
        END

        IF HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), @PlainPassword) + @Salt) = @StoredHash
            SELECT CAST(1 AS BIT) AS Success, 'Login successful.' AS Message, s.StudentID, s.FullName, s.CadetCode, b.BatchName
            FROM dbo.Students s JOIN dbo.Batches b ON s.BatchID = b.BatchID
            WHERE s.StudentID = @StudentID;
        ELSE
            SELECT CAST(0 AS BIT) AS Success, 'Invalid cadet ID or password.' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- 15.5 usp_Admin_Login --------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Admin_Login
    @AdminUserID   VARCHAR(50),
    @PlainPassword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @StoredHash VARBINARY(64), @Salt VARBINARY(32), @AdminID INT, @IsActive BIT;

        SELECT @AdminID = AdminID, @StoredHash = PasswordHash, @Salt = PasswordSalt, @IsActive = IsActive
        FROM sec.Admins WHERE AdminUserID = @AdminUserID;

        IF @AdminID IS NULL OR @IsActive = 0
        BEGIN
            SELECT CAST(0 AS BIT) AS Success, 'Incorrect admin ID or password.' AS Message;
            RETURN;
        END

        IF HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), @PlainPassword) + @Salt) = @StoredHash
            SELECT CAST(1 AS BIT) AS Success, 'Login successful.' AS Message, @AdminID AS AdminID, @AdminUserID AS AdminUserID;
        ELSE
            SELECT CAST(0 AS BIT) AS Success, 'Incorrect admin ID or password.' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- 15.6 usp_Admin_ChangePassword ------------------------------------------------
CREATE OR ALTER PROCEDURE sec.usp_Admin_ChangePassword
    @AdminID INT,
    @NewPlainPassword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        DECLARE @Salt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
        DECLARE @Hash VARBINARY(64) = HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), @NewPlainPassword) + @Salt);
        BEGIN TRANSACTION;
            UPDATE sec.Admins SET PasswordHash = @Hash, PasswordSalt = @Salt, UpdatedDate = SYSDATETIME()
            WHERE AdminID = @AdminID;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.7 usp_Attendance_Mark (idempotent upsert - prevents duplicate rows) -----
CREATE OR ALTER PROCEDURE dbo.usp_Attendance_Mark
    @StudentID       INT,
    @AttendanceDate  DATE,
    @Status          CHAR(1),
    @MarkedByAdminID INT = NULL
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            MERGE dbo.Attendance AS target
            USING (SELECT @StudentID AS StudentID, @AttendanceDate AS AttendanceDate) AS src
                ON target.StudentID = src.StudentID AND target.AttendanceDate = src.AttendanceDate
            WHEN MATCHED THEN
                UPDATE SET Status = @Status, MarkedByAdminID = @MarkedByAdminID, UpdatedDate = SYSDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (StudentID, AttendanceDate, Status, MarkedByAdminID)
                VALUES (@StudentID, @AttendanceDate, @Status, @MarkedByAdminID);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.8 usp_Attendance_Get (by student and/or date range) ----------------------
CREATE OR ALTER PROCEDURE dbo.usp_Attendance_Get
    @StudentID  INT  = NULL,
    @DateFrom   DATE = NULL,
    @DateTo     DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT a.AttendanceID, a.StudentID, s.FullName, s.CadetCode, a.AttendanceDate, a.Status
    FROM dbo.Attendance a
    JOIN dbo.Students s ON s.StudentID = a.StudentID
    WHERE (@StudentID IS NULL OR a.StudentID = @StudentID)
      AND (@DateFrom  IS NULL OR a.AttendanceDate >= @DateFrom)
      AND (@DateTo    IS NULL OR a.AttendanceDate <= @DateTo)
    ORDER BY a.AttendanceDate DESC, s.FullName;
END;
GO

-- 15.9 usp_Lecture_Add ---------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Lecture_Add
    @Title NVARCHAR(200), @CategoryID INT, @VideoUrl NVARCHAR(1000),
    @Description NVARCHAR(1000) = NULL, @NewLectureID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO dbo.Lectures (Title, CategoryID, VideoUrl, Description)
            VALUES (@Title, @CategoryID, @VideoUrl, @Description);
            SET @NewLectureID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.10 usp_Material_Add --------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Material_Add
    @MaterialTypeID INT, @Title NVARCHAR(200), @Content NVARCHAR(MAX) = NULL,
    @ImageUrl NVARCHAR(500) = NULL, @ResourceLink NVARCHAR(1000) = NULL,
    @NewMaterialID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO dbo.StudyMaterials (MaterialTypeID, Title, Content, ImageUrl, ResourceLink)
            VALUES (@MaterialTypeID, @Title, @Content, @ImageUrl, @ResourceLink);
            SET @NewMaterialID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.11 usp_Faculty_Add ----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Faculty_Add
    @FullName NVARCHAR(150), @Designation NVARCHAR(150) = NULL, @Subject NVARCHAR(200) = NULL,
    @PhotoUrl NVARCHAR(500) = NULL, @Bio NVARCHAR(MAX) = NULL, @NewFacultyID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO dbo.Faculty (FullName, Designation, Subject, PhotoUrl, Bio)
            VALUES (@FullName, @Designation, @Subject, @PhotoUrl, @Bio);
            SET @NewFacultyID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.12 usp_Officer_Add (handles "only one Main Commander" business rule) -------
CREATE OR ALTER PROCEDURE dbo.usp_Officer_Add
    @FullName NVARCHAR(150), @Rank NVARCHAR(100) = NULL, @Title NVARCHAR(150) = NULL,
    @PhotoUrl NVARCHAR(500) = NULL, @Bio NVARCHAR(MAX) = NULL, @IsMain BIT = 0,
    @NewOfficerID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            IF @IsMain = 1
                UPDATE dbo.Officers SET IsMain = 0 WHERE IsMain = 1;  -- demote current main first

            INSERT INTO dbo.Officers (FullName, Rank, Title, PhotoUrl, Bio, IsMain)
            VALUES (@FullName, @Rank, @Title, @PhotoUrl, @Bio, @IsMain);
            SET @NewOfficerID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.13 usp_RecommendedCadet_Add ---------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_RecommendedCadet_Add
    @StudentID INT = NULL, @CadetNameSnapshot NVARCHAR(150), @BatchID INT = NULL,
    @ServiceID INT, @Centre NVARCHAR(200) = NULL, @Testimonial NVARCHAR(1000) = NULL,
    @RecommendedDate DATE = NULL, @NewRecommendedID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO dbo.RecommendedCadets (StudentID, CadetNameSnapshot, BatchID, ServiceID, Centre, Testimonial, RecommendedDate)
            VALUES (@StudentID, @CadetNameSnapshot, @BatchID, @ServiceID, @Centre, @Testimonial,
                    ISNULL(@RecommendedDate, CAST(SYSDATETIME() AS DATE)));
            SET @NewRecommendedID = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15.14 usp_Student_SearchPaged (Search + Pagination combined, as requested) -------
CREATE OR ALTER PROCEDURE dbo.usp_Student_SearchPaged
    @SearchTerm NVARCHAR(150) = NULL,
    @BatchID    INT = NULL,
    @PageNumber INT = 1,
    @PageSize   INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT s.StudentID, s.CadetCode, s.FullName, s.Phone, b.BatchName, s.JoinDate, s.IsActive,
           COUNT(*) OVER() AS TotalRowCount                      -- total matching rows, for UI pager
    FROM dbo.Students s
    JOIN dbo.Batches b ON b.BatchID = s.BatchID
    WHERE s.IsActive = 1
      AND (@SearchTerm IS NULL OR s.FullName LIKE '%' + @SearchTerm + '%' OR s.CadetCode LIKE '%' + @SearchTerm + '%')
      AND (@BatchID IS NULL OR s.BatchID = @BatchID)
    ORDER BY s.FullName
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- 15.15 usp_Dashboard_GetStatistics (KPI cards used on both admin/homepage) -------
CREATE OR ALTER PROCEDURE dbo.usp_Dashboard_GetStatistics
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM dbo.Students WHERE IsActive = 1)        AS TotalActiveCadets,
        (SELECT COUNT(*) FROM dbo.RecommendedCadets)                  AS TotalRecommended,
        (SELECT COUNT(*) FROM dbo.Lectures)                           AS TotalLectures,
        (SELECT COUNT(*) FROM dbo.StudyMaterials)                     AS TotalMaterials,
        (SELECT COUNT(*) FROM dbo.Attendance
            WHERE AttendanceDate = CAST(SYSDATETIME() AS DATE) AND Status='P') AS PresentToday,
        (SELECT COUNT(*) FROM dbo.Attendance
            WHERE AttendanceDate = CAST(SYSDATETIME() AS DATE) AND Status='A') AS AbsentToday;
END;
GO