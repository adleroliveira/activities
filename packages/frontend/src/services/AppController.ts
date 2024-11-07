import { CommunicationsManager } from "microservice-framework";

export interface UploadStatusUpdate {
  progress: number;
  status: string;
  message: string;
  fileName: string;
}

class AppController {
  private communicationsManager: CommunicationsManager;

  constructor() {
    this.communicationsManager = new CommunicationsManager({
      url: "ws:/localhost:8083/ws",
    });

    this.communicationsManager.onOpen(() => {
      console.log("Communications manager opened");
    });

    this.communicationsManager.onError((error) => {
      console.error(error);
    });
  }

  public registerMessageHandler(
    requestType: string,
    handler: (status: UploadStatusUpdate) => void
  ) {
    console.log(`Registering message handler for ${requestType}`);
    this.communicationsManager.registerMessageHandler(requestType, handler);
  }
}

export const appController = new AppController();
