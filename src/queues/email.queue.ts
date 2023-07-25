import { Queue } from "bullmq";

const emailQueue = new Queue("email", {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
});

export default emailQueue;
