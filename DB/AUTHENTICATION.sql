
/* ============================================================================
   SECTION 4: SECURITY/AUTHENTICATION TABLES
   Design decision: passwords are NEVER stored in plain text (the original
   app stored plaintext passwords in localStorage - this is corrected here).
   We store a salted SHA2_512 hash. For real production, prefer hashing at
   the application layer with bcrypt/Argon2 and pass only the resulting hash
   to SQL Server; HASHBYTES is used here so the script is fully self-contained.
   ============================================================================ */

CREATE TABLE sec.Admins
(
    AdminID        INT IDENTITY(1,1) NOT NULL,
    AdminUserID    VARCHAR(50)       NOT NULL,      -- login id, e.g. 'admin'
    PasswordHash   VARBINARY(64)     NOT NULL,       -- SHA2_512 hash
    PasswordSalt   VARBINARY(32)     NOT NULL,
    IsActive       BIT               NOT NULL CONSTRAINT DF_Admins_IsActive DEFAULT (1),
    CreatedDate    DATETIME2(0)      NOT NULL CONSTRAINT DF_Admins_CreatedDate DEFAULT (SYSDATETIME()),
    UpdatedDate    DATETIME2(0)      NULL,
    CONSTRAINT PK_Admins PRIMARY KEY CLUSTERED (AdminID),
    CONSTRAINT UQ_Admins_AdminUserID UNIQUE (AdminUserID)      -- one admin id can't repeat
);
GO

