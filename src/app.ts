import cors from "cors";
import express from "express";
import morgan from "morgan";

import * as errorMiddlewares from "./api/middlewares/errorMiddlewares";
import responseUtilities from "./api/middlewares/responseUtilities";
import v1Router from "./api/v1/routes";
import { conditionalMiddleware } from "./utils/expressHelpers";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import emailQueue from "./queues/email.queue";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

const app = express();
const whitelist = ["http://localhost:3000"];

// Middlewares
app.use(responseUtilities);
app.use(cors({ origin: whitelist, exposedHeaders: ["X-API-TOKEN"] }));

app.use(
  conditionalMiddleware(
    express.json(),
    (req) => !req.path.includes("/webhooks/clerk")
  )
);
app.use(morgan("dev"));
// API route
app.use("/api/v1", v1Router);
app.use("/admin/queues", serverAdapter.getRouter());

// Error middlewares
app.use(errorMiddlewares.errorLogger);
app.use(errorMiddlewares.errorHandler);

// 404 Handler
app.use((req, res) => {
  res.error(404, "Resource not found", "UNKNOWN_ENDPOINT");
});

export default app;
