export const fileQueries = {
  createFile: `
      INSERT INTO files (name, extension, mime_type, size)
      VALUES (?, ?, ?, ?);
    `,
  getFiles: `
      SELECT * FROM files
      ORDER BY id
      LIMIT ?, ?
    `,
  getFile: `
      SELECT * FROM files f
      WHERE f.id = ?;
    `,
  deleteFile: `
      DELETE FROM files
      WHERE id = ?;
    `,
  updateFile: `
      UPDATE files
      SET 
        name = ?,
        extension = ?,
        mime_type = ?,
        size = ?
       WHERE id = ?;
    `,
};
