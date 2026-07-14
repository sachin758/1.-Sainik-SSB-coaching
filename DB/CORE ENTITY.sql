
/* ============================================================================
   SECTION 5: CORE ENTITY - STUDENTS (Cadets)
   Design decision: CadetCode (e.g. SSB-2026-001) is kept as a business key
   (unique, human readable, used for login) separate from the surrogate
   INT IDENTITY StudentID used for all FK relationships - this is the
   standard "surrogate key + natural/business key" pattern for performance
   (narrow INT joins) plus usability (readable login IDs).
   ============================================================================ */
CREATE TABLE dbo.Students
(
    StudentID      INT IDENTITY(1,1) NOT NULL,
    CadetCode      VARCHAR(20)       NOT NULL,       -- e.g. SSB-2026-001
    FullName       NVARCHAR(150)     NOT NULL,
    Phone          VARCHAR(15)       NULL,
    BatchID        INT               NOT NULL,
    PasswordHash   VARBINARY(64)     NOT NULL,
    PasswordSalt   VARBINARY(32)     NOT NULL,
    JoinDate       DATE              NOT NULL CONSTRAINT DF_Students_JoinDate DEFAULT (CAST(SYSDATETIME() AS DATE)),
    IsActive       BIT               NOT NULL CONSTRAINT DF_Students_IsActive DEFAULT (1), -- soft delete flag
    CreatedDate    DATETIME2(0)      NOT NULL CONSTRAINT DF_Students_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate    DATETIME2(0)      NULL,
    CONSTRAINT PK_Students PRIMARY KEY CLUSTERED (StudentID),
    CONSTRAINT UQ_Students_CadetCode UNIQUE (CadetCode),                    -- prevents duplicate cadet IDs
    CONSTRAINT FK_Students_Batches FOREIGN KEY (BatchID)
        REFERENCES dbo.Batches(BatchID) ON UPDATE CASCADE ON DELETE NO ACTION,
    CONSTRAINT CK_Students_Phone CHECK (Phone IS NULL OR Phone LIKE '[0-9]%' )
);
GO
-- Composite/non-clustered index: fast lookup by batch + active flag (roster screens filter by both)
CREATE NONCLUSTERED INDEX IX_Students_BatchID_IsActive ON dbo.Students (BatchID, IsActive) INCLUDE (FullName, CadetCode);
-- Supports name search (toolbar "search by name or Cadet ID")
CREATE NONCLUSTERED INDEX IX_Students_FullName ON dbo.Students (FullName);
GO