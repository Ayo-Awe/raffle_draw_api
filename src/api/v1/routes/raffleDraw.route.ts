import express from "express";

import controller from "../controllers/raffleDraw.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const raffleDrawRouter = express.Router();

raffleDrawRouter.get("/:idOrSlug", controller.getRaffleDraw);
raffleDrawRouter.post("/:idOrSlug/payments", controller.initiateTicketPurchase);

export default raffleDrawRouter;
