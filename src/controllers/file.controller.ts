import { Router, Request, Response, RequestHandler } from "express";
import { unlink } from "fs";
import multer, { diskStorage } from "multer";
import { join } from "path";

import { FileService } from "../services/file.service";

const storageDir = join(__dirname, "..", "..", "uploads");
const storage = diskStorage({
  destination: storageDir,
  filename: (req, file, cb) => {
    cb(null, "" + Date.now() + file.originalname);
  },
});
const uploader = multer({
  storage,
});

export class FileController {
  public path = "/file";
  public router = Router();
  private fileService: FileService;
  private authMiddleware: RequestHandler;

  constructor(fileService: FileService, authMiddleware: RequestHandler) {
    this.authMiddleware = authMiddleware;
    this.fileService = fileService;
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path + "/upload",
      this.authMiddleware,
      uploader.single("file"),
      this.uploadFile
    );
    this.router.get(
      this.path + "/list" + "/:page?" + "/:list_size?",
      this.authMiddleware,
      this.getFiles
    );
    this.router.get(this.path + "/:id", this.authMiddleware, this.getFile);
    this.router.delete(
      this.path + "/delete/:id",
      this.authMiddleware,
      this.deleteFile
    );
    this.router.get(
      this.path + "/download/:id",
      this.authMiddleware,
      this.downloadFile
    );
    this.router.put(
      this.path + "/update/:id",
      this.authMiddleware,
      uploader.single("file"),
      this.updateFile
    );
  }

  private uploadFile = async (request: Request, response: Response) => {
    const file = request.file;

    if (!file) {
      return response.status(400).send({ message: "File is not provided!" });
    }
    await this.fileService.uploadFile({
      name: file.filename,
      extension: file.originalname.split(".").at(-1),
      mimetype: file.mimetype,
      size: file.size,
    });
    return response.status(201).send({ message: "File is uploaded!" });
  };

  private getFiles = async (request: Request, response: Response) => {
    const { list_size, page } = request.params;
    const listSize = list_size ? Number(list_size) : 10;
    const currentPage = page ? Number(page) : 1;

    const list = await this.fileService.getFiles(currentPage, listSize);
    return response.status(200).send(list);
  };

  private getFile = async (request: Request, response: Response) => {
    const id = Number(request.params.id);
    const file = await this.fileService.getFile(id);

    if (!file) {
      return response
        .status(400)
        .send({ message: "File with this id is not found!" });
    }

    return response.status(200).send(file);
  };

  private downloadFile = async (request: Request, response: Response) => {
    const id = Number(request.params.id);
    const file = await this.fileService.getFile(id);
    if (!file) {
      return response
        .status(400)
        .send({ message: "File with this id is not found!" });
    }
    response.download(storageDir + "/" + file.name);
  };

  private deleteFile = async (request: Request, response: Response) => {
    const id = Number(request.params.id);
    const file = await this.fileService.getFile(id);
    if (!file) {
      return response
        .status(400)
        .send({ message: "File with this id is not found!" });
    }

    await this.fileService.deleteFile(id);
    unlink(storageDir + "/" + file.name, (err) => {
      if (err) {
        return response.status(500).send(err);
      } else {
        return response.status(202).send({ message: "File is deleted!" });
      }
    });
  };

  private updateFile = async (request: Request, response: Response) => {
    const id = Number(request.params.id);
    const newFile = request.file;
    const file = await this.fileService.getFile(id);
    if (!file) {
      return response
        .status(400)
        .send({ message: "File with this id is not found!" });
    }

    if (!newFile) {
      return response.status(400).send({ message: "File is not provided!" });
    }

    await this.fileService.updateFile({
      id: id,
      name: newFile.filename,
      extension: newFile.originalname.split(".").at(-1),
      mimetype: newFile.mimetype,
      size: newFile.size,
    });

    unlink(storageDir + "/" + file.name, (err) => {
      if (err) {
        return response.status(500).send(err);
      }
    });
    return response.status(201).send({ message: "File is updated" });
  };
}
