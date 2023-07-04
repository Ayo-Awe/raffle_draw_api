import express from "express";

import controller from "../controllers/user.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, controller.getLoggedInUser);
router.get("/teams", requireAuth, controller.getUserTeams);

export default router;
