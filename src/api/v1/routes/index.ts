import express from "express";

import controller from "../controllers";
import sharedRouter from "../../shared/routes";
import userRouter from "./user.route";
import teamRouter from "./team.route";
import authRouter from "./auth.route";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);
router.use("/me", userRouter);
router.use("/teams", teamRouter);
router.use("/", sharedRouter);

export default router;
