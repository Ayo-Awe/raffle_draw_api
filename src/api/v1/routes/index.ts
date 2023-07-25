import express from "express";

import controller from "../controllers";
import sharedRouter from "../../shared/routes";
import userRouter from "./user.route";
import teamRouter from "./team.route";
import bankRouter from "./bank.route";
import raffleDrawRouter from "./raffleDraw.route";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);
router.use("/me", userRouter);
router.use("/teams", teamRouter);
router.use("/banks", bankRouter);
router.use("/", sharedRouter);
router.use("/raffle-draws", raffleDrawRouter);

export default router;
