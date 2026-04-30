import cluster from "cluster";
import dotenvFlow from "dotenv-flow";
import * as os from "os";
import Server from "./modules/main/server";

dotenvFlow.config({
  silent: true,
});

let workers = os.cpus().length;

if (cluster.isPrimary) {
  if (process.env.ENV === "local") {
    workers = 1;
  }
  console.log("start cluster with %s workers", workers);

  for (let i = 0; i < workers; ++i) {
    const worker = cluster.fork().process;
    console.log("worker %s started.", worker.pid);
  }

  cluster.on("exit", (worker) => {
    console.log("worker %s died. restart...", worker.process.pid);
    cluster.fork();
  });
} else {
  Server.getInstance();
}
