import {
  ServerRunner,
  Backend,
  ConsoleStrategy,
  InMemorySessionStore,
} from "microservice-framework";
import { RestService, RestServiceConfig } from "./RestService";
import { WSSConfig, WSServer } from "./WebSocketService";
import path from "path";

const staticDir = path.join(path.resolve(__dirname, "../.."), "/frontend/dist");
const uploadDir = path.join(path.resolve(__dirname, "../../.."), "/uploads");

const restConfig: RestServiceConfig = {
  namespace: "activities",
  serviceId: "rest",
  port: 3000,
  staticDir,
  uploadDir,
  apiPrefix: "/api",
  maxBodySize: 1.1 * 1024 * 1024 * 1024,
  logStrategy: new ConsoleStrategy(),
};

const wsConfig: WSSConfig = {
  interval: 1000,
  concurrencyLimit: 1000,
  requestsPerInterval: 1000,
  namespace: "activities",
  serviceId: "websockets",
  port: 8083,
  logStrategy: new ConsoleStrategy(),
  authentication: {
    allowAnonymous: true,
    required: false,
    sessionStore: new InMemorySessionStore(),
  },
};

const backend = new Backend();
const wsService = new WSServer(backend, wsConfig);
const restService = new RestService(backend, restConfig);
const serverRunner = new ServerRunner();

serverRunner.registerService(restService);
serverRunner.registerService(wsService);
serverRunner.start();
