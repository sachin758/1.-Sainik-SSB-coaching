/* ============================================================================
   SECTION 3: LOOKUP / REFERENCE TABLES  (drive 3NF - eliminate repeating
   free-text values such as LECTURE_CATS, BATCHES, SERVICES, MaterialType)
   ============================================================================ */

-- Batches: replaces the hard-coded BATCHES[] array in the JS app
CREATE TABLE dbo.Batches
(
    BatchID       INT IDENTITY(1,1) NOT NULL,
    BatchName     NVARCHAR(100)     NOT NULL,
    IsActive      BIT               NOT NULL CONSTRAINT DF_Batches_IsActive DEFAULT (1),
    CreatedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_Batches_CreatedDate DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_Batches PRIMARY KEY CLUSTERED (BatchID),
    CONSTRAINT UQ_Batches_BatchName UNIQUE (BatchName)          -- prevents duplicate batch names
);
GO

-- Lecture categories: replaces LECTURE_CATS[] array
CREATE TABLE dbo.LectureCategories
(
    CategoryID    INT IDENTITY(1,1) NOT NULL,
    CategoryName  NVARCHAR(100)     NOT NULL,
    CONSTRAINT PK_LectureCategories PRIMARY KEY CLUSTERED (CategoryID),
    CONSTRAINT UQ_LectureCategories_Name UNIQUE (CategoryName)
);
GO

-- Study material type: replaces the fixed TAT/WAT/SRT type in the app
CREATE TABLE dbo.MaterialTypes
(
    MaterialTypeID INT IDENTITY(1,1) NOT NULL,
    TypeCode       VARCHAR(10)       NOT NULL,   -- 'TAT','WAT','SRT'
    TypeName       NVARCHAR(100)     NOT NULL,
    CONSTRAINT PK_MaterialTypes PRIMARY KEY CLUSTERED (MaterialTypeID),
    CONSTRAINT UQ_MaterialTypes_Code UNIQUE (TypeCode)
);
GO

-- Defence services: replaces SERVICES[] array (Indian Army, Navy, Air Force, TA)
CREATE TABLE dbo.Services
(
    ServiceID     INT IDENTITY(1,1) NOT NULL,
    ServiceName   NVARCHAR(100)     NOT NULL,
    CONSTRAINT PK_Services PRIMARY KEY CLUSTERED (ServiceID),
    CONSTRAINT UQ_Services_Name UNIQUE (ServiceName)
);
GO
