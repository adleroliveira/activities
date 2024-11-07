import {
  IBackEnd,
  WebServer,
  WebServerConfig,
  RequestHandler,
  HttpRequest,
  HttpResponse,
  IRequest,
} from "microservice-framework";
import { FileSystemPublishingStrategy } from "./FileSystemPublishingStrategy";
import Busboy from "busboy";

export interface ProgressUpdate {
  progress: number;
  status: string;
  message: string;
  fileName: string;
}

export interface RestServiceConfig extends WebServerConfig {
  uploadDir: string;
}

export class RestService extends WebServer {
  private uploadDir: string;
  constructor(backend: IBackEnd, config: RestServiceConfig) {
    super(backend, config);
    this.uploadDir = config.uploadDir;
  }

  @RequestHandler<HttpRequest>("GET:/status")
  public async getStatus(req: HttpRequest): Promise<HttpResponse> {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.getServerStatus()),
    };
  }

  @RequestHandler<IRequest<HttpRequest>>("POST:/upload")
  public async uploadFile(
    request: IRequest<HttpRequest>
  ): Promise<HttpResponse> {
    const req = request.body;

    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: { error: "Content-Type must be multipart/form-data" },
      };
    }

    if (!req.rawRequest) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: { error: "Invalid request format" },
      };
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit
        files: 1, // Process one file at a time
      },
      highWaterMark: 64 * 1024, // 64KB chunks for parsing
    });

    const fileStore = new FileSystemPublishingStrategy(this.uploadDir);

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadedFiles: string[] = [];

        busboy.on("file", async (fieldname, file, info) => {
          try {
            const { filename, encoding, mimeType } = info;
            const path = `${Date.now()}-${filename}`;
            this.debug("Uploading file", { filename, path });

            let bytesReceived = 0;
            let lastPercentage = 0;
            const totalBytes = parseInt(
              req.headers["content-length"] || "0",
              10
            );

            file.on("data", async (data: Buffer) => {
              bytesReceived += data.length;
              const currentPercentage = totalBytes
                ? Math.round((bytesReceived / totalBytes) * 100)
                : 0;

              // Only send update if percentage has changed
              if (currentPercentage !== lastPercentage) {
                lastPercentage = currentPercentage;
                await this.sendOneWayMessage("uploadProgress", "websockets", {
                  progress: currentPercentage,
                  status: "uploading",
                  message: `${bytesReceived} bytes uploaded`,
                  fileName: filename,
                });
              }
            });

            await fileStore.publishTo(file, path, mimeType);
            uploadedFiles.push(path);
          } catch (err) {
            reject(err);
          }
        });

        busboy.on("error", reject);
        busboy.on("finish", () => resolve(uploadedFiles));

        // Pipe the raw request to busboy
        req.rawRequest!.pipe(busboy);
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          message: "Files uploaded successfully",
          files: result,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: {
          message: "Upload failed",
          error: error.message,
        },
      };
    }
  }
}
