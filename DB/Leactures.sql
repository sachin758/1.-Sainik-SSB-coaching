/* ============================================================================
   SECTION 8: LECTURES  (video library)
   ============================================================================ */
CREATE TABLE dbo.Lectures
(
    LectureID     INT IDENTITY(1,1) NOT NULL,
    Title         NVARCHAR(200)     NOT NULL,
    CategoryID    INT               NOT NULL,
    VideoUrl      NVARCHAR(1000)    NOT NULL,
    Description   NVARCHAR(1000)    NULL,
    PublishDate   DATE              NOT NULL CONSTRAINT DF_Lectures_PublishDate DEFAULT (CAST(SYSDATETIME() AS DATE)),
    CreatedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_Lectures_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate   DATETIME2(0)      NULL,
    CONSTRAINT PK_Lectures PRIMARY KEY CLUSTERED (LectureID),
    CONSTRAINT FK_Lectures_Category FOREIGN KEY (CategoryID)
        REFERENCES dbo.LectureCategories(CategoryID)
);
GO
-- Homepage/dashboard lists lectures newest-first per category
CREATE NONCLUSTERED INDEX IX_Lectures_Category_PublishDate
    ON dbo.Lectures (CategoryID, PublishDate DESC);
GO