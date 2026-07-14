/* ============================================================================
   SECTION 14: HELPER FUNCTION
   ============================================================================ */
CREATE OR ALTER FUNCTION dbo.fn_AttendancePercentage (@StudentID INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @Total INT, @Present INT, @Pct DECIMAL(5,2);
    SELECT @Total = COUNT(*), @Present = SUM(CASE WHEN Status='P' THEN 1 ELSE 0 END)
    FROM dbo.Attendance WHERE StudentID = @StudentID;

    IF @Total IS NULL OR @Total = 0 RETURN 0;
    SET @Pct = CAST(@Present AS DECIMAL(10,2)) * 100.0 / @Total;
    RETURN @Pct;
END;
GO