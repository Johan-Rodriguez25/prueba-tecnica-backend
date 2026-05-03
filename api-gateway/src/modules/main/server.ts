import express, { Application } from "express";

import compression from "compression";
import cors from "cors";
import dotenvFlow from "dotenv-flow";
import helmet from "helmet";
import { createSettlementsRouter } from "../settlements/settlements.module";
import { createTransactionsRouter } from "../transactions/transactions.module";
import { dualAuthMiddleware } from "./middlewares/dual-auth.middleware";
import { rateLimitByApiKeyMiddleware } from "./middlewares/rate-limit.middleware";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { createSwaggerRouter } from "./swagger/swagger";

dotenvFlow.config({
  silent: true,
});

class Server {
  private port: number;
  public static instance: Server;
  public app: Application;
  private apiPath = {
    movies: "/v1/api/movies",
    uploadPoster: "/v1/api/upload/poster",
  };

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3001;
    this.init();
  }

  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }

    return Server.instance;
  }

  private async init(): Promise<void> {
    try {
      this.listenStatusConnection();
    } catch (error) {
      console.log(error);
    }
  }

  private async listenStatusConnection() {
    try {
      this.middlewares();
      this.routes();
      this.listen();
    } catch (error) {
      throw new Error("El servidor no se pudo iniciar");
    }
  }

  private middlewares(): void {
    this.app.use(requestLoggerMiddleware());
    this.app.use(cors());
    this.app.use(
      express.urlencoded({
        limit: "6mb",
        extended: true,
        parameterLimit: 60000,
      }),
    );
    this.app.use(express.json({ limit: "6mb" }));
    this.app.use(helmet());
    this.app.use(compression({ level: 9 }));
  }

  private routes(): void {
    this.app.get("/", (req: any, res: any) =>
      res.status(200).json({ ok: true }),
    );

    this.app.use(createSwaggerRouter());
    this.app.use("/api/v1", dualAuthMiddleware(), rateLimitByApiKeyMiddleware());
    this.app.use("/api/v1/transactions", createTransactionsRouter());
    this.app.use("/api/v1/settlements", createSettlementsRouter());
  }

  private listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en ${this.port}`);
    });
  }
}

export default Server;
