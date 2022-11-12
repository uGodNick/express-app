import express from "express";
import * as bodyParser from "body-parser";
import { Connector } from "./utils/connector.util";
import { initQueries } from "./sql/init.sql";
import { Redis } from "utils/redis.util";

export class App {
  public app: express.Application;
  public port: number;

  constructor(
    controllers: any[],
    port: number,
    connector: Connector,
    redis: Redis
  ) {
    this.app = express();
    this.port = port;

    this.initializeDatabaseConnection(connector);
    this.initializeRedisConnection(redis);
    this.initializeMiddleware();
    this.initializeControllers(controllers);
  }

  private async initializeMiddleware() {
    this.app.use(bodyParser.json());
  }

  private async initializeControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private async initializeDatabaseConnection(connector: Connector) {
    await connector.init();
    await connector.execute(initQueries.usersTable);
    await connector.execute(initQueries.filesTable);
  }

  private async initializeRedisConnection(redis: Redis) {
    await redis.connect();
  }

  public async listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
