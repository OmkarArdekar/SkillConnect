TRUNCATE TABLE teacher;

INSERT INTO teacher (id, username, password, fullname, subject, rating, exp, role, rating_count, image) VALUES
('T001', 'john_doe', 'hashedpassword123', 'John Doe', 'Mathematics', 4.5, '10 years', 'teacher', 20, NULL),
('T002', 'jane_smith', 'hashedpassword456', 'Jane Smith', 'Physics', 4.8, '8 years', 'teacher', 35, NULL),
('T003', 'robert_brown', 'hashedpassword789', 'Robert Brown', 'Computer Science', 4.2, '5 years', 'teacher', 15, NULL),
('T004', 'linda_miller', 'hashedpassword101', 'Linda Miller', 'Biology', 4.7, '12 years', 'teacher', 25, NULL),
('T005', 'david_wilson', 'hashedpassword202', 'David Wilson', 'Chemistry', 4.3, '7 years', 'teacher', 18, NULL),
('T006', 'susan_clark', 'hashedpassword303', 'Susan Clark', 'History', 4.6, '9 years', 'teacher', 22, NULL),
('T007', 'michael_white', 'hashedpassword404', 'Michael White', 'English', 4.4, '6 years', 'teacher', 19, NULL),
('T008', 'emily_jackson', 'hashedpassword505', 'Emily Jackson', 'Geography', 4.9, '11 years', 'teacher', 40, NULL),
('T009', 'mark_hall', 'hashedpassword606', 'Mark Hall', 'Economics', 4.1, '4 years', 'teacher', 10, NULL),
('T010', 'sarah_adams', 'hashedpassword707', 'Sarah Adams', 'Political Science', 4.8, '7 years', 'teacher', 30, NULL);
