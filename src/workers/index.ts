import { emailWorker } from "./email.worker";

export async function startWorkers() {
  emailWorker.run();
  console.log("Successfully started workers");
}
