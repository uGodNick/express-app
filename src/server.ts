import * as dotenv from "dotenv";

import { UserService } from "./services/user.service";
import { App } from "./app";
import { FileController } from "./controllers/file.controller";
import { UserController } from "./controllers/user.controller";
import { Connector } from "./utils/connector.util";
import { Redis } from "./utils/redis.util";

dotenv.config();
const connector = new Connector();
const redis = new Redis();

const app = new App(
  [
    new FileController(),
    new UserController(
      new UserService(
        connector,
        redis,
        process.env.REFRESH_TOKEN_SECRET!,
        process.env.ACCESS_TOKEN_SECRET!
      )
    ),
  ],
  Number(process.env.APP_PORT!),
  connector,
  redis
);

app.listen();
