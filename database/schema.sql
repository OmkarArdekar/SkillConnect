CREATE DATABASE IF NOT EXISTS skillconnect;

USE skillconnect;

CREATE TABLE student (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100) NOT NULL,
  fullname VARCHAR(100),
  role VARCHAR(10) DEFAULT "student",
  image LONGBLOB
);

CREATE TABLE teacher (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100) NOT NULL,
  fullname VARCHAR(100),
  subject VARCHAR(50),
  rating FLOAT DEFAULT 0,
  exp VARCHAR(10),
  role VARCHAR(10) DEFAULT "teacher",
  rating_count INT DEFAULT 0,
  image LONGBLOB
);

CREATE TABLE feedbacks (
  id VARCHAR(50) NOT NULL,
  username VARCHAR(50),
  feedback VARCHAR(100)
);