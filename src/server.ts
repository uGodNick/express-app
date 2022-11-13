import * as dotenv from "dotenv";

import { App } from "./app";
import { FileController } from "./controllers/file.controller";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { FileService } from "./services/file.service";
import { Connector } from "./utils/connector.util";
import { Redis } from "./utils/redis.util";

dotenv.config();
const connector = new Connector();
const redis = new Redis();

const userService = new UserService(connector, redis);
const fileService = new FileService(connector);

const userController = new UserController(userService);

const authMiddleware = userController.authenticateToken;

const fileController = new FileController(fileService, authMiddleware);

const app = new App([userController, fileController], connector, redis);

app.listen();
