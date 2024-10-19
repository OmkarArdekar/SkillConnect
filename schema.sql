CREATE DATABASE IF NOT EXISTS skillconnect;

USE skillconnect;

CREATE TABLE student (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(50) NOT NULL,
  fullname VARCHAR(100),
  role VARCHAR(10) DEFAULT "student"
);

CREATE TABLE teacher (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(50) NOT NULL,
  fullname VARCHAR(100),
  subject VARCHAR(50),
  rating FLOAT DEFAULT 0,
  exp VARCHAR(10),
  role VARCHAR(10) DEFAULT "teacher",
  rating_count INT DEFAULT 0
);