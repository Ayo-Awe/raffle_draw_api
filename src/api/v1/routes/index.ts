import express from "express";

import controller from "../controllers";
import sharedRouter from "../../shared/routes";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);
router.use("/", sharedRouter);

export default router;
