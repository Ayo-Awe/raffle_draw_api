import express from "express";

import controller from "../controllers/bank.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const bankRouter = express.Router();

bankRouter.get("/", requireAuth, controller.getAllBanks);
bankRouter.get("/resolve", requireAuth, controller.resolveBankAccount);

export default bankRouter;
