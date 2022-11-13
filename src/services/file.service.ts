import { IFile } from "../interfaces/file.interface";
import { fileQueries } from "../sql/file.sql";
import { Connector } from "../utils/connector.util";

export class FileService {
  private connector: Connector;

  constructor(connector: Connector) {
    this.connector = connector;
  }

  public uploadFile = async (dto: IFile): Promise<void> => {
    await this.connector.execute(fileQueries.createFile, [
      dto.name,
      dto.extension,
      dto.mimetype,
      dto.size,
    ]);
  };

  public updateFile = async (dto: IFile): Promise<void> => {
    await this.connector.execute(fileQueries.updateFile, [
      dto.name,
      dto.extension,
      dto.mimetype,
      dto.size,
      dto.id,
    ]);
  };

  public getFile = async (id: number): Promise<IFile | null> => {
    const data = await this.connector.execute<IFile[]>(fileQueries.getFile, [
      id,
    ]);

    return data.length ? data[0] : null;
  };

  public getFiles = async (
    currentPage: number,
    listSize: number
  ): Promise<IFile[] | null> => {
    return await this.connector.execute<IFile[]>(fileQueries.getFiles, [
      (currentPage - 1) * listSize,
      listSize,
    ]);
  };

  public deleteFile = async (id: number): Promise<void> => {
    await this.connector.execute(fileQueries.deleteFile, [id]);
  };
}
