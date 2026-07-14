/* ============================================================================
   SECTION 6: OFFICERS (Commanders) & FACULTY
   Design decision: "Main Commander" (founder, featured on homepage hero) must
   be unique - enforced with a FILTERED UNIQUE INDEX (WHERE IsMain = 1) rather
   than a CHECK constraint, since CHECK cannot see other rows; the filtered
   index guarantees at most one IsMain=1 row at the engine level.
   ============================================================================ */
CREATE TABLE dbo.Officers
(
    OfficerID     INT IDENTITY(1,1) NOT NULL,
    FullName      NVARCHAR(150)     NOT NULL,
    Rank          NVARCHAR(100)     NULL,
    Title         NVARCHAR(150)     NULL,
    PhotoUrl      NVARCHAR(500)     NULL,
    Bio           NVARCHAR(MAX)     NULL,
    IsMain        BIT               NOT NULL CONSTRAINT DF_Officers_IsMain DEFAULT (0), -- founder/CO flag
    CreatedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_Officers_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate   DATETIME2(0)      NULL,
    CONSTRAINT PK_Officers PRIMARY KEY CLUSTERED (OfficerID)
);
GO
-- Only one "Main Commander" allowed at any time
CREATE UNIQUE NONCLUSTERED INDEX UX_Officers_OnlyOneMain
    ON dbo.Officers (IsMain) WHERE IsMain = 1;
GO

CREATE TABLE dbo.Faculty
(
    FacultyID     INT IDENTITY(1,1) NOT NULL,
    FullName      NVARCHAR(150)     NOT NULL,
    Designation   NVARCHAR(150)     NULL,
    Subject       NVARCHAR(200)     NULL,
    PhotoUrl      NVARCHAR(500)     NULL,
    Bio           NVARCHAR(MAX)     NULL,
    CreatedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_Faculty_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate   DATETIME2(0)      NULL,
    CONSTRAINT PK_Faculty PRIMARY KEY CLUSTERED (FacultyID)
);
GO