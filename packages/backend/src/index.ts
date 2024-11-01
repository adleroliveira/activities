import { ServerRunner, Backend } from "microservice-framework";
import { RestService, RestServiceConfig } from "./RestService";

const restConfig: RestServiceConfig = {
  namespace: "activities",
  serviceId: "rest",
  port: 3000,
};

const backend = new Backend();
const restService = new RestService(backend, restConfig);
const serverRunner = new ServerRunner();

serverRunner.registerService(restService);
serverRunner.start();
