import express from "express";

import webHookRouter from "./webhook.route";

const router = express.Router();

// webhook endpoint
router.use("/webhooks", webHookRouter);

export default router;
