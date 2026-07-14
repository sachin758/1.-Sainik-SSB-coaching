/* ============================================================================
   SECTION 17: SAMPLE DATA
   ============================================================================ */

INSERT INTO dbo.Batches (BatchName) VALUES
('SSB Interview Batch'), ('NDA Foundation'), ('CDS Foundation'),
('AFCAT Prep'), ('TES/TGC Entry'), ('General Awareness');

INSERT INTO dbo.LectureCategories (CategoryName) VALUES
('Physical Training'), ('GTO Tasks'), ('Interview Prep'),
('Personality Development'), ('Group Discussion'), ('General');

INSERT INTO dbo.MaterialTypes (TypeCode, TypeName) VALUES
('TAT', 'Thematic Apperception Test'), ('WAT', 'Word Association Test'), ('SRT', 'Situation Reaction Test');

INSERT INTO dbo.Services (ServiceName) VALUES
('Indian Army'), ('Indian Navy'), ('Indian Air Force'), ('Territorial Army');

-- Default admin: id 'admin' / password 'Admin@1234' (change immediately after deployment)
DECLARE @AdminSalt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
INSERT INTO sec.Admins (AdminUserID, PasswordHash, PasswordSalt)
VALUES ('admin', HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), N'Admin@1234') + @AdminSalt), @AdminSalt);

INSERT INTO dbo.Officers (FullName, Rank, Title, Bio, IsMain) VALUES
(N'Major Sudhir Mishra', N'Major (Retd.)', N'Founder & Chief Instructor',
 N'Leads every batch personally, from psychology tests to the final interview board.', 1);

DECLARE @Salt1 VARBINARY(32) = CRYPT_GEN_RANDOM(32);
DECLARE @BatchSSB INT = (SELECT BatchID FROM dbo.Batches WHERE BatchName = 'SSB Interview Batch');

INSERT INTO dbo.Students (CadetCode, FullName, Phone, BatchID, PasswordHash, PasswordSalt)
VALUES ('SSB-2026-001', N'Rohan Sharma', '9876543210', @BatchSSB,
        HASHBYTES('SHA2_512', CONVERT(VARBINARY(4000), N'Cadet@123') + @Salt1), @Salt1);

INSERT INTO dbo.Programs (Tag, Title, Description, DisplayOrder) VALUES
('SCREENING', N'OIR & PPDT', N'Officer Intelligence Rating and Picture Perception & Discussion Test practice.', 1),
('PSYCHOLOGY', N'TAT · WAT · SRT', N'Thematic Apperception, Word Association and Situation Reaction test batteries.', 2),
('GTO TASKS', N'Ground Tasks', N'Group discussions, planning exercises and outdoor task simulation.', 3),
('FINAL BOARD', N'Personal Interview', N'Mock interview boards with direct feedback from academy faculty.', 4);
