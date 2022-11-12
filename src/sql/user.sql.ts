export const userQueries = {
  createUser: `
    INSERT INTO users (id, password)
    VALUES (?, ?);
  `,
  getUser: `
    SELECT * FROM users u
    WHERE u.id = ?
  `,
};
