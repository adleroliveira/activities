import { IBackEnd, WebServer, WebServerConfig } from "microservice-framework";

export interface RestServiceConfig extends WebServerConfig {}

export class RestService extends WebServer {
  constructor(backend: IBackEnd, config: RestServiceConfig) {
    super(backend, config);
  }
}
