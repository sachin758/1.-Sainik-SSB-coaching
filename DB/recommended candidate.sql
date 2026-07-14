/* ============================================================================
   SECTION 10: RECOMMENDED CADETS (public "success stories")
   Design decision: StudentID is a NULLABLE FK - the app allows typing a
   free-text name not tied to an enrolled roster record (alumni who may no
   longer have an account), so we keep an optional link plus a denormalized
   CadetNameSnapshot for cases with no matching Student row. This is an
   intentional, documented denormalization (captured at write time) so the
   public page still renders correctly even if the student is later removed.
   ============================================================================ */
CREATE TABLE dbo.RecommendedCadets
(
    RecommendedID       INT IDENTITY(1,1) NOT NULL,
    StudentID            INT              NULL,
    CadetNameSnapshot    NVARCHAR(150)    NOT NULL,
    BatchID              INT              NULL,
    ServiceID            INT              NOT NULL,
    Centre               NVARCHAR(200)    NULL,
    Testimonial          NVARCHAR(1000)   NULL,
    RecommendedDate      DATE             NOT NULL CONSTRAINT DF_RecommendedCadets_Date DEFAULT (CAST(SYSDATETIME() AS DATE)),
    CreatedDate          DATETIME2(0)     NOT NULL CONSTRAINT DF_RecommendedCadets_CreatedDate DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_RecommendedCadets PRIMARY KEY CLUSTERED (RecommendedID),
    CONSTRAINT FK_RecommendedCadets_Students FOREIGN KEY (StudentID)
        REFERENCES dbo.Students(StudentID) ON DELETE SET NULL,
    CONSTRAINT FK_RecommendedCadets_Batches FOREIGN KEY (BatchID)
        REFERENCES dbo.Batches(BatchID),
    CONSTRAINT FK_RecommendedCadets_Services FOREIGN KEY (ServiceID)
        REFERENCES dbo.Services(ServiceID)
);
GO
CREATE NONCLUSTERED INDEX IX_RecommendedCadets_Date ON dbo.RecommendedCadets (RecommendedDate DESC);
GO