import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";

export class UserController {
  public path = "/";
  public router = Router();
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.post(this.path + "signup", this.signUpUser);
    this.router.post(this.path + "signin", this.signInUser);
    this.router.post(
      this.path + "signin/new_token",
      this.authenticateToken,
      this.updateUserToken
    );
    this.router.get(
      this.path + "info",
      this.authenticateToken,
      this.getUserInfo
    );
    this.router.get(
      this.path + "logout",
      this.authenticateToken,
      this.logoutUser
    );
  }

  private signUpUser = async (request: Request, response: Response) => {
    const tokens = await this.userService.signUpUser({
      id: request.body.id,
      password: request.body.password,
    });

    if (!tokens) {
      response.status(401).send({ message: "Unauthorized" });
    } else {
      response.status(201).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
  };

  private signInUser = async (request: Request, response: Response) => {
    const tokens = await this.userService.signInUser({
      id: request.body.id,
      password: request.body.password,
    });

    if (!tokens) {
      response.status(401).send({ message: "Unauthorized" });
    } else {
      response.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
  };

  private updateUserToken = async (request: Request, response: Response) => {
    const tokens = await this.userService.updateToken(
      request.body.refreshToken
    );

    if (!tokens) {
      response.status(401).send({ message: "Unauthorized" });
    } else {
      response.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
  };

  private getUserInfo = async (request: Request, response: Response) => {
    response.status(200).send({ userId: request.userId });
  };

  private logoutUser = async (request: Request, response: Response) => {
    const { token, tokenExp } = request;
    await this.userService.logout(token, tokenExp);
    response.status(200).send({ message: "log outed" });
  };

  private authenticateToken = async (
    request: Request,
    response: Response,
    next: any
  ) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return response.status(401).send({
        message: "No token provided",
      });
    }

    const inDenyList = await this.userService.inDenyList(token);
    if (inDenyList) {
      return response.status(401).send({
        message: "JWT Rejected",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (error, payload) => {
      if (error) {
        return response.status(401).send({
          status: "error",
          message: error.message,
        });
      }
      const user = payload as jwt.JwtPayload;
      request.userId = user.userId;
      request.tokenExp = user.exp!;
      request.token = token;

      next();
    });
  };
}
