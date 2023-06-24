import cors from "cors";
import express from "express";
import morgan from "morgan";

import * as errorMiddlewares from "./api/shared/middlewares/errorMiddlewares";
import responseUtilities from "./api/shared/middlewares/responseUtilities";
import v1Router from "./api/v1/routes";

const app = express();
const whitelist = ["http://localhost:3000"];

// Middlewares
app.use(responseUtilities);
app.use(cors({ origin: whitelist, exposedHeaders: ["X-API-TOKEN"] }));
app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/v1", v1Router);

// Error middlewares
app.use(errorMiddlewares.errorLogger);
app.use(errorMiddlewares.errorHandler);

// 404 Handler
app.use((req, res) => {
  res.error(404, "Resource not found", "UNKNOWN_ENDPOINT");
});

export default app;
