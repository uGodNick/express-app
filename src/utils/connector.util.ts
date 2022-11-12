import { createPool, Pool } from "mysql";

export class Connector {
  private pool: Pool | null;
  constructor() {
    this.pool = null;
  }

  public init = async () => {
    try {
      this.pool = createPool({
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });

      console.debug("MySql Adapter Pool generated successfully");
    } catch (error) {
      console.error("[mysql.connector][init][Error]: ", error);
      throw new Error("failed to initialized pool");
    }
  };

  public execute = async <T>(
    query: string,
    params?: string[] | Object
  ): Promise<T> => {
    try {
      if (!this.pool) {
        throw new Error(
          "Pool was not created. Ensure pool is created when running the app."
        );
      }
      return await new Promise<T>((resolve, reject) => {
        this.pool!.query(query, params, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    } catch (error) {
      console.error("[mysql.connector][execute][Error]: ", error);
      throw new Error("failed to execute MySQL query");
    }
  };
}
