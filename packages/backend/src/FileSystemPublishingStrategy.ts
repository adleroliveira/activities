import { IPublishingStrategy } from "microservice-framework";
import { createWriteStream, createReadStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import { join } from "path";

export class FileSystemPublishingStrategy implements IPublishingStrategy {
  private baseDir: string;
  private progressUpdateInterval: number = 1000;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async publishTo(
    data: any,
    path: string,
    contentType: string,
    fileSize?: number
  ): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const fullPath = join(this.baseDir, path);
    const writeStream = createWriteStream(fullPath, {
      highWaterMark: 64 * 1024, // 64KB chunks for writing
    });

    return new Promise((resolve, reject) => {
      let processedBytes = 0;
      let lastProgressUpdate = Date.now();

      const sendProgress = () => {
        if (fileSize) {
          const progress = Math.round((processedBytes / fileSize) * 100);
          console.log({
            type: "upload_progress",
            path: path,
            progress: progress,
            processed: processedBytes,
            total: fileSize,
            speed: this.calculateSpeed(
              processedBytes,
              Date.now() - lastProgressUpdate
            ),
          });
        }
      };

      data.on("data", (chunk: Buffer) => {
        processedBytes += chunk.length;

        // Only send progress updates at intervals to avoid overwhelming the WebSocket
        const now = Date.now();
        if (now - lastProgressUpdate >= this.progressUpdateInterval) {
          sendProgress();
          lastProgressUpdate = now;
        }
      });

      data.on("end", () => {
        // Send final progress update
        sendProgress();
        resolve(path);
      });

      data.on("error", (error: Error) => {
        // Clean up the partial file on error
        writeStream.end();
        unlink(fullPath).catch(console.error);
        reject(error);
      });

      writeStream.on("error", (error: Error) => {
        data.destroy();
        reject(error);
      });

      data.pipe(writeStream);
    });
  }

  private calculateSpeed(bytes: number, milliseconds: number): string {
    const seconds = milliseconds / 1000;
    const bytesPerSecond = bytes / seconds;

    if (bytesPerSecond > 1024 * 1024) {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
    } else if (bytesPerSecond > 1024) {
      return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
    }
    return `${Math.round(bytesPerSecond)} B/s`;
  }

  async readFrom(path: string): Promise<any> {
    const fullPath = join(this.baseDir, path);
    return createReadStream(fullPath, {
      highWaterMark: 64 * 1024, // 64KB chunks for reading
    });
  }
}
