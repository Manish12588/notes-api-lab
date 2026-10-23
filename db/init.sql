CREATE DATABASE IF NOT EXISTS notesdb;
USE notesdb;

CREATE TABLE IF NOT EXISTS notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(100) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO notes (title, content) VALUES
  ('First note', 'Hello from the database'),
  ('Learn REST', 'Practice GET, POST, PUT, PATCH, DELETE');
