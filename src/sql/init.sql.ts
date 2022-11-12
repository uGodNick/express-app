export const initQueries = {
  usersTable: `
    CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY UNIQUE,
    password VARCHAR(255) NOT NULL);
  `,
  filesTable: `
    CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  `,
};
