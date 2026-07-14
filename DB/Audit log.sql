/* ============================================================================
   SECTION 12: AUDIT LOG  (generic audit trail for Insert/Update/Delete)
   Design decision: a single generic audit table (rather than a shadow table
   per entity) keeps the audit subsystem simple to query/report on across
   the whole app, at the cost of NVARCHAR(MAX) JSON payloads instead of typed
   columns - an acceptable trade-off for an audit trail that is written once
   and read rarely.
   ============================================================================ */
CREATE TABLE audit.AuditLog
(
    AuditID       BIGINT IDENTITY(1,1) NOT NULL,
    TableName     SYSNAME           NOT NULL,
    Operation     VARCHAR(10)       NOT NULL,     -- INSERT / UPDATE / DELETE
    RecordID      INT               NOT NULL,
    OldValuesJson NVARCHAR(MAX)     NULL,
    NewValuesJson NVARCHAR(MAX)     NULL,
    ChangedBy     SYSNAME           NOT NULL CONSTRAINT DF_AuditLog_ChangedBy DEFAULT (SUSER_SNAME()),
    ChangedDate   DATETIME2(0)      NOT NULL CONSTRAINT DF_AuditLog_ChangedDate DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_AuditLog PRIMARY KEY CLUSTERED (AuditID),
    CONSTRAINT CK_AuditLog_Operation CHECK (Operation IN ('INSERT','UPDATE','DELETE'))
);
GO
CREATE NONCLUSTERED INDEX IX_AuditLog_Table_Record ON audit.AuditLog (TableName, RecordID, ChangedDate DESC);
GO