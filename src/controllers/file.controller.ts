import { Router, Request, Response } from "express";

export class FileController {
  public path = "/file";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      this.path + "/list" + ":list_size?" + ":page?",
      this.getFiles
    );
    this.router.get(this.path + "/:id", this.getFile);
    this.router.delete(this.path + "/delete/:id", this.deleteFile);
    this.router.get(this.path + "/download/:id", this.downloadFile);
    this.router.put(this.path + "/update/:id", this.updateFile);
  }

  private getFiles = (request: Request, response: Response) => {
    response.send("true");
  };

  private getFile = (request: Request, response: Response) => {
    response.send("true");
  };

  private downloadFile = (request: Request, response: Response) => {
    response.send("true");
  };

  private deleteFile = (request: Request, response: Response) => {
    response.send("true");
  };

  private updateFile = (request: Request, response: Response) => {
    response.send("true");
  };
}
