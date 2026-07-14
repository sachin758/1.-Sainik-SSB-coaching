/* ============================================================================
   SECTION 9: STUDY MATERIALS (TAT / WAT / SRT bank)
   ============================================================================ */
CREATE TABLE dbo.StudyMaterials
(
    MaterialID      INT IDENTITY(1,1) NOT NULL,
    MaterialTypeID  INT               NOT NULL,
    Title           NVARCHAR(200)     NOT NULL,
    Content         NVARCHAR(MAX)     NULL,
    ImageUrl        NVARCHAR(500)     NULL,
    ResourceLink    NVARCHAR(1000)    NULL,
    CreatedDate     DATETIME2(0)      NOT NULL CONSTRAINT DF_StudyMaterials_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate     DATETIME2(0)      NULL,
    CONSTRAINT PK_StudyMaterials PRIMARY KEY CLUSTERED (MaterialID),
    CONSTRAINT FK_StudyMaterials_Type FOREIGN KEY (MaterialTypeID)
        REFERENCES dbo.MaterialTypes(MaterialTypeID)
);
GO
CREATE NONCLUSTERED INDEX IX_StudyMaterials_Type_Created
    ON dbo.StudyMaterials (MaterialTypeID, CreatedDate DESC);
GO