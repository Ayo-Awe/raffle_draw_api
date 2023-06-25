import express from "express";

import controller from "../controllers/webhook.controller";

const router = express.Router();

// Welcome endpoint
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  controller.clerkHandler
);

export default router;
