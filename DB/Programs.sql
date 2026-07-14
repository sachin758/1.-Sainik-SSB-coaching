/* ============================================================================
   SECTION 7: PROGRAMS (homepage program cards: OIR/PPDT, TAT-WAT-SRT, GTO, PI)
   ============================================================================ */
CREATE TABLE dbo.Programs
(
    ProgramID     INT IDENTITY(1,1) NOT NULL,
    Tag           NVARCHAR(50)      NULL,
    Title         NVARCHAR(150)     NOT NULL,
    Description   NVARCHAR(1000)    NULL,
    ImageUrl      NVARCHAR(500)     NULL,
    DisplayOrder  INT               NOT NULL CONSTRAINT DF_Programs_DisplayOrder DEFAULT (0),
    CreatedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_Programs_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate   DATETIME2(0)      NULL,
    CONSTRAINT PK_Programs PRIMARY KEY CLUSTERED (ProgramID)
);
GO