/* ============================================================================
   SSB TRAINING ACADEMY MANAGEMENT SYSTEM
   Microsoft SQL Server 2022 - Production Database Script */
IF DB_ID(N'SSB_Academy_DB') IS NULL
BEGIN
    CREATE DATABASE SSB_Academy_DB
    ON PRIMARY
    ( NAME = N'SSB_Academy_DB',      FILENAME = N'SSB_Academy_DB.mdf',
      SIZE = 256MB, FILEGROWTH = 64MB )
    LOG ON
    ( NAME = N'SSB_Academy_DB_log',  FILENAME = N'SSB_Academy_DB.ldf',
      SIZE = 64MB,  FILEGROWTH = 64MB );
END
GO

ALTER DATABASE SSB_Academy_DB SET RECOVERY SIMPLE;
ALTER DATABASE SSB_Academy_DB SET READ_COMMITTED_SNAPSHOT ON; -- reduces blocking (row versioning)
GO

USE SSB_Academy_DB;
GO