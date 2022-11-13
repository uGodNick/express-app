import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";

import { initQueries } from "./sql/init.sql";
import { Connector } from "./utils/connector.util";
import { Redis } from "./utils/redis.util";

export class App {
  public app: express.Application;

  constructor(controllers: any[], connector: Connector, redis: Redis) {
    this.app = express();

    this.initializeDatabaseConnection(connector);
    this.initializeRedisConnection(redis);
    this.initializeMiddleware();
    this.initializeControllers(controllers);
  }

  private async initializeMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
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
    this.app.listen(process.env.APP_PORT!, () => {
      console.log(`App listening on the port ${process.env.APP_PORT!}`);
    });
  }
}
