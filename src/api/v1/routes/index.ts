import express from "express";

import { welcomeHandler } from "../controllers";

const router = express.Router();

// Welcome endpoint
router.get("/", welcomeHandler);

export default router;
