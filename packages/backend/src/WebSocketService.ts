import {
  IBackEnd,
  WebSocketServer,
  WebSocketServerConfig,
  RequestHandler,
  IRequest,
  RequestBuilder,
} from "microservice-framework";
import { ProgressUpdate } from "./RestService";

export interface WSSConfig extends WebSocketServerConfig {}

export class WSServer extends WebSocketServer {
  constructor(backend: IBackEnd, config: WSSConfig) {
    super(backend, config);
  }

  @RequestHandler<IRequest<ProgressUpdate>>("uploadProgress")
  async sendUploadStatusUpdate(request: IRequest<ProgressUpdate>) {
    const progressUpdateRequest = new RequestBuilder<ProgressUpdate>(
      request.body
    )
      .setRequestType("uploadProgress")
      .setRequiresResponse(false)
      .build();

    this.broadcast(progressUpdateRequest);
    return { success: true };
  }
}
